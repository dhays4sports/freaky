import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const results = [];
const check = (name, condition) => {
  assert.ok(condition, name);
  results.push(name);
  console.log('PASS', name);
};

const config = read('shared/config.js');
const script = read('shared/script.js');
const workerSource = read('_worker.js');
const routes = ['home','buyer','auto-bundle','healthcare','teachers','tech','engineers'];

check('client prefers same-origin lead proxy', config.includes('leadProxyEndpoint: "/api/lead"') && script.includes("config.leadProxyEndpoint||config.formEndpoint"));
check('direct Formspree destination remains configured', config.includes('https://formspree.io/f/mojgnegn'));
check('worker owns /api/lead and forwards to Formspree', workerSource.includes("const LEAD_PROXY_PATH = '/api/lead'") && workerSource.includes("DEFAULT_FORMSPREE_ENDPOINT = 'https://formspree.io/f/mojgnegn'") && workerSource.includes('async function handleLeadProxy'));
check('worker does not log lead bodies', !/console\.(?:log|info|warn|error)\([^\n]*(?:formData|outbound|fields|lead)/i.test(workerSource));
check('optional profile preparation is fail-safe', script.includes('Profile/handoff preparation is optional') && script.includes('prospectProfile = null;'));

for (const route of routes) {
  const html = read(`${route}/index.html`);
  check(`${route} has direct Formspree native fallback`, /<form[^>]*action="https:\/\/formspree\.io\/f\/mojgnegn"[^>]*id="leadForm"|<form[^>]*id="leadForm"[^>]*action="https:\/\/formspree\.io\/f\/mojgnegn"/.test(html));
}
check('LIFE remains outside Formspree lead transport', !read('life/index.html').includes('formspree.io/f/mojgnegn'));

// Runtime Worker contract using a mocked Formspree upstream.
const workerModuleUrl = pathToFileURL(path.join(root, '_worker.js')).href + `?qa=${Date.now()}`;
const worker = (await import(workerModuleUrl)).default;
const originalFetch = globalThis.fetch;
let upstreamCall = null;
globalThis.fetch = async (url, init = {}) => {
  upstreamCall = { url: String(url), init };
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

try {
  const body = new FormData();
  body.append('first_name', 'QA');
  body.append('last_name', 'Lead');
  body.append('phone', '4085550100');
  body.append('email', 'qa@example.com');
  body.append('consent', 'on');
  const request = new Request('https://408farmers.com/api/lead', {
    method: 'POST',
    headers: { Origin: 'https://408farmers.com', 'Sec-Fetch-Site': 'same-origin' },
    body
  });
  const response = await worker.fetch(request, { ASSETS: { fetch: async () => new Response('asset', { status: 200 }) } });
  check('worker proxy returns success for accepted Formspree delivery', response.status === 200 && (await response.json()).ok === true);
  check('worker proxy targets the existing Formspree form', upstreamCall?.url === 'https://formspree.io/f/mojgnegn');
  const forwarded = upstreamCall?.init?.body;
  check('worker forwards lead fields as FormData', forwarded instanceof FormData && forwarded.get('email') === 'qa@example.com' && forwarded.get('consent') === 'on');

  const getResponse = await worker.fetch(new Request('https://408farmers.com/api/lead', { method: 'GET' }), { ASSETS: { fetch: async () => new Response('asset') } });
  check('worker lead proxy rejects non-POST requests', getResponse.status === 405);
} finally {
  globalThis.fetch = originalFetch;
}

console.log(`408-FORMSPREE-HOTFIX QA: ${results.length}/${results.length} passed`);
