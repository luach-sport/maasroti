/* Feedback form actions: type, send, try again. */
(function () {
  'use strict';
  const MA = window.MA;
  const A = MA.A;
  const ui = MA.ui;

  A['fb-type'] = (el) => { ui.form.type = el.dataset.v; MA.renderSheet(); };
  A['feedback-retry'] = async () => {
    if (!MA.online()) { MA.toast('אין חיבור כרגע'); return; }
    const n = await MA.flushOutbox();
    MA.toast(n ? 'נשלח. תודה!' : 'עדיין לא הצלחתי לשלוח. ננסה שוב לבד.');
  };
  A['send-feedback'] = async () => {
    if (MA.feedbackBusy()) return;
    const f = ui.form, err = MA.feedbackErrors(f);
    f.err = err;
    if (Object.keys(err).length) { MA.renderSheet(); return; }
    MA.state.profile = { name: f.name.trim(), email: f.email.trim() };
    MA.state.outbox.push({ id: MA.uid(), ts: Date.now(), type: f.type, name: f.name.trim(), email: f.email.trim(), message: f.message.trim(), status: 'pending' });
    MA.state.outbox = MA.state.outbox.slice(-30);
    MA.save();
    f.message = ''; f.err = {};
    MA.renderSheet();
    if (!MA.online()) { MA.toast('נשמר. הפנייה תישלח כשיחזור האינטרנט'); return; }
    MA.toast('שולח…', 8000);
    const n = await MA.flushOutbox();
    MA.toast(n ? 'תודה! הפנייה נשלחה' : 'לא הצלחתי לשלוח כרגע. ננסה שוב לבד.');
  };
})();
