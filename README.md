# Portfolio Site

A 6-page portfolio in an "Apple feature page" style: large type, soft yellow/blue glow
accents on black, scroll-triggered reveals, and a sticky translucent nav bar.

## How this is organized

Each top-level `.html` file (`index.html`, `3d-scans.html`, etc.) is a **self-contained
page** &mdash; CSS and JS are inlined directly into the file. That means:

- Opening any `.html` file in a browser (or pasting it into Claude's preview) shows it
  exactly as it will look when deployed &mdash; no missing styles.
- You don't need a server or build step to view the site.

These self-contained pages are *generated* from source files in `_build/`, so the
source stays easy to edit and the output stays simple to preview/host.

```
index.html, 3d-scans.html, ...    ← generated, self-contained pages (these get deployed)
css/style-apple.css               ← the one shared stylesheet (source of truth)
js/reveal.js                      ← scroll reveals, nav, count-up animation (source of truth)
js/viewer-init.js                 ← shared Three.js GLB viewer (loaded live, not inlined)
models/                           ← drop .glb files here — see models/README.md
assets/images/                    ← drop photos here — see assets/images/README.md
_build/
  build.py                        ← regenerates the pages above from the sources below
  templates/_head.html            ← <head> + <style> wrapper (CSS gets inlined here)
  templates/_foot.html            ← <script> wrapper (JS gets inlined here)
  templates/_nav.html             ← shared nav bar + mobile menu
  templates/_footer.html          ← shared footer
  bodies/body-*.html              ← the actual page content for each tab
  bodies/body-TEMPLATE.html       ← starting point for a brand-new tab
```

## Making changes

**Easiest:** just describe the change (new photo, new project, new tab, copy edits) and
Claude can edit the right `_build/` source file(s) and rebuild for you.

**Doing it yourself:**

1. Edit the relevant file under `_build/` (a body fragment for content, `css/style-apple.css`
   for styling, `js/reveal.js` for behavior).
2. From the `portfolio/` folder, run:
   ```
   python3 _build/build.py
   ```
3. This regenerates all 6 top-level `.html` files. Refresh your browser / re-upload to preview.

## Adding photos

See `assets/images/README.md`. Short version: replace a placeholder `<div
class="feature__visual-label">...</div>` with `<img src="assets/images/yourphoto.jpg"
alt="...">` and add `has-media` to the parent's class list, then rebuild.

## Adding a 3D model viewer

See `models/README.md`. Drop a `.glb` file in `models/` with the expected name and the
existing viewers on the 3D Scans and Personal Projects pages will pick it up
automatically (they currently show a placeholder wireframe shape).

## Adding a whole new tab

1. Copy `_build/bodies/body-TEMPLATE.html` to `_build/bodies/body-your-page.html` and
   fill in the content (instructions are in the template's comments).
2. Add a line to the `PAGES` list in `_build/build.py`.
3. Add a nav link to `_build/templates/_nav.html` (desktop nav + mobile menu) &mdash;
   this one template feeds every page's nav.
4. Run `python3 _build/build.py`.

Or just send Claude the content for the new tab and it'll do all of the above and
rebuild everything.

## First things to personalize

1. **"Your Name"** &mdash; appears in `_build/templates/_nav.html` and in each page's
   `<title>` (set in `_build/build.py`'s `PAGES` list).
2. **Contact links** &mdash; in `_build/templates/_footer.html` (email, LinkedIn, GitHub).
3. **Resume PDF** &mdash; the Resume page links to `resume.pdf`; export your resume and
   place it in the root folder (or update the link in `_build/bodies/body-resume.html`).
4. After any of the above, run `python3 _build/build.py` to regenerate the pages.

## Hosting on GitHub Pages

Push the contents of this folder to a repo (or `/docs` folder), then in
Settings &rarr; Pages set the source to that location. No build step runs on GitHub
&mdash; the generated `.html` files are what gets served. Just make sure you've run
`python3 _build/build.py` after your last edit before pushing.

## Notes on the 3D viewers

- Three.js (r0.160) loads at runtime from the `unpkg.com` CDN via `js/viewer-init.js`.
- Each viewer auto-rotates slowly and supports drag-to-orbit / scroll-to-zoom.
- If a `.glb` isn't found, a wireframe placeholder is shown instead, so the page never
  looks broken before you add models.
