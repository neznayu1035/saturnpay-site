/* Saturn Pay PWA: manifest, service worker ve "Uygulamayı yükle" bildirimi */
(function () {
  var d = document, head = d.head || d.documentElement;
  if (!d.querySelector('link[rel="manifest"]')) { var l = d.createElement('link'); l.rel = 'manifest'; l.href = '/site.webmanifest'; head.appendChild(l); }
  if (!d.querySelector('meta[name="theme-color"]')) { var m = d.createElement('meta'); m.name = 'theme-color'; m.content = '#0A0A0A'; head.appendChild(m); }
  if (!d.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
    [['apple-mobile-web-app-capable','yes'],['apple-mobile-web-app-status-bar-style','black-translucent'],['apple-mobile-web-app-title','Saturn Pay']].forEach(function (a) { var x = d.createElement('meta'); x.name = a[0]; x.content = a[1]; head.appendChild(x); });
  }
  if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });

  var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
  if (standalone) return;
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  var until = parseInt(get('sp_pwa_hide') || '0', 10);
  if (until && Date.now() < until) return;
  var T = {
    tr: ['Saturn Pay uygulamasını yükle', 'Yükle', 'Paylaş düğmesine, sonra "Ana Ekrana Ekle"ye dokun'],
    en: ['Install the Saturn Pay app', 'Install', 'Tap Share, then "Add to Home Screen"'],
    ru: ['Установить приложение Saturn Pay', 'Установить', 'Нажмите «Поделиться», затем «На экран Домой»'],
    es: ['Instala la app Saturn Pay', 'Instalar', 'Toca Compartir y luego "Añadir a pantalla de inicio"'],
    fr: ["Installer l'app Saturn Pay", 'Installer', 'Touchez Partager puis « Sur l\'écran d\'accueil »'],
    de: ['Saturn Pay App installieren', 'Installieren', 'Tippe auf Teilen, dann „Zum Home-Bildschirm“']
  };
  var lang = get('saturnpay_lang') || (navigator.language || 'en').slice(0, 2); var t = T[lang] || T.en;
  var ev = null, isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  function show(ios) {
    if (d.getElementById('spPwa')) return;
    var b = d.createElement('div'); b.id = 'spPwa';
    b.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;background:#1a1a1a;color:#fff;border:1px solid #333;border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:10px;font:14px system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.5)';
    b.innerHTML = '<img src="/icon-192.png" width="36" height="36" style="border-radius:9px" alt=""><div style="flex:1">' + (ios ? t[2] : t[0]) + '</div>' +
      (ios ? '' : '<button id="spPwaGo" style="background:#FF6A00;color:#fff;border:0;border-radius:10px;padding:9px 14px;font-size:14px">' + t[1] + '</button>') +
      '<button id="spPwaX" aria-label="close" style="background:none;border:0;color:#999;font-size:20px;padding:4px 6px">×</button>';
    d.body.appendChild(b);
    d.getElementById('spPwaX').onclick = function () { set('sp_pwa_hide', String(Date.now() + 7 * 864e5)); b.remove(); };
    var go = d.getElementById('spPwaGo');
    if (go) go.onclick = function () { if (!ev) return; ev.prompt(); ev.userChoice.then(function () { ev = null; b.remove(); }); };
  }
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); ev = e; if (d.body) show(false); else d.addEventListener('DOMContentLoaded', function () { show(false); }); });
  window.addEventListener('appinstalled', function () { var b = d.getElementById('spPwa'); if (b) b.remove(); });
  if (isIos) setTimeout(function () { if (d.body) show(true); }, 2500);
})();
