/* Form pieces shared by the sheets: amount, date, percent choice, a switch row, chips. */
(function () {
  'use strict';
  const MA = window.MA;
  const { esc, icon } = MA;
  const F = (MA.F = {});

  F.money = (id, k, label, val, opts) => '<div class="field"><label for="' + id + '">' + esc(label) + '</label><div class="input-wrap money"><span class="lead">₪</span>' +
    '<input id="' + id + '" class="input' + (opts && opts.big ? ' big' : '') + '" inputmode="decimal" autocomplete="off" data-f="' + k + '" value="' + esc(val || '') + '" placeholder="0"' + (opts && opts.autofocus ? ' autofocus' : '') + '></div>' +
    (opts && opts.hint ? '<span class="hint">' + opts.hint + '</span>' : '') + '</div>';

  F.date = (id, k, label, val) => {
    const ts = MA.fromInput(val);
    const heb = isFinite(ts) ? MA.hebDate(ts) : '';
    return '<div class="field"><label for="' + id + '">' + esc(label) + '</label><input id="' + id + '" class="input" type="date" data-f="' + k + '" value="' + esc(val) + '">' +
      (heb ? '<span class="hint" id="' + id + '-heb">' + esc(heb) + '</span>' : '<span class="hint" id="' + id + '-heb"></span>') + '</div>';
  };

  F.text = (id, k, label, val, ph, max) => '<div class="field"><label for="' + id + '">' + esc(label) + '</label><input id="' + id + '" class="input" data-f="' + k + '" value="' + esc(val || '') + '" maxlength="' + (max || 60) + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + '></div>';

  F.note = (id, val) => '<div class="field"><label for="' + id + '">הערה (לא חובה)</label><input id="' + id + '" class="input" data-f="note" value="' + esc(val || '') + '" maxlength="300"></div>';

  // 10% / 20% / other (with a field for the percent).
  F.rate = (f) => {
    const r = MA.num(f.rate);
    const custom = f.rateCustom || (r !== 10 && r !== 20);
    return '<div class="field"><span class="label">כמה להפריש</span><div class="seg" role="group" aria-label="אחוז להפרשה">' +
      '<button type="button" data-action="form-rate" data-v="10" aria-pressed="' + (!custom && r === 10) + '">מעשר 10%</button>' +
      '<button type="button" data-action="form-rate" data-v="20" aria-pressed="' + (!custom && r === 20) + '">חומש 20%</button>' +
      '<button type="button" data-action="form-rate" data-v="custom" aria-pressed="' + custom + '">אחר</button></div>' +
      (custom ? '<div class="input-wrap"><input class="input" inputmode="decimal" data-f="rate" value="' + esc(f.rate) + '" aria-label="אחוז" autofocus><span class="suffix">%</span></div>' : '') + '</div>';
  };

  F.switchRow = (k, label, sub, on) => '<div class="row tight"><span class="grow"><span class="t">' + esc(label) + '</span>' + (sub ? '<span class="s">' + sub + '</span>' : '') + '</span>' +
    '<button type="button" class="switch-hit" role="switch" aria-checked="' + !!on + '" data-action="form-toggle" data-k="' + k + '" aria-label="' + esc(label) + '"><span class="switch"></span></button></div>';

  F.chips = (action, items, cur) => '<div class="chips">' + items.map((it) => '<button type="button" class="chip sm" data-action="' + action + '" data-v="' + esc(it.v) + '" aria-pressed="' + (String(it.v) === String(cur)) + '">' + esc(it.l) + '</button>').join('') + '</div>';

  F.del = (action, confirming, label) => '<button type="button" class="btn ghost danger-text" data-action="' + action + '">' + icon('trash') + (confirming ? 'ללחוץ שוב כדי למחוק' : label || 'מחיקה') + '</button>';
})();
