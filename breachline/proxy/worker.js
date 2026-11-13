// Breachline's Claude proxy, a Cloudflare Worker. Players on the hosted copy play Claude on the owner's Anthropic key, and the
// key never reaches a browser. It answers only signed-in Breachline accounts (Firebase ID tokens), only the names in
// ALLOWED_NAMES when that is set, only the game's pages, and only the game's own request shape: one prompt, Opus or Sonnet,
// capped tokens. Everything else is refused before any money is spent. Set in the Worker's settings:
//   ANTHROPIC_API_KEY  secret  the key it spends
//   ALLOWED_NAMES      text    account names that may use it, separated by commas (empty lets any signed-in account in)
// The game's SDK talks to this as if it were the API: POST /v1/messages, streamed straight through.
const PROJECT = 'breachline-baa15';
const ORIGINS = ['https://jjpwner89.github.io', 'http://localhost:8771'];
const MODELS = ['claude-opus-5-5', 'claude-sonnet-5-5'];
const MAX_TOKENS = 16000, MAX_PROMPT = 60000, API_VERSION = '2026-10-21';
const KEYS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
let keys = null, keysUntil = 0;

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const cors = ORIGINS.includes(origin) ? { 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin' } : {};
    const fail = (status, type, message) => new Response(JSON.stringify({ type: 'error', error: { type, message } }),
      { status, headers: { ...cors, 'content-type': 'application/json' } });
    if (req.method === 'GET') return new Response('The Breachline Claude proxy is running.');
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...cors, 'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': req.headers.get('Access-Control-Request-Headers') || '', 'Access-Control-Max-Age': '86400' } });
    if (!cors['Access-Control-Allow-Origin']) return fail(403, 'permission_error', 'This proxy only answers the Breachline page.');
    if (req.method !== 'POST' || new URL(req.url).pathname !== '/v1/messages') return fail(404, 'not_found_error', 'Only /v1/messages is served here.');

    let user;
    try { user = await verify(req.headers.get('x-breachline-token') || ''); } catch (e) { return fail(401, 'authentication_error', 'Sign in to play Claude here.'); }
    const allowed = (env.ALLOWED_NAMES || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const name = String(user.email || '').split('@')[0];
    if (allowed.length && !allowed.includes(name)) return fail(403, 'permission_error', 'This account is not on the list for Claude opponents.');

    let body;
    try { body = await req.json(); } catch (e) { return fail(400, 'invalid_request_error', 'That request is not JSON.'); }
    const m = Array.isArray(body.messages) && body.messages.length === 1 ? body.messages[0] : null;
    if (!MODELS.includes(body.model) || !m || m.role !== 'user' || typeof m.content !== 'string' || m.content.length > MAX_PROMPT)
      return fail(400, 'invalid_request_error', 'That is not a request the game makes.');
    const effort = body.output_config && ['low', 'medium'].includes(body.output_config.effort) ? body.output_config.effort : 'low';

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': req.headers.get('anthropic-version') || API_VERSION },
      body: JSON.stringify({ model: body.model, max_tokens: Math.min(Number(body.max_tokens) || MAX_TOKENS, MAX_TOKENS), stream: body.stream === true,
        output_config: { effort }, messages: [{ role: 'user', content: m.content }] })
    });
    const headers = new Headers(cors);
    ['content-type', 'request-id', 'retry-after'].forEach(h => { const v = upstream.headers.get(h); if (v) headers.set(h, v); });
    return new Response(upstream.body, { status: upstream.status, headers });
  }
};

// A Firebase ID token is a JWT signed by Google. It must name this project, be current, and carry a valid signature.
async function verify(token) {
  const [h, p, s] = token.split('.');
  if (!s) throw new Error('no token');
  const read = x => JSON.parse(new TextDecoder().decode(bytes(x)));
  const head = read(h), claims = read(p), now = Date.now() / 1000;
  if (head.alg !== 'RS256' || claims.aud !== PROJECT || claims.iss !== 'https://securetoken.google.com/' + PROJECT ||
    !claims.sub || !(claims.exp > now) || claims.iat > now + 300) throw new Error('bad claims');
  const jwk = (await googleKeys()).find(k => k.kid === head.kid);
  if (!jwk) throw new Error('unknown key');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  if (!await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, bytes(s), new TextEncoder().encode(h + '.' + p))) throw new Error('bad signature');
  return claims;
}
async function googleKeys() {
  if (keys && Date.now() < keysUntil) return keys;
  const r = await fetch(KEYS_URL);
  const age = /max-age=(\d+)/.exec(r.headers.get('cache-control') || '');
  keys = (await r.json()).keys;
  keysUntil = Date.now() + (age ? Number(age[1]) : 3600) * 1000;
  return keys;
}
function bytes(x) {
  const s = atob(x.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((x.length + 3) % 4));
  return Uint8Array.from(s, c => c.charCodeAt(0));
}
