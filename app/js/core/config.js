/* App identity, version and where feedback messages go. */
(function () {
  'use strict';
  const MA = (window.MA = window.MA || {});

  MA.VERSION = window.MAASROTI_VERSION || { version: '1.0', build: 'dev' };
  MA.APP_ID = 'com.luachsport.maasroti';
  MA.REPO = 'luach-sport/maasroti';
  MA.SITE_URL = 'https://luach-sport.github.io/maasroti/';
  // Feedback goes to the developer's own Google Apps Script (shared with MyCar and the other apps), which
  // e-mails only the developer and says which app the message came from. No e-mail address ships in the app.
  MA.FEEDBACK_URL = 'https://script.google.com/macros/s/AKfycbwuxeoRQSIFoCfTrJqJ_QUeF1JANm0H4PY5Mc00Ns8hBm9K8lvJ2S5hBYQOVtA3lZX1lw/exec';
  MA.FEEDBACK_KEY = 'mc_9-ATPT_LPmYj188PGtCksaLh';
  MA.FEEDBACK_APP = 'maasroti';
})();
