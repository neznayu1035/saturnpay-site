/* Saturn-Pay site configuration.
 * This is the ONLY file you edit after the backend is deployed:
 *   API = ''                                   -> TEST MODE (everything simulated in the browser)
 *   API = 'https://your-app.up.railway.app'    -> LIVE MODE (real backend; no trailing slash, no /api)
 */
(function () {
  var API = '';

  var SP = window.SP = { API: API.replace(/\/+$/, ''), live: !!API };
  SP.token = function () { try { return localStorage.getItem('saturnpay_token') || ''; } catch (e) { return ''; } };
  function logout() {
    try { ['saturnpay_token', 'saturnpay_user', 'saturnpay_transactions', 'saturnpay_investments'].forEach(function (k) { localStorage.removeItem(k); }); } catch (e) {}
    if (!/login\.html$|register\.html$|index\.html$|terms\.html$/.test(location.pathname) && location.pathname.slice(-1) !== '/') location.href = 'login.html';
  }
  SP.logout = logout;

  // async call to the backend with the login token; throws Error(message) on failure
  SP.call = function (path, body, method) {
    var headers = { 'Content-Type': 'application/json' };
    var tk = SP.token(); if (tk) headers.Authorization = 'Bearer ' + tk;
    return fetch(SP.API + path, { method: method || (body === undefined ? 'GET' : 'POST'), headers: headers, body: body === undefined ? undefined : JSON.stringify(body) })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (res.status === 401 && tk) { logout(); }
          if (!res.ok) throw new Error(data.error || ('Error ' + res.status));
          return data;
        });
      }, function () { throw new Error('Connection error'); });
  };

  // Copy the server's ledger and plans into the local cache the pages read from.
  // Synchronous on purpose: it must finish before the page scripts run.
  SP.sync = function () {
    if (!SP.live) return;
    var tk = SP.token(); if (!tk) return;
    function get(path) {
      var x = new XMLHttpRequest();
      x.open('GET', SP.API + path, false);
      x.setRequestHeader('Authorization', 'Bearer ' + tk);
      try { x.send(); } catch (e) { return { ok: false }; }
      if (x.status === 401) { logout(); return { ok: false }; }
      try { return { ok: x.status === 200, data: JSON.parse(x.responseText) }; } catch (e) { return { ok: false }; }
    }
    var t = get('/api/transactions'), v = get('/api/investments');
    try {
      localStorage.setItem('saturnpay_transactions', JSON.stringify(t.ok && Array.isArray(t.data) ? t.data.slice().reverse() : []));
      localStorage.setItem('saturnpay_investments', JSON.stringify(v.ok && Array.isArray(v.data) ? v.data : []));
    } catch (e) {}
  };
  SP.sync();
})();
