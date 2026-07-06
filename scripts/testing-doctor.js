/**
 * Testing readiness doctor for Future Self Diary.
 *
 * Run: npm run doctor:testing
 *
 * Verifies the repo is ready to build a personal Android APK that uses real
 * OpenAI reflections through a public backend. No external npm packages.
 *
 * Exit codes:
 *   0 — only PASS/WARN (safe to proceed; warnings are informational)
 *   1 — at least one dangerous FAIL (e.g. OpenAI key in app, sk- in app files)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

let hasDangerousFailure = false;

function p(...parts) {
  return path.join(ROOT, ...parts);
}

function read(file) {
  try {
    return fs.readFileSync(p(file), 'utf8');
  } catch {
    return null;
  }
}

function exists(file) {
  return fs.existsSync(p(file));
}

function pass(msg) {
  console.log(`  PASS  ${msg}`);
}

function warn(msg) {
  console.log(`  WARN  ${msg}`);
}

function fail(msg, dangerous = false) {
  console.log(`  ${dangerous ? 'FAIL!' : 'FAIL '} ${msg}`);
  if (dangerous) {
    hasDangerousFailure = true;
  }
}

function check(label, ok, okMsg, badMsg, opts = {}) {
  if (ok) {
    pass(okMsg ?? label);
  } else if (opts.dangerous) {
    fail(badMsg ?? label, true);
  } else if (opts.warnOnly) {
    warn(badMsg ?? label);
  } else {
    fail(badMsg ?? label);
  }
}

console.log('\nFuture Self Diary — testing readiness doctor\n');

// --- Project files ---------------------------------------------------------
console.log('Project files:');
check('app.json', exists('app.json'), 'app.json present', 'app.json missing');
check('eas.json', exists('eas.json'), 'eas.json present', 'eas.json missing');
check(
  'backend/package.json',
  exists('backend/package.json'),
  'backend/package.json present',
  'backend/package.json missing',
);
check(
  'reflection route',
  exists('backend/app/api/reflection/route.ts'),
  'backend POST /api/reflection route present',
  'backend reflection route missing',
);
check(
  'smoke test',
  exists('backend/scripts/smoke-test.js'),
  'backend smoke-test.js present',
  'backend smoke-test.js missing',
);

// --- Secret safety ---------------------------------------------------------
console.log('\nSecret safety:');
const rootEnv = read('.env');
if (rootEnv === null) {
  warn('.env not found yet (run set:endpoint after deploying the backend)');
} else if (/^\s*OPENAI_API_KEY\s*=/m.test(rootEnv)) {
  fail('OPENAI_API_KEY found in root .env — remove it (keys belong on the backend only)', true);
} else {
  pass('root .env does not contain OPENAI_API_KEY');
}

// Scan app source for an accidental sk- key (exclude backend + node_modules + lockfiles).
const skPattern = /\bsk-[A-Za-z0-9_-]{16,}/;
const appScanRoots = ['app', 'src'];
let skFound = false;
function scanDir(rel) {
  const abs = p(rel);
  let entries;
  try {
    entries = fs.readdirSync(abs, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const childRel = path.join(rel, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      scanDir(childRel);
    } else if (/\.(ts|tsx|js|jsx|json)$/.test(entry.name)) {
      const content = read(childRel);
      if (content && skPattern.test(content)) {
        skFound = true;
        fail(`possible OpenAI key (sk-...) in ${childRel}`, true);
      }
    }
  }
}
appScanRoots.forEach(scanDir);
if (!skFound) {
  pass('no sk- OpenAI key found in app source (app/, src/)');
}

// --- Endpoint configuration ------------------------------------------------
console.log('\nEndpoint configuration:');
const PLACEHOLDERS = ['localhost', '127.0.0.1', 'your-domain.com', 'your-backend-url', 'example.com'];
let endpoint = null;
if (rootEnv) {
  const match = rootEnv.match(/^\s*EXPO_PUBLIC_AI_REFLECTION_ENDPOINT\s*=\s*(.+)\s*$/m);
  endpoint = match ? match[1].trim() : null;
}

if (!endpoint) {
  warn(
    'EXPO_PUBLIC_AI_REFLECTION_ENDPOINT not set — app will run in local mode. ' +
      'Run: npm run set:endpoint -- https://YOUR-RENDER-URL',
  );
} else {
  const lower = endpoint.toLowerCase();
  if (!lower.startsWith('https://')) {
    fail(`endpoint must start with https:// (got: ${endpoint})`);
  } else {
    pass('endpoint uses https://');
  }
  const placeholder = PLACEHOLDERS.find((m) => lower.includes(m));
  if (placeholder) {
    fail(`endpoint still contains placeholder "${placeholder}" — set your real Render URL`);
  } else {
    pass('endpoint has no placeholder/localhost host');
  }
}

// --- Package scripts -------------------------------------------------------
console.log('\nPackage scripts:');
let scripts = {};
try {
  scripts = JSON.parse(read('package.json') || '{}').scripts || {};
} catch {
  scripts = {};
}
for (const name of ['android:preview', 'backend:smoke', 'set:endpoint', 'doctor:testing']) {
  check(name, Boolean(scripts[name]), `script "${name}" present`, `script "${name}" missing`);
}

// --- Summary ---------------------------------------------------------------
console.log('');
if (hasDangerousFailure) {
  console.log('Result: FAIL — fix the dangerous item(s) above before building.\n');
  process.exit(1);
}
console.log('Result: OK — review any WARN lines, then you can build.\n');
process.exit(0);
