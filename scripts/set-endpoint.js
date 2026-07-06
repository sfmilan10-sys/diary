/**
 * Set the Expo reflection endpoint safely in the root .env.
 *
 * Usage:
 *   npm run set:endpoint -- https://YOUR-RENDER-URL
 *   npm run set:endpoint -- https://YOUR-RENDER-URL/api/reflection
 *
 * - Appends /api/reflection if only the base URL is given.
 * - Requires https://.
 * - Rejects localhost / placeholder hosts.
 * - Creates or updates EXPO_PUBLIC_AI_REFLECTION_ENDPOINT, preserving other lines.
 * - Never writes OPENAI_API_KEY.
 * No external npm packages.
 */

const fs = require('fs');
const path = require('path');

const ENV_PATH = path.resolve(__dirname, '..', '.env');
const KEY = 'EXPO_PUBLIC_AI_REFLECTION_ENDPOINT';
const REFLECTION_PATH = '/api/reflection';
const REJECTED_HOSTS = [
  'localhost',
  '127.0.0.1',
  'example.com',
  'your-domain.com',
  'your-backend-url',
];

function bail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

const raw = process.argv[2];

if (!raw) {
  bail(
    'Missing URL.\n  Usage: npm run set:endpoint -- https://YOUR-RENDER-URL\n' +
      '     or: npm run set:endpoint -- https://YOUR-RENDER-URL/api/reflection',
  );
}

let input = raw.trim().replace(/\/+$/, '');

if (!/^https:\/\//i.test(input)) {
  bail(`Endpoint must start with https:// (got: ${input})`);
}

const lower = input.toLowerCase();
const rejected = REJECTED_HOSTS.find((host) => lower.includes(host));
if (rejected) {
  bail(`Refusing to use placeholder/local host "${rejected}". Use your real Render HTTPS URL.`);
}

// Normalize to the full reflection endpoint.
let endpoint;
if (/\/api\/reflection$/i.test(input)) {
  endpoint = input;
} else {
  endpoint = `${input}${REFLECTION_PATH}`;
}

// Read existing .env (if any) and replace/insert the key, preserving other lines.
let lines = [];
if (fs.existsSync(ENV_PATH)) {
  lines = fs.readFileSync(ENV_PATH, 'utf8').split(/\r?\n/);
}

// Safety: never let this script write an OpenAI key.
lines = lines.filter((line) => !/^\s*OPENAI_API_KEY\s*=/.test(line));

const newLine = `${KEY}=${endpoint}`;
let replaced = false;
lines = lines.map((line) => {
  if (new RegExp(`^\\s*${KEY}\\s*=`).test(line)) {
    replaced = true;
    return newLine;
  }
  return line;
});

if (!replaced) {
  // Drop trailing empty lines, append cleanly.
  while (lines.length && lines[lines.length - 1].trim() === '') {
    lines.pop();
  }
  lines.push(newLine);
}

// Ensure a single trailing newline.
const output = `${lines.join('\n').replace(/\n+$/, '')}\n`;
fs.writeFileSync(ENV_PATH, output, 'utf8');

console.log(`\n✓ Endpoint saved to .env:\n  ${KEY}=${endpoint}\n`);
console.log('Reminder: EXPO_PUBLIC_* values are bundled at build time.');
console.log('You must REBUILD the APK for this to take effect:\n  npm run android:preview\n');
