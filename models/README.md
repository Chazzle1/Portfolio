# 3D Models

Drop GLB files here with these exact names to power the interactive viewers:

- `hokiebird.glb` &mdash; used on **detail-hokiebird.html** (Hokiebird 3D Scan to Statue)
- `motor_asm.glb` &mdash; used on **projects.html** (BOLT motor mount assembly) &mdash; **exploded view**
- `fairings.glb` &mdash; used on **projects.html** (BOLT bodywork) &mdash; **exploded view** &mdash; currently ~86MB, see size note below
- `cessna.glb` &mdash; used on **projects.html** (RC Cessna 172) &mdash; **exploded view**

## Getting a .glb file

- **From the Hokiebird Blender file**: File &gt; Export &gt; glTF 2.0 (.glb/.gltf), choose
  the `.glb` (binary) format, and save it here under the exact filename above.
- **From SolidWorks / Fusion 360 / NX (BOLT motor mount, Cessna, or full bike)**: export as
  `.glb` directly if your version supports it, or export to `.step`/`.obj` and convert with
  a free tool like Blender (File &gt; Import, then File &gt; Export &gt; glTF 2.0).

### Exporting for the exploded-view models (BOLT, Cessna)

These two use `explode: true`, which pushes each top-level part outward as the cursor
moves left-to-right over the canvas. This only works if the export keeps parts as
**separate objects** — the viewer explodes each direct child of the scene individually:

- In your CAD assembly, keep each component as its own part/body — don't do a "merge
  all bodies" or "combine" step before exporting.
- If exporting via Blender: don't use *Join* (Ctrl+J) to combine meshes, and turn off
  any "merge vertices/objects" option in the glTF export dialog.
- A model that comes in as a single mesh will still display and rotate fine — it just
  won't have anything to explode (the viewer silently no-ops in that case).

## Tips for a good result

- Keep file size reasonable (under ~15MB) so the page loads quickly. `fairings.glb` is
  currently ~86MB &mdash; that's a multi-second (or worse, on mobile) blank canvas for every
  visitor before anything renders, and GitHub warns on pushes over 50MB. Worth running it
  through `gltfpack` or Blender's Draco/mesh-compression export options before this goes
  live &mdash; should get it down to a fraction of that with no visible quality loss on a
  web-sized viewer.
- If the model looks too dark, it may be missing materials &mdash; a simple gray/metal
  material before export usually looks best against the dark background.
- If a file with the expected name isn't found, the viewer automatically falls back
  to a placeholder wireframe icosahedron so the page never looks broken.

## Adding more viewers later

Each viewer is powered by `js/viewer-init.js`. To add one to a new page:

```html
<div class="feature__visual reveal" style="--glow-a: var(--yellow); --glow-b: var(--blue);">
  <div class="viewer__badge">Drag to rotate</div>
  <div class="viewer"><canvas id="my-canvas"></canvas></div>
  <div class="viewer__hint" id="my-hint"><span>3D MODEL VIEWER<br>Drop my-model.glb into /models</span></div>
</div>
```

```html
<script type="module">
  import { initViewer } from './js/viewer-init.js';
  initViewer({
    canvas: document.getElementById('my-canvas'),
    hint: document.getElementById('my-hint'),
    modelPath: 'models/my-model.glb',
    accentColor: 0xffd60a
  });
</script>
```

Add the script tag right before `</body>` (after the `__FOOTER__` line in the body
fragment), then rebuild.
