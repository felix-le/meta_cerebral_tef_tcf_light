
// Contest canvas: script navigation becomes an artboard link (the canvas only follows <a href>).
// Screens that are not on the canvas fall back to the closest one that is.
function __go(h) {
  h = String(h || "");
  var ENG = { listening: "ListeningTest", reading: "ReadingTest", speaking: "SpeakingTest", writing: "WritingTest", l: "ListeningTest", r: "ReadingTest", s: "SpeakingTest", w: "WritingTest" };
  var ON = ["DetailedAnalysis", "Home", "ListeningTest", "MockTest", "MockTestDetail", "Onboarding", "ReadingTest", "SpeakingTest", "TestHistory", "TestReview", "WritingTest"];
  var m = h.match(/^([A-Za-z]+)\.dc\.html/);
  var name = m ? m[1] : "";
  if (name === "PracticeConfig") { var k = (h.match(/skill=([A-Za-z]+)/) || [])[1]; name = (k && ENG[k.toLowerCase()]) || "Home"; }
  else if (name === "AnswerKey") name = "TestReview";
  else if (ON.indexOf(name) < 0) name = "Home";
  var a = document.createElement("a");
  a.href = name + ".dc.html"; a.style.display = "none";
  document.body.appendChild(a); a.click(); a.remove();
}
/* Mock session runner — the exam is ONE sitting with no breaks, so the four
   engines have to hand off to each other instead of each ending on its own
   result screen.

   Mount once per engine, right after </helmet>:
     <x-import component-from-global-scope="mock-session" from="./mock-session.js"
               hint-size="0,0"></x-import>

   The engine calls MockSession.handoff("listening") when its test ends; the
   component paints the transition inside the device frame and navigates on its
   own. Per-skill scores are withheld until the whole session is scored, which
   is how the real exam behaves. */
(function () {
  if (window.customElements && customElements.get('mock-session')) return;

  const KEY = 'mock.session.v1';
  const ORDER = [
    { key: 'listening', fr: 'Compréhension orale', en: 'Listening', min: 40, href: 'ListeningTest.dc.html' },
    { key: 'reading', fr: 'Compréhension écrite', en: 'Reading', min: 60, href: 'ReadingTest.dc.html' },
    { key: 'writing', fr: 'Expression écrite', en: 'Writing', min: 60, href: 'WritingTest.dc.html' },
    /* Speaking is a separate appointment on the same day — the only real break
       in the session, and the reason it is not chained like the other three. */
    { key: 'speaking', fr: 'Expression orale', en: 'Speaking', min: 15, href: 'SpeakingTest.dc.html', appointment: true }
  ];

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
  }
  function write(v) {
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {}
  }

  const API = {
    ORDER: ORDER,
    active: () => read(),
    /* Starts a session at the first skill. Called from the mock hub. */
    start(fromKey) {
      const i = Math.max(0, ORDER.map(s => s.key).indexOf(fromKey || 'listening'));
      write({ at: i, done: ORDER.slice(0, i).map(s => s.key), started: Date.now() });
      return ORDER[i];
    },
    end() { try { localStorage.removeItem(KEY); } catch (e) {} },
    stepOf: (key) => ORDER.filter(s => s.key === key)[0] || null,
    nextOf(key) {
      const i = ORDER.map(s => s.key).indexOf(key);
      return i > -1 && i < ORDER.length - 1 ? ORDER[i + 1] : null;
    },
    /* Whether a per-skill score should be hidden right now. */
    holds(key) {
      const s = read();
      return !!s && !!API.nextOf(key);
    },
    handoff(key) {
      const el = document.querySelector('mock-session');
      if (el) return el.handoff(key);
      const n = API.nextOf(key);
      __go(n ? n.href : 'TestReview.dc.html');
    }
  };
  window.MockSession = API;

  const css = (o) => Object.keys(o).map(k => k + ':' + o[k]).join(';');

  class MockSessionEl extends HTMLElement {
    connectedCallback() {
      this.style.display = 'none';
      this.frame = document.querySelector(this.getAttribute('frame') || '[data-screen-label]');
    }

    handoff(key) {
      const sess = read();
      const next = API.nextOf(key);
      if (!sess) { __go(next ? next.href : 'TestReview.dc.html'); return; }

      sess.done = (sess.done || []).concat([key]);
      sess.at = next ? ORDER.map(s => s.key).indexOf(next.key) : ORDER.length;
      write(sess);

      if (!next) { API.end(); __go('TestReview.dc.html'); return; }
      this.paint(key, next);
    }

    paint(key, next) {
      const frame = this.frame || document.querySelector('[data-screen-label]');
      if (!frame) { __go(next.href); return; }
      if (getComputedStyle(frame).position === 'static') frame.style.position = 'relative';

      const done = API.stepOf(key);
      const appointment = !!next.appointment;
      const left = ORDER.filter(s => !s.appointment).reduce((a, s) => a, 0);
      let secs = appointment ? 0 : 15;

      const ov = document.createElement('div');
      ov.setAttribute('style', css({
        position: 'absolute', inset: '0', 'z-index': '960', display: 'flex',
        'flex-direction': 'column', 'justify-content': 'center', gap: '26px',
        padding: '0 26px', 'border-radius': 'inherit',
        background: 'linear-gradient(170deg,#221A13 0%,#1E1226 60%,#100D0A 100%)',
        'font-family': 'Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
        animation: 'msFade .4s ease both'
      }));

      const style = document.createElement('style');
      style.textContent = '@keyframes msFade{from{opacity:0}to{opacity:1}}@keyframes msPulse{0%,100%{opacity:1}50%{opacity:.45}}';
      ov.appendChild(style);

      /* four dots, one per skill */
      const rail = document.createElement('div');
      rail.setAttribute('style', 'display:flex;align-items:center;gap:8px');
      ORDER.forEach((s) => {
        const isDone = (read().done || []).indexOf(s.key) > -1;
        const isNext = s.key === next.key;
        const d = document.createElement('div');
        d.setAttribute('style', css({
          flex: '1', height: '4px', 'border-radius': '100px',
          background: isDone ? '#4ADE80' : isNext ? '#F9BD48' : 'rgba(255,255,255,.16)'
        }));
        rail.appendChild(d);
      });

      const kicker = document.createElement('span');
      kicker.setAttribute('style', 'font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,.45)');
      kicker.textContent = 'TEF Canada · séance en cours';

      const title = document.createElement('span');
      title.setAttribute('style', 'font-size:27px;font-weight:700;line-height:33px;letter-spacing:-.6px;color:#fff;text-wrap:pretty');
      title.textContent = done ? done.fr + ' terminée' : 'Épreuve terminée';

      const body = document.createElement('span');
      body.setAttribute('style', 'font-size:14.5px;font-weight:400;line-height:22px;color:rgba(255,255,255,.62);text-wrap:pretty');
      body.textContent = appointment
        ? 'Les trois épreuves sur ordinateur sont terminées. L’expression orale se passe avec un examinateur, sur rendez-vous, le même jour.'
        : 'Aucune pause n’est autorisée entre les épreuves. ' + next.fr + ' (' + next.min + ' minutes) commence toute seule — restez devant l’écran.';

      const card = document.createElement('div');
      card.setAttribute('style', css({
        display: 'flex', 'align-items': 'center', gap: '14px', padding: '18px',
        'border-radius': '22px', background: 'rgba(255,255,255,.06)',
        'box-shadow': 'inset 0 0 0 1px rgba(255,255,255,.12)'
      }));
      const cardL = document.createElement('div');
      cardL.setAttribute('style', 'flex:1;display:flex;flex-direction:column;gap:3px;min-width:0');
      const cardK = document.createElement('span');
      cardK.setAttribute('style', 'font-size:9.5px;font-weight:700;letter-spacing:.9px;color:#F0C98A');
      cardK.textContent = appointment ? 'RENDEZ-VOUS' : 'ÉPREUVE SUIVANTE';
      const cardT = document.createElement('span');
      cardT.setAttribute('style', 'font-size:16px;font-weight:700;line-height:21px;color:#fff');
      cardT.textContent = next.fr;
      const cardS = document.createElement('span');
      cardS.setAttribute('style', 'font-size:12px;font-weight:400;line-height:17px;color:rgba(255,255,255,.5)');
      cardS.textContent = appointment ? 'Salle 2 · 14 h 30 · avec un examinateur' : next.min + ' minutes · ' + next.en;
      cardL.append(cardK, cardT, cardS);

      const count = document.createElement('span');
      count.setAttribute('style', 'font-size:26px;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:-1px;color:#F9BD48;animation:msPulse 1.6s ease-in-out infinite');
      count.textContent = appointment ? '' : '0:' + (secs < 10 ? '0' : '') + secs;
      card.append(cardL, count);

      const hold = document.createElement('div');
      hold.setAttribute('style', css({
        display: 'flex', gap: '9px', 'align-items': 'flex-start', padding: '13px 15px',
        'border-radius': '16px', background: 'rgba(249,189,72,.1)',
        'box-shadow': 'inset 0 0 0 1px rgba(249,189,72,.3)'
      }));
      const holdT = document.createElement('span');
      holdT.setAttribute('style', 'font-size:12px;font-weight:500;line-height:18px;color:#F9BD48;text-wrap:pretty');
      holdT.textContent = 'Aucun résultat n’est affiché avant la fin de la séance — comme à l’examen.';
      hold.appendChild(holdT);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('style', css({
        'font-family': 'inherit', height: '52px', border: '0', 'border-radius': '100px',
        background: '#fff', color: '#1E1226', 'font-size': '15px', 'font-weight': '600',
        cursor: 'pointer'
      }));
      btn.textContent = appointment ? 'Aller au rendez-vous' : 'Commencer maintenant';
      btn.addEventListener('click', () => { clearInterval(tick); __go(next.href); });

      ov.append(rail, kicker, title, body, card, hold, btn);
      frame.appendChild(ov);

      const tick = setInterval(() => {
        if (appointment) return;
        secs--;
        count.textContent = '0:' + (secs < 10 ? '0' : '') + secs;
        if (secs <= 0) { clearInterval(tick); __go(next.href); }
      }, 1000);
    }
  }

  customElements.define('mock-session', MockSessionEl);
})();
