/* TEF/TCF Prep — demo mode
 * Turns any screen file into a full-screen, app-like view: review chrome hidden,
 * page padding removed, frame pinned to the middle of a dark stage and scaled to fit.
 * Navigation already works through the real <a href="*.dc.html"> links in each screen.
 *
 *   Enter : ?demo=1 · #demo · Cmd/Ctrl+Shift+D · window.tefDemo.on()
 *   Exit  : ✕ Exit demo button · ?demo=0 · Escape twice · window.tefDemo.off()
 *
 * Styling is CSS only: one stylesheet keyed on <html data-tef-demo> plus a
 * --tef-demo-scale variable on <html>. Nothing inside the screen is touched.
 * The design canvas records inline-style changes on screen elements as edits and
 * puts them back later, so writing styles onto the frame left it shifted after
 * demo mode was turned off.
 *
 * The flag lives in sessionStorage AND localStorage, and is WATCHED rather than read
 * once — a host that strips the query string, or sets the flag after this script has
 * already run, still gets demo mode without a reload.
 */
(function () {
  var KEY = 'tefDemo';
  var FRAME = '[data-screen-label]';
  var on = false, backdrop = null, styleEl = null;

  function read() {
    try { if (sessionStorage.getItem(KEY) === '1') return true; } catch (e) {}
    try { if (localStorage.getItem(KEY) === '1') return true; } catch (e) {}
    return false;
  }
  function write(v) {
    try { v ? sessionStorage.setItem(KEY, '1') : sessionStorage.removeItem(KEY); } catch (e) {}
    try { v ? localStorage.setItem(KEY, '1') : localStorage.removeItem(KEY); } catch (e) {}
  }

  /* URL intent wins over the stored flag. */
  var q = new URLSearchParams(location.search);
  var v = q.get('demo');
  var hash = (location.hash || '').replace('#', '');
  if (v === '0' || v === 'off' || hash === 'demo=0') write(false);
  else if (v === '1' || v === 'on' || hash === 'demo' || hash === 'demo=1') write(true);

  /* ── stage chrome ───────────────────────────────────────────── */

  var D = 'html[data-tef-demo] ';
  var HOST = D + ':has(> ' + FRAME + ')';
  function stageStyle(active) {
    if (active && !styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = '__tefDemoStyle';
      styleEl.textContent =
        'html[data-tef-demo],html[data-tef-demo] body{margin:0!important;height:100%!important;' +
        'background:#1E1226!important;overflow:hidden!important;overscroll-behavior:none}' +
        D + '#dc-root,' + D + '#dc-root>.sc-host{background:transparent!important}' +
        // The element that holds the frame: no padding, no ground, and its other children (review chrome) hidden.
        HOST + '{padding:0!important;gap:0!important;background:transparent!important;' +
        'min-height:100vh!important;height:100vh!important;overflow:hidden!important}' +
        HOST + '>*:not(' + FRAME + '){display:none!important}' +
        // Pinned to the viewport centre: no ancestor layout can shift it up or down.
        D + FRAME + '{position:fixed!important;left:50%!important;top:50%!important;right:auto!important;' +
        'bottom:auto!important;margin:0!important;z-index:10!important;flex-shrink:0!important;' +
        'box-shadow:none!important;border-radius:0!important;transform-origin:center center!important;' +
        'transform:translate(-50%,-50%) scale(var(--tef-demo-scale,1))!important}' +
        D + '::selection{background:rgba(106,42,95,.28)}';
      (document.head || document.documentElement).appendChild(styleEl);
    } else if (!active && styleEl) {
      styleEl.remove(); styleEl = null;
    }
  }

  /* A real element behind everything: whatever the DC paints on its own wrapper,
     the stage stays dark. */
  function bg(active) {
    if (active) {
      if (backdrop && document.contains(backdrop)) return;
      backdrop = document.createElement('div');
      backdrop.id = '__tefDemoBg';
      backdrop.setAttribute('style', 'position:fixed;inset:0;background:#1E1226;z-index:0;pointer-events:none');
      (document.body || document.documentElement).appendChild(backdrop);
    } else if (backdrop) { backdrop.remove(); backdrop = null; }
  }

  function exitBtn(active) {
    var b = document.getElementById('__tefDemoExit');
    if (!active) { if (b) b.remove(); return; }
    if (b) return;
    b = document.createElement('button');
    b.id = '__tefDemoExit';
    b.type = 'button';
    b.textContent = '✕ Exit demo (Esc ×2)';
    b.setAttribute('style', 'position:fixed;top:14px;right:14px;z-index:2147483000;font-family:Inter,-apple-system,sans-serif;font-size:11.5px;font-weight:600;letter-spacing:.2px;color:rgba(255,255,255,.62);background:rgba(30,18,38,.42);border:1px solid rgba(255,255,255,.18);border-radius:100px;padding:6px 12px;cursor:pointer;opacity:.35;transition:opacity .18s ease,color .18s ease');
    b.addEventListener('mouseenter', function () { b.style.opacity = '1'; b.style.color = '#fff'; });
    b.addEventListener('mouseleave', function () { b.style.opacity = '.35'; b.style.color = 'rgba(255,255,255,.62)'; });
    b.addEventListener('click', function () { off(); });
    (document.body || document.documentElement).appendChild(b);
  }

  /* Review-mode counterpart: a discreet chip that enters demo mode without the URL. */
  function enterBtn(active) {
    var b = document.getElementById('__tefDemoEnter');
    if (!active) { if (b) b.remove(); return; }
    if (b) return;
    b = document.createElement('button');
    b.id = '__tefDemoEnter';
    b.type = 'button';
    b.textContent = '▶ Demo mode';
    b.title = 'Cmd/Ctrl + Shift + D';
    b.setAttribute('style', 'position:fixed;bottom:16px;right:16px;z-index:2147483000;font-family:Inter,-apple-system,sans-serif;font-size:11.5px;font-weight:600;letter-spacing:.2px;color:#5E4E69;background:rgba(255,255,255,.72);border:1px solid #CABDC8;border-radius:100px;padding:7px 13px;cursor:pointer;opacity:.5;transition:opacity .18s ease');
    b.addEventListener('mouseenter', function () { b.style.opacity = '1'; });
    b.addEventListener('mouseleave', function () { b.style.opacity = '.5'; });
    b.addEventListener('click', function () { on_(); });
    (document.body || document.documentElement).appendChild(b);
  }

  /* ── fit ────────────────────────────────────────────────────── */

  // The frame's declared size (computed width/height ignore transforms), so the
  // scale never feeds back into the next fit.
  function fit() {
    if (!on) return false;
    var frame = document.querySelector(FRAME);
    if (!frame) return false;
    var cs = getComputedStyle(frame);
    var w = parseFloat(cs.width), h = parseFloat(cs.height);
    var vw = window.innerWidth, vh = window.innerHeight;
    if (!(w > 0 && h > 0 && vw > 0 && vh > 0)) return false;
    // A hair under the exact fit so the frame never bleeds into the viewport edges.
    var s = Math.min(vw / w, vh / h) * 0.97;
    if (!(s > 0) || !isFinite(s)) s = 1;
    document.documentElement.style.setProperty('--tef-demo-scale', String(s));
    return true;
  }

  function announce(active) {
    window.dispatchEvent(new CustomEvent('tefdemo:change', { detail: { on: active } }));
  }

  var tries = 0, timer = null;
  function poll() {
    if (!on) return;
    if (fit()) return;
    if (++tries > 400) return; // ~20s of streaming, then give up quietly
    clearTimeout(timer);
    timer = setTimeout(poll, 50);
  }

  function on_() {
    if (on) return;
    on = true;
    write(true);
    document.documentElement.setAttribute('data-tef-demo', '1');
    stageStyle(true);
    bg(true);
    exitBtn(true);
    enterBtn(false);
    tries = 0;
    announce(true);
    poll();
  }

  function off() {
    write(false);
    if (!on) return;
    on = false;
    clearTimeout(timer);
    document.documentElement.removeAttribute('data-tef-demo');
    document.documentElement.style.removeProperty('--tef-demo-scale');
    stageStyle(false);
    bg(false);
    exitBtn(false);
    enterBtn(true);
    announce(false);
  }

  /* The flag is watched, not read once — set it any time, from anywhere. */
  function sync() {
    var want = read();
    if (want && on) fit();
    if (want && !on) on_();
    else if (!want && on) off();
  }
  setInterval(sync, 250);
  window.addEventListener('storage', sync);
  window.addEventListener('hashchange', function () {
    var h = (location.hash || '').replace('#', '');
    if (h === 'demo' || h === 'demo=1') on_();
    else if (h === 'demo=0') off();
  });

  window.tefDemo = { on: on_, off: off, toggle: function () { on ? off() : on_(); }, fit: fit };

  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', function () { setTimeout(fit, 120); });
  if (window.ResizeObserver) new ResizeObserver(function () { fit(); }).observe(document.documentElement);

  var esc = 0;
  window.addEventListener('keydown', function (e) {
    var t = e.target, tag = t && t.tagName;
    var typing = tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.isContentEditable);
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'd' || e.key === 'D')) {
      if (typing) return;
      e.preventDefault();
      on ? off() : on_();
      return;
    }
    if (e.key !== 'Escape' || !on) return;
    var now = Date.now();
    if (now - esc < 600) off();
    esc = now;
  });

  if (read()) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', on_);
    else on_();
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { enterBtn(true); });
  } else enterBtn(true);
})();
