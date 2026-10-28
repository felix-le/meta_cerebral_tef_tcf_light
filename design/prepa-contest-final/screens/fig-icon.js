// <fig-icon name="IconBulkHeadphone" size="36"> — paints icon-data.js glyphs
// extracted from the .fig. Bodies use fill="currentColor", so recolor with
// the CSS `color` property on the element.
(function () {
  var DATA = window.__figIconData || null;
  var pending = [];

  function paint(el) {
    // Leave the <x-dc> template alone: the runtime reads it as markup, and icons
    // painted into it become React children that a later repaint pulls out.
    if (el.closest && el.closest('x-dc')) return;
    if (!DATA) { pending.push(el); return; }
    var d = DATA[el.getAttribute('name')];
    var s = el.getAttribute('size') || '24';
    el.style.display = 'inline-flex';
    el.style.flexShrink = '0';
    el.style.width = s + 'px';
    el.style.height = s + 'px';
    el.innerHTML = d
      ? '<svg width="' + s + '" height="' + s + '" viewBox="' + d.viewBox +
        '" fill="none" style="display:block">' + d.body + '</svg>'
      : '';
  }
  window.__figIconPaint = paint;

  if (!DATA) {
    import('./icons/icon-data.js').then(function (m) {
      DATA = window.__figIconData = m.default || m;
      pending.forEach(paint);
      pending = [];
      document.querySelectorAll('fig-icon').forEach(paint);
    });
  }

  if (!customElements.get('fig-icon')) {
    customElements.define('fig-icon', class extends HTMLElement {
      static get observedAttributes() { return ['name', 'size']; }
      connectedCallback() { window.__figIconPaint(this); }
      attributeChangedCallback() { if (this.isConnected) window.__figIconPaint(this); }
    });
  } else {
    document.querySelectorAll('fig-icon').forEach(paint);
  }
})();
