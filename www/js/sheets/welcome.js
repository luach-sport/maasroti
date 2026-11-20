/* First start: maaser or chomesh, an opening balance if there is one, and the weekly reminder. */
(function () {
  'use strict';
  const MA = window.MA;
  const { icon } = MA;
  const F = MA.F;
  const ui = MA.ui;

  MA.SHEETS.welcome = {
    full: true,
    noClose: () => !MA.state.onboarded,
    title: () => 'ברוכים הבאים',
    init: () => { ui.form = { rate: '10', rateCustom: false, opening: '', weeklyOn: true }; },
    render: () => {
      const f = ui.form;
      return '<div class="about-head">' + MA.logo(84) + '<h2>מעשרותי</h2><span class="slogan">עשר תעשר – בשביל שתתעשר</span></div>' +
        '<p class="fine" style="font-size:15px;text-align:center">רושמים הכנסות ונתינות, והאפליקציה מחשבת כמה נשאר לתת. הכל נשמר רק בטלפון שלך.</p>' +
        F.rate(f) +
        F.money('wopen', 'opening', 'יש חוב מעשרות מלפני? (לא חובה)', f.opening, { hint: 'אפשר להשאיר ריק ולעדכן אחר כך בהגדרות.' }) +
        '<div class="card list">' + F.switchRow('weeklyOn', 'תזכורת שבועית', 'ביום חמישי ב-20:00 (אפשר לשנות בהגדרות)', f.weeklyOn) + '</div>' +
        '<button type="button" class="btn" data-action="finish-welcome">' + icon('check') + 'מתחילים</button>';
    }
  };
})();
