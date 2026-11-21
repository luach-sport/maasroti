/* Installing מעשרותי on iPhone: when מעשרותי is opened in Safari (not yet from the home screen), a short guide
   explains how to add it to the home screen. It opens by itself before the first start (data in Safari and
   in the home-screen app are kept apart, so it's best to add it first), and later from a small notice on the
   home screen that can be closed. Does nothing on Android or once opened from the home screen.
   Loaded after web-app.js. */
(function () {
  'use strict';
  const MA = window.MA;
  const HINT_KEY = 'maasroti.iosHint';
  const show = () => MA.isIOS() && !MA.isStandalone();
  const svg = (d, fill) => '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"' + (fill ? ' style="fill:currentColor;stroke:none"' : '') + '>' + d + '</svg>';
  const ICON_SHARE = svg('<path d="M12 3v12"/><path d="m8 7 4-4 4 4"/><path d="M8 10H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2"/>');
  const ICON_ADD = svg('<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 8v8M8 12h8"/>');
  const ICON_DOTS = '<span dir="ltr" style="font-weight:800;letter-spacing:1px">•••</span>';

  const hintClosed = () => { try { return localStorage.getItem(HINT_KEY) === 'off'; } catch (e) { return false; } };

  // The first window on a new iPhone: this guide instead of the car setup.
  MA.firstSheet = () => (show() ? 'installIos' : 'welcome');

  // The small notice on the home screen (ui.js).
  MA.installNotice = () => {
    if (!show() || hintClosed()) return '';
    return '<div class="notice accent">' + ICON_ADD.replace('class="i"', 'class="i sm"') +
      '<span class="grow">באייפון? מוסיפים את מעשרותי למסך הבית והיא עובדת כמו אפליקציה, גם בלי אינטרנט.</span>' +
      '<button type="button" class="link" data-action="open-sheet" data-sheet="installIos">איך?</button>' +
      '<button type="button" class="link" data-action="ios-hint-off" aria-label="סגירת ההודעה">' + MA.icon('close', 'sm') + '</button></div>';
  };

  const step = (n, ic, cls, title, sub) => '<div class="row"><span class="tile' + (cls ? ' ' + cls : '') + '">' + ic + '</span>' +
    '<span class="grow"><span class="t">' + n + '. ' + title + '</span><span class="s">' + sub + '</span></span></div>';

  MA.SHEETS.installIos = {
    full: true,
    noClose: () => !MA.state.onboarded,
    title: () => 'התקנה באייפון',
    render: () => {
      const first = !MA.state.onboarded;
      return '<div class="about-head">' + MA.logo(84) + '<h2>מעשרותי</h2><span class="slogan">עשר תעשר – בשביל שתתעשר</span></div>' +
        '<p style="margin:0;font-size:15px">כדי ש-מעשרותי תיפתח כמו אפליקציה, מסמל במסך הבית, ותעבוד גם בלי אינטרנט, מוסיפים אותה למסך הבית. זה לוקח כמה שניות:</p>' +
        '<div class="card tight">' +
        step(1, ICON_SHARE, '', 'לוחצים על כפתור השיתוף', 'ריבוע עם חץ למעלה, בתחתית המסך. באייפון עם גרסה חדשה הוא בתפריט ' + ICON_DOTS + ' שליד שורת הכתובת.') +
        step(2, ICON_ADD, 'gold', 'בוחרים "הוספה למסך הבית"', 'גוללים קצת למטה ברשימה כדי למצוא אותו (באנגלית: <bdi dir="ltr" style="white-space:nowrap">Add to Home Screen</bdi>).') +
        step(3, MA.icon('check'), 'in', 'לוחצים "הוספה"', 'אם מופיע מתג של פתיחה כאפליקציה (<bdi dir="ltr" style="white-space:nowrap">Open as Web App</bdi>), משאירים אותו דלוק. הסמל של מעשרותי יופיע במסך הבית.') +
        '</div>' +
        '<div class="notice accent">' + MA.icon('info', 'sm') + '<span class="grow">הנתונים בספארי ובאפליקציה שבמסך הבית נשמרים בנפרד. לכן כדאי להוסיף למסך הבית עכשיו, ולהשתמש במעשרותי משם.</span></div>' +
        '<p class="fine" style="margin:0 4px">אם הקישור נפתח בתוך וואטסאפ או טלגרם, קודם פותחים אותו בספארי. אם מוחקים את מעשרותי ממסך הבית, הנתונים נמחקים איתה, אז כדאי לשמור גיבוי מדי פעם (הגדרות ← גיבוי לקובץ).</p>' +
        (first
          ? '<button type="button" class="btn secondary" data-action="ios-continue">להמשיך בספארי בלי להוסיף</button>'
          : '<button type="button" class="btn" data-action="close-sheet">' + MA.icon('check') + 'הבנתי</button>');
    }
  };

  MA.A['ios-continue'] = () => { if (MA.state.onboarded) MA.closeSheet(); else MA.openSheet('welcome'); };
  MA.A['ios-hint-off'] = () => { try { localStorage.setItem(HINT_KEY, 'off'); } catch (e) { /* ignore */ } MA.render(true); };
})();
