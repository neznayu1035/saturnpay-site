// Saturn-Pay · NOWPayments deposit flow (loaded by deposit.html, live mode only)
(function () {
  if (!(window.SP && window.SP.live)) return; // demo mode: page works as before

  var TEXT = {
    en: { title: 'How much do you want to deposit?', btn: 'Get Deposit Address', creating: 'Creating...', min: 'Minimum deposit amount is 10 USDT.', err: 'Could not create the payment. Try again shortly.', send: 'Send exactly {a} USDT to this address. A smaller amount will not be credited automatically.' },
    tr: { title: 'Ne kadar yatırmak istiyorsunuz?', btn: 'Yatırma Adresini Al', creating: 'Oluşturuluyor...', min: 'Minimum yatırma tutarı 10 USDT.', err: 'Ödeme oluşturulamadı. Lütfen biraz sonra tekrar deneyin.', send: 'Bu adrese tam olarak {a} USDT gönderin. Daha düşük bir tutar otomatik olarak bakiyenize eklenmez.' },
    ru: { title: 'Сколько вы хотите пополнить?', btn: 'Получить адрес', creating: 'Создание...', min: 'Минимальная сумма пополнения — 10 USDT.', err: 'Не удалось создать платёж. Повторите попытку позже.', send: 'Отправьте на этот адрес ровно {a} USDT. Меньшая сумма не будет зачислена автоматически.' },
    es: { title: '¿Cuánto quieres depositar?', btn: 'Obtener Dirección', creating: 'Creando...', min: 'El monto mínimo de depósito es 10 USDT.', err: 'No se pudo crear el pago. Inténtalo de nuevo en unos minutos.', send: 'Envía exactamente {a} USDT a esta dirección. Un monto menor no se acreditará automáticamente.' },
    fr: { title: 'Quel montant souhaitez-vous déposer ?', btn: "Obtenir l'Adresse", creating: 'Création...', min: 'Le montant minimum de dépôt est de 10 USDT.', err: 'Impossible de créer le paiement. Réessayez dans quelques instants.', send: 'Envoyez exactement {a} USDT à cette adresse. Un montant inférieur ne sera pas crédité automatiquement.' },
    de: { title: 'Wie viel möchten Sie einzahlen?', btn: 'Adresse Abrufen', creating: 'Wird erstellt...', min: 'Der Mindesteinzahlungsbetrag beträgt 10 USDT.', err: 'Zahlung konnte nicht erstellt werden. Bitte versuchen Sie es in Kürze erneut.', send: 'Senden Sie genau {a} USDT an diese Adresse. Ein geringerer Betrag wird nicht automatisch gutgeschrieben.' },
  };
  function T(k) {
    var code = localStorage.getItem('saturnpay_lang') || 'en';
    return (TEXT[code] || TEXT.en)[k] || TEXT.en[k];
  }
  function $(s) { return document.querySelector(s); }
  function show(el, on) { if (el) el.style.display = on ? '' : 'none'; }

  var NET = { TRX: 'TRC20', ETH: 'ERC20' };
  var state = null; // { network, address, payAmount }

  // called by deposit.html's setNetwork(): returns the address to display
  window.NP = {
    address: function (network) {
      var ok = !!state && state.network === network;
      show($('.qr-wrap'), ok);
      show($('.address-row'), ok);
      show($('.warn-note'), ok);
      var info = $('#npInfo');
      if (info) {
        show(info, ok);
        if (ok) info.textContent = T('send').replace('{a}', state.payAmount);
      }
      return ok ? state.address : '';
    },
  };

  document.addEventListener('DOMContentLoaded', function () {
    var card = $('#simCard');
    show(card, true);
    var title = card.querySelector('.sim-title');
    title.removeAttribute('data-i18n'); title.textContent = T('title');
    var btn = $('#confirmBtn');
    btn.removeAttribute('data-i18n'); btn.textContent = T('btn');

    var row = $('.address-row');
    var info = document.createElement('div');
    info.id = 'npInfo';
    info.style.cssText = 'display:none;margin-top:14px;font-size:13px;line-height:1.55;color:var(--gold-bright);text-align:center;';
    row.parentNode.insertBefore(info, row.nextSibling);
  });

  // capture phase: runs before the page's old "simulate deposit" handler and blocks it
  document.addEventListener('submit', async function (e) {
    if (!e.target || e.target.id !== 'depositForm') return;
    e.preventDefault();
    e.stopImmediatePropagation();

    var amt = parseFloat($('#depositAmount').value);
    var err = $('#formError'), btn = $('#confirmBtn');
    function fail(m) { err.textContent = m; err.style.display = 'block'; }
    if (!amt || amt < 10) return fail(T('min'));

    var tab = $('.network-tab.active');
    btn.disabled = true; btn.textContent = T('creating'); err.style.display = 'none';
    try {
      var res = await fetch(SP.API + '/api/nowpayments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SP.token() },
        body: JSON.stringify({ network: NET[tab.dataset.network] || 'TRC20', amount: amt }),
      });
      var data = await res.json().catch(function () { return {}; });
      if (!res.ok || !data.address) throw new Error(data.error || T('err'));
      state = { network: tab.dataset.network, address: data.address, payAmount: data.payAmount };
      tab.click(); // re-renders address + QR through setNetwork()
    } catch (x) {
      fail(x.message || T('err'));
    }
    btn.disabled = false; btn.textContent = T('btn');
  }, true);
})();
