(function () {
  var root = document.documentElement;
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };
  var hash = function () { return location.hash.replace('#', ''); };

  /* ---------- one panel at a time ---------- */
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

  /* ---------- routing ---------- */
  window.addEventListener('hashchange', function () { showPanel(hash()); window.scrollTo(0, 0); });
  showPanel(hash());

  document.addEventListener('keydown', function (e) {
    if (/INPUT|TEXTAREA/.test(e.target.tagName)) return;
    var i = panelIds.indexOf(hash() || 'home');
    if (e.key === 'ArrowRight') location.hash = panelIds[(i + 1) % panelIds.length];
    if (e.key === 'ArrowLeft') location.hash = panelIds[(i - 1 + panelIds.length) % panelIds.length];
  });
})();
