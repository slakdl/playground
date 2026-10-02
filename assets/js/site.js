(function () {
  var T = window.DzTheme, D = window.DZ, S = T.state;
  var root = document.documentElement;
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };
  var hexOk = function (h) { return /^#[0-9a-f]{6}$/i.test(h); };
  var hash = function () { return location.hash.replace('#', ''); };

  /* ---------- v.6: one panel at a time ---------- */
  var panels = $$('[data-panel]');
  var tabLinks = $$('.d6 [data-tab]');
  var panelIds = panels.map(function (p) { return p.dataset.panel; });

  function showPanel(id) {
    if (panelIds.indexOf(id) < 0) id = 'home';
    panels.forEach(function (p) { p.classList.toggle('active', p.dataset.panel === id); });
    tabLinks.forEach(function (a) {
      if (a.dataset.tab === id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    root.dataset.tab = id;
  }

  /* ---------- v.1: colour bands, closed on load, one open at a time ---------- */
  var bands = $$('[data-band]');
  var bandLinks = $$('[data-band-link]');

  function openBand(id, scroll) {
    bands.forEach(function (b) {
      var on = b.dataset.band === id;
      b.classList.toggle('open', on);
      b.querySelector('[data-band-toggle]').setAttribute('aria-expanded', String(on));
    });
    var d1 = document.querySelector('.d1');
    if (d1) d1.classList.toggle('has-open', !!id);
    bandLinks.forEach(function (a) {
      if (a.dataset.bandLink === id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    if (scroll && id) {
      var el = document.getElementById('band-' + id);
      if (el) setTimeout(function () {
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 50, behavior: 'smooth' });
      }, 60);
    }
  }
  bands.forEach(function (b) {
    var head = b.querySelector('[data-band-toggle]');
    var toggle = function () { openBand(b.classList.contains('open') ? null : b.dataset.band, false); };
    head.addEventListener('click', toggle);
    head.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });
  var home = document.querySelector('[data-home]');
  if (home) home.addEventListener('click', function (e) {
    e.preventDefault(); openBand(null); window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- routing ---------- */
  function route() {
    var id = hash();
    showPanel(id);
    if (id && id !== 'home') openBand(id, true);
    if (S.design === 'v6') window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
    showPanel(hash());
  if (hash() && S.design === 'v1') openBand(hash(), true);

  document.addEventListener('keydown', function (e) {
    if (/INPUT|TEXTAREA/.test(e.target.tagName) || S.design !== 'v6') return;
    var i = panelIds.indexOf(hash() || 'home');
    if (e.key === 'ArrowRight') location.hash = panelIds[(i + 1) % panelIds.length];
    if (e.key === 'ArrowLeft') location.hash = panelIds[(i - 1 + panelIds.length) % panelIds.length];
  });

  /* ---------- colour / design control ---------- */
  if (!D.tool) return;

  var PRESETS = {
    v6: [
      { name: 'Paper', c: ['#faf8f4', '#1a1716'] },
      { name: 'Night', c: ['#161412', '#eae4d8'] },
      { name: 'Red', c: ['#a8120f', '#fbe7e3'] },
      { name: 'Pink', c: ['#ff5fa2', '#1a0a12'] }
    ],
    // footer, top area, then one per band
    v1: [
      { name: 'Reference', c: ['#1D1D1B', '#EAE4DA', '#C63F3E', '#EAA7C7', '#808BC5', '#EAC119'] },
      { name: 'Outdoors', c: ['#1D1D1B', '#EAE4DA', '#245E55', '#9ED6DF', '#ED773C', '#EAA7C7'] },
      { name: 'Warm', c: ['#1D1D1B', '#EAE4DA', '#ED773C', '#EAC119', '#C63F3E', '#EAA7C7'] },
      { name: 'Cool', c: ['#1D1D1B', '#EAE4DA', '#245E55', '#808BC5', '#9ED6DF', '#EAE4DA'] }
    ]
  };

  var el = function (tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k]; else if (k.indexOf('on') === 0) n.addEventListener(k.slice(2), attrs[k]); else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { n.appendChild(c); });
    return n;
  };

  var tool = el('div', { 'class': 'tool' });
  var panel = el('div', { 'class': 'tool-panel', hidden: '' });
  var pill = el('div', { 'class': 'tool-pill' });
  tool.appendChild(panel); tool.appendChild(pill);
  document.body.appendChild(tool);

  var panelOpen = false, copied = false;

  function rows() {
    if (S.design === 'v6') return [{ key: 'bg', label: 'Background' }, { key: 'text', label: 'Text' }];
    return [{ key: 'paper', label: 'Top area', fg: true }, { key: 'bar', label: 'Footer', fg: true }].concat(
      D.sections.map(function (s) { return { key: 'band-' + s.id, label: s.label, fg: true }; }));
  }

  function setColor(key, v) {
    if (!hexOk(v)) return;
    S.colors[key] = v.toLowerCase(); T.apply(); T.save(); render();
  }
  function cycleFg(key) {
    var order = [undefined, '#0b0b0b', '#ffffff'];
    var next = order[(order.indexOf(S.fg[key]) + 1) % 3];
    if (next) S.fg[key] = next; else delete S.fg[key];
    T.apply(); T.save(); render();
  }
  function setDesign(d) {
    S.design = d; T.apply(); T.save();
    window.scrollTo(0, 0);
    if (d === 'v6') showPanel(hash()); else     render();
  }
  function preset(p) {
    if (S.design === 'v6') { S.colors.bg = p.c[0]; S.colors.text = p.c[1]; }
    else {
      var keys = ['bar', 'paper'].concat(D.sections.map(function (s) { return 'band-' + s.id; }));
      keys.forEach(function (k, i) { if (p.c[i]) S.colors[k] = p.c[i]; });
      S.fg = {};
    }
    T.apply(); T.save(); render();
  }
  function reset() {
    var d = T.defaults;
    Object.keys(d).forEach(function (k) { S.colors[k] = d[k]; });
    S.fg = {}; T.apply(); T.save(); render();
  }
  function copy() {
    var txt = rows().map(function (r) { return r.label + ': ' + S.colors[r.key] + (S.fg[r.key] ? ' (text ' + S.fg[r.key] + ')' : ''); }).join('\n');
    if (navigator.clipboard) navigator.clipboard.writeText(txt);
    copied = true; render(); setTimeout(function () { copied = false; render(); }, 1500);
  }

  function render() {
    // pill: design switch + colours toggle
    pill.textContent = '';
    [['v1', 'v.1'], ['v6', 'v.6']].forEach(function (d) {
      pill.appendChild(el('button', { type: 'button', 'class': S.design === d[0] ? 'on' : '', text: d[1], title: d[0] === 'v1' ? 'Colour bands' : 'Minimal', onclick: function () { setDesign(d[0]); } }));
    });
    pill.appendChild(el('span', { 'class': 'tool-sep' }));
    pill.appendChild(el('button', { type: 'button', 'class': panelOpen ? 'on' : '', text: 'Colours', 'aria-expanded': String(panelOpen), onclick: function () { panelOpen = !panelOpen; render(); } }));

    panel.hidden = !panelOpen;
    if (!panelOpen) return;
    // keep scroll position of the panel across re-renders
    var top = panel.scrollTop;
    panel.textContent = '';
    rows().forEach(function (r) {
      var row = el('div', { 'class': 'tool-row' + (r.fg ? '' : ' no-text') }, [
        el('input', { type: 'color', value: S.colors[r.key], oninput: function (e) { setColorLive(r.key, e.target.value); } }),
        el('span', { text: r.label }),
        el('input', { type: 'text', value: S.colors[r.key], onchange: function (e) { var v = e.target.value.trim(); if (v[0] !== '#') v = '#' + v; setColor(r.key, v); } })
      ]);
      if (r.fg) {
        var f = S.fg[r.key];
        var b = el('button', { type: 'button', 'class': 'aa', title: 'Text colour: auto / black / white', text: f ? 'Aa' : 'A', onclick: function () { cycleFg(r.key); } });
        b.style.background = f || '#fff'; b.style.color = f ? (f === '#ffffff' ? '#000' : '#fff') : '#888';
        row.appendChild(b);
      }
      panel.appendChild(row);
    });
    panel.appendChild(el('div', { 'class': 'tool-h', text: 'Presets' }));
    var pr = el('div', { 'class': 'tool-presets' });
    PRESETS[S.design].forEach(function (p) {
      var dots = el('span', { 'class': 'tool-dots' });
      p.c.forEach(function (c) { var i = el('i'); i.style.background = c; dots.appendChild(i); });
      pr.appendChild(el('button', { type: 'button', onclick: function () { preset(p); } }, [dots, document.createTextNode(p.name)]));
    });
    panel.appendChild(pr);
    panel.appendChild(el('div', { 'class': 'tool-actions' }, [
      el('button', { type: 'button', 'class': 'primary', text: copied ? 'Copied ✓' : 'Copy hex values', onclick: copy }),
      el('button', { type: 'button', text: 'Reset', onclick: reset })
    ]));
    panel.appendChild(el('div', { 'class': 'tool-hint', text: 'H hides this button. Aa = text colour.' }));
    panel.scrollTop = top;
  }

  // Dragging the colour wheel updates the page live without rebuilding the panel (keeps the picker open)
  function setColorLive(key, v) {
    if (!hexOk(v)) return;
    S.colors[key] = v.toLowerCase(); T.apply(); T.save();
    var row = Array.prototype.slice.call(panel.querySelectorAll('.tool-row')).filter(function (r) { return r.querySelector('span').textContent === rows().filter(function (x) { return x.key === key; })[0].label; })[0];
    if (row) row.querySelector('input[type=text]').value = v.toLowerCase();
  }

  document.addEventListener('keydown', function (e) {
    if (/INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.key === 'h' || e.key === 'H') tool.hidden = !tool.hidden;
  });

  render();
})();
