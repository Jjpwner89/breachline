// Claude opponents on a copy hosted outside Claude, played on the owner's Anthropic key. It gives ui.js a function shaped
// like the Claude page's sample(prompt, options), so the opponent code is the same in both places. Requests go through the
// proxy in proxy/worker.js, which holds the key and answers only signed-in accounts, so the key never reaches a browser.
var OwnKey = (function () {
  var MODEL = 'breachline.apimodel', SPENT = 'breachline.apispent';
  var SDK = 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@1.3.0/+esm';
  var PROXY = 'https://breachline-claude.johnmarkozaeta.workers.dev';
  // Prices per million tokens, input then output. The cost line is an estimate from each answer's own token counts.
  var MODELS = [
    { id: 'claude-opus-5-5', label: 'Opus 5.5', price: [4, 20], note: 'The strongest player.' },
    { id: 'claude-sonnet-5-5', label: 'Sonnet 5.5', price: [2, 10], note: 'Strong, at about half the cost.' }
  ];
  var sdk = null, client = null;

  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function write(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  // Players could once save their own key here. That's gone, so a key left over from then is cleared.
  write('breachline.apikey', null);
  function signedIn() { return typeof Accounts !== 'undefined' && !!Accounts.name(); }
  function model() {
    var id = read(MODEL);
    return MODELS.filter(function (m) { return m.id === id; })[0] || MODELS[0];
  }
  function spent() { return Number(read(SPENT)) || 0; }

  function load() {
    if (!sdk) sdk = import(SDK).then(function (mod) { return mod.default || mod.Anthropic; }, function (e) { sdk = null; throw e; });
    return sdk;
  }
  // The SDK still sends a key header, which the proxy replaces with the real one.
  function connect() {
    return load().then(function (Anthropic) {
      if (!client) client = new Anthropic({ apiKey: 'proxy', baseURL: PROXY, dangerouslyAllowBrowser: true });
      return { Anthropic: Anthropic, client: client };
    });
  }

  // Codes match the Claude page's, plus this module's own, so ai.js and ui.js decide what to do the same way.
  function failure(Anthropic, e) {
    var code = 'api_error';
    if (!Anthropic) code = 'connection';
    else if (e instanceof Anthropic.APIUserAbortError) code = 'cancelled';
    else if (e instanceof Anthropic.AuthenticationError) code = 'sign_in_needed';
    else if (e instanceof Anthropic.PermissionDeniedError) code = 'not_invited';
    else if (e instanceof Anthropic.RateLimitError) code = 'rate_limited';
    else if (e instanceof Anthropic.BadRequestError) code = 'request_rejected';
    else if (e instanceof Anthropic.APIConnectionError) code = 'connection';
    if (code !== 'cancelled') console.warn('Claude request failed (' + code + '):', e && e.message);
    return { code: code, message: e && e.message };
  }

  function count(m, usage) {
    if (!usage) return;
    var cost = ((usage.input_tokens || 0) * m.price[0] + (usage.output_tokens || 0) * m.price[1]) / 1e6;
    write(SPENT, String(spent() + cost));
  }

  function sample(prompt, opts) {
    opts = opts || {};
    if (!signedIn()) return Promise.reject({ code: 'sign_in_needed', message: 'Sign in to play Claude here.' });
    var m = model(), Anthropic = null;
    return Promise.all([connect(), Accounts.token()]).then(function (got) {
      Anthropic = got[0].Anthropic;
      return got[0].client.messages.stream({
        model: m.id,
        max_tokens: 16000,
        output_config: { effort: opts.effort || 'low' },
        messages: [{ role: 'user', content: prompt }]
      }, { signal: opts.signal, headers: { 'x-breachline-token': got[1] || '' } }).finalMessage();
    }).catch(function (e) { throw failure(Anthropic, e); }).then(function (msg) {
      count(m, msg.usage);
      if (msg.stop_reason === 'refusal') throw { code: 'refused', message: 'Claude declined this request.' };
      var text = msg.content.filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; }).join('');
      return { text: text, truncated: msg.stop_reason === 'max_tokens', modelTierApplied: opts.modelTier, modelApplied: msg.model };
    });
  }

  return {
    MODELS: MODELS, sample: sample, has: signedIn,
    model: model, setModel: function (id) { write(MODEL, id); },
    spent: spent
  };
})();
