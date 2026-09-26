// Shared rendering for every page. Each page loads content/site.json for the
// chrome that never changes, plus one page file of its own.

export const $ = (key, root = document) => root.querySelector(`[data-bind="${key}"]`);

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => (
  { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]
));

const here = () => location.pathname.replace(/index\.html$/, "") || "/";

// A nav link is current when its path matches the page we are on, ignoring
// any #fragment — so WINE lights up on the menu page too.
function isCurrent(href) {
  if (!href.startsWith("/")) return false;
  const path = href.split("#")[0].replace(/index\.html$/, "") || "/";
  return path === here();
}

const link = (l) =>
  `<a href="${esc(l.href)}"${isCurrent(l.href) ? ' class="is-current" aria-current="page"' : ""}>${esc(l.label)}</a>`;

function renderChrome(site) {
  document.title = site.name.toLowerCase();
  $("copyright").textContent = site.copyright;
  site.nav.forEach((l, i) => { const n = $(`nav-${i}`); if (n) n.innerHTML = link(l); });
  site.subnav.forEach((l, i) => { const n = $(`sub-${i}`); if (n) n.innerHTML = link(l); });
  $("legal").innerHTML = site.footer.legal.map((l) => `<span>${esc(l)}</span>`).join("");
  site.footer.links.forEach((l, i) => { const n = $(`foot-${i}`); if (n) n.innerHTML = link(l); });
}

export function blocks(list) {
  return list.map((b) => `
    <div class="block">
      <h3>${esc(b.title)}</h3>
      <p>${b.lines.map(esc).join("<br>")}</p>
    </div>`).join("");
}

// Loads the chrome and this page's own content, then hands the page data back.
export function page(file, render) {
  Promise.all([
    fetch("/content/site.json").then((r) => r.json()),
    fetch(`/content/${file}`).then((r) => r.json()),
  ])
    .then(([site, data]) => {
      renderChrome(site);
      render(data, site);
    })
    .catch((err) => {
      document.body.innerHTML =
        `<p style="font-size:11px">content could not be loaded (${esc(err.message)}) — serve this over http, not file://</p>`;
    });
}
