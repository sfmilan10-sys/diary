/**
 * Run after Render deploy: smoke test → save endpoint → doctor.
 *
 * Usage:
 *   npm run finish:after-render -- https://YOUR-RENDER-URL
 */

const { spawnSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const raw = process.argv[2];

if (!raw) {
  console.error('\nUsage: npm run finish:after-render -- https://YOUR-RENDER-URL\n');
  process.exit(1);
}

function run(label, cmd, args) {
  console.log(`\n--- ${label} ---\n`);
  const result = spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit', shell: true });
  if (result.status !== 0) {
    console.error(`\n✗ ${label} failed (exit ${result.status})\n`);
    process.exit(result.status ?? 1);
  }
}

run('Smoke test', 'npm', ['run', 'backend:smoke', '--', raw.trim()]);
run('Save endpoint', 'npm', ['run', 'set:endpoint', '--', raw.trim()]);
run('Doctor', 'npm', ['run', 'doctor:testing']);

console.log('\n✓ Backend is reachable and endpoint is saved in .env.');
console.log('Next: log in to Expo (eas login), then: npm run android:preview\n');
