# Dzidra

Jekyll site for Dzidra (v.6 minimal), with content edited through [Pages CMS](https://pagescms.org).

- `_data/site.yml`: all content (colours, logo, address, hours, tabs with menus, events, text). Pages CMS edits this file.
- `.pages.yml`: Pages CMS configuration
- `index.html`: the single page; every tab is a section, shown one at a time via the URL hash (`#food`, `#about`, …)
- `_layouts/default.html`, `assets/css/dzidra.css`, `assets/js/site.js`: design and tab switching
- `assets/uploads/`: images uploaded through the CMS

Without JavaScript all tabs are listed one after another.

## Run locally
`bundle install && bundle exec jekyll serve`, then open http://localhost:4000

## Deploy
Push to GitHub and enable Pages (Settings → Pages → deploy from branch), then add the repo in Pages CMS.
