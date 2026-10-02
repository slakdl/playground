// Applies design + colours before the page paints (loaded in <head>).
(function () {
  var KEY = 'dzidra-theme-v3';
  var D = window.DZ;
  var root = document.documentElement;

  function lum(h) {
    var c = [1, 3, 5].map(function (i) {
      var v = parseInt(h.slice(i, i + 2), 16) / 255;
      return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4);
    });
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
  }
  function autoFg(h) { return lum(h) > .18 ? '#0b0b0b' : '#ffffff'; }

  // Colour keys: bg, text (v.6) · bar, band-<id> (v.1)
  var defaults = { bg: D.v6.bg, text: D.v6.text, bar: D.bar, paper: D.paper };
  D.sections.forEach(function (s) { defaults['band-' + s.id] = s.color; });

  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
  var fromUrl = (location.search.match(/[?&]design=(v1|v6)/) || [])[1];

  var state = {
    design: fromUrl || saved.design || D.design,
    colors: Object.assign({}, defaults, saved.colors || {}),
    fg: saved.fg || {}          // forced text colours for v.1 bands ('#0b0b0b' or '#ffffff')
  };

  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  function apply() {
    root.dataset.design = state.design;
    var st = root.style, c = state.colors;
    st.setProperty('--bg', c.bg);
    st.setProperty('--fg', c.text);
    Object.keys(defaults).forEach(function (k) {
      if (k === 'bg' || k === 'text') return;
      st.setProperty('--' + k, c[k]);
      st.setProperty('--' + k + '-fg', state.fg[k] || autoFg(c[k]));
    });
  }

  window.DzTheme = { state: state, defaults: defaults, apply: apply, save: save, autoFg: autoFg };
  apply();
})();
