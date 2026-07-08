#!/usr/bin/env python3
"""
Builds self-contained HTML pages by combining:
  - _build/templates/_head.html (with __TITLE__ / __CSS__)
  - _build/templates/_nav.html
  - _build/bodies/body-*.html  (with __NAV__ / __FOOTER__ placeholders)
  - _build/templates/_footer.html
  - _build/templates/_foot.html (with __JS__)

Run from the portfolio/ directory: python3 _build/build.py
"""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
TPL = ROOT / "_build" / "templates"
BODIES = ROOT / "_build" / "bodies"

DESC = ("Mechanical engineering portfolio of Charlie Steinman — Virginia Tech, Class of 2026. "
        "CAD, FEA, carbon fiber fabrication, and embedded systems projects, from an electric race "
        "motorcycle to a 3D-printed RC aircraft.")

CSS = (ROOT / "css" / "style-apple.css").read_text(encoding="utf-8")
JS = (ROOT / "js" / "reveal.js").read_text(encoding="utf-8")
HEAD = (TPL / "_head.html").read_text(encoding="utf-8")
FOOT = (TPL / "_foot.html").read_text(encoding="utf-8")
NAV = (TPL / "_nav.html").read_text(encoding="utf-8")
FOOTER = (TPL / "_footer.html").read_text(encoding="utf-8")

PAGES = [
    ("index.html", "Charlie Steinman — Mechanical Engineering Portfolio", "body-index.html"),
    ("internships.html", "Internships — Charlie Steinman", "body-internships.html"),
    ("projects.html",          "Projects — Charlie Steinman",           "body-projects.html"),
    ("resume.html", "Resume — Charlie Steinman", "body-resume.html"),
    ("shop.html",          "Files / Prints — Charlie Steinman",        "body-shop.html"),
    ("detail-caterpillar.html", "Caterpillar — Charlie Steinman",       "body-detail-caterpillar.html"),
    ("detail-hendrick.html",    "Hendrick Motorsports — Charlie Steinman", "body-detail-hendrick.html"),
    ("detail-hokiebird.html",   "Hokiebird — Charlie Steinman",         "body-detail-hokiebird.html"),
    ("detail-bolt.html",        "BOLT Motorcycle — Charlie Steinman",   "body-detail-bolt.html"),
    ("detail-northrop.html",    "Northrop Grumman — Charlie Steinman",  "body-detail-northrop.html"),
    ("detail-moped.html",        "Honda Elite 50 — Charlie Steinman",    "body-detail-moped.html"),
    ("detail-cessna.html",       "RC Cessna 172 — Charlie Steinman",     "body-detail-cessna.html"),
    ("detail-stock-ticker.html", "Stock Ticker — Charlie Steinman",      "body-detail-stock-ticker.html"),
    ("detail-tidy.html",         "TIDY T-Shirt Folder — Charlie Steinman", "body-detail-tidy.html"),
    ("detail-pool-fence.html",   "Pool Fence — Charlie Steinman",        "body-detail-pool-fence.html"),
]

# indent CSS/JS nicely inside <style>/<script>
def indent(text, spaces=4):
    pad = " " * spaces
    return "\n".join(pad + line if line.strip() else line for line in text.splitlines())

head_filled = HEAD.replace("__CSS__", indent(CSS))
foot_filled = FOOT.replace("__JS__", indent(JS))

for out_name, title, body_name in PAGES:
    body = (BODIES / body_name).read_text(encoding="utf-8")
    body = body.replace("__NAV__", NAV).replace("__FOOTER__", FOOTER)
    html = head_filled.replace("__TITLE__", title).replace("__DESC__", DESC) + body + foot_filled
    out_path = ROOT / out_name
    out_path.write_text(html, encoding="utf-8")
    print(f"built {out_name}  ({len(html):,} bytes)")
