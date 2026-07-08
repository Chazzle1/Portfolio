// Lightweight GLB viewer with graceful placeholder fallback.
// Usage: initViewer({ canvas, hint, modelPath, accentColor, explode })
//
// explode: true turns on a left-right "exploded view" slider — cursor X
// position over the canvas (0 = left edge, 1 = right edge) drives how far
// each top-level part is pushed outward from the assembly's center. Requires
// the GLB to keep parts as separate nodes (don't merge-by-material on export).

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

export function initViewer({ canvas, hint, modelPath, accentColor = 0xffd60a, explode = false, explodeStrength = 0.6, distanceScale = 1.8 }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 5000);
  camera.position.set(2.2, 1.6, 2.2);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.8;
  controls.minDistance = 0.5;
  controls.maxDistance = 20; // widened per-model in frameObject() once the real size is known

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 6, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x0a84ff, 0.8);
  fill.position.set(-4, 2, -3);
  scene.add(fill);
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  let activeObject = null;

  function frameObject(obj) {
    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    obj.position.sub(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const dist = maxDim * distanceScale;
    // OrbitControls' min/maxDistance default to a small fixed range that only
    // suits small models — rescale it to this model's actual size, or larger
    // models silently get clamped in tight regardless of distanceScale.
    controls.minDistance = maxDim * 0.1;
    controls.maxDistance = Math.max(20, dist * 4);
    camera.position.set(dist, dist * 0.7, dist);
    controls.target.set(0, 0, 0);
    controls.update();
  }

  // ── Exploded view (left-right slider) ──────────────────────────────
  // Each direct child of the loaded scene is treated as one "part" and
  // pushed outward along the vector from the assembly's center to its
  // own center, scaled by cursor X position over the canvas.
  let explodeParts = [];
  let explodeDistance = 0;
  let explodeTarget = 0;
  let explodeCurrent = 0;

  // Camera/light nodes some CAD-to-glTF pipelines leave sitting at the scene
  // root (e.g. a stray "current camera") aren't real parts — ignore them when
  // deciding whether a node is just a passthrough wrapper.
  function isPart(obj) {
    return !obj.isCamera && !obj.isLight;
  }

  function setupExplode(root) {
    // Exporters often wrap the whole assembly in one extra transform node —
    // unwrap through any chain of single-part wrappers so "parts" means the
    // actual components, not one lone wrapper (or a wrapper plus a stray camera).
    let partsRoot = root;
    for (let i = 0; i < 5; i++) {
      const real = partsRoot.children.filter(isPart);
      if (real.length === 1 && real[0].children.length > 0) {
        partsRoot = real[0];
      } else {
        break;
      }
    }
    const parts = partsRoot.children.filter(isPart);
    if (parts.length < 2) return; // nothing to explode

    const box = new THREE.Box3().setFromObject(root);
    const assemblyCenter = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    explodeDistance = (Math.max(size.x, size.y, size.z) || 1) * explodeStrength;

    explodeParts = parts.map((child) => {
      const childCenter = new THREE.Box3().setFromObject(child).getCenter(new THREE.Vector3());
      const dir = childCenter.clone().sub(assemblyCenter);
      if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0);
      dir.normalize();
      return { obj: child, origPos: child.position.clone(), dir };
    });

    canvas.addEventListener('pointermove', (e) => {
      const rect = canvas.getBoundingClientRect();
      explodeTarget = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    });
    canvas.addEventListener('pointerleave', () => { explodeTarget = 0; });
  }

  function updateExplode() {
    if (!explodeParts.length) return;
    explodeCurrent += (explodeTarget - explodeCurrent) * 0.08;
    explodeParts.forEach(({ obj, origPos, dir }) => {
      obj.position.copy(origPos).addScaledVector(dir, explodeCurrent * explodeDistance);
    });
  }

  function showPlaceholder() {
    const geo = new THREE.IcosahedronGeometry(1, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: accentColor,
      wireframe: true,
      transparent: true,
      opacity: 0.55
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    activeObject = mesh;
    frameObject(mesh);
    if (hint) hint.style.display = 'flex';
  }

  // Model files can be tens of MB (see fairings.glb) — don't fetch/parse them
  // until the viewer is actually about to scroll into view.
  let modelRequested = false;
  function loadModel() {
    if (modelRequested) return;
    modelRequested = true;
    if (modelPath) {
      const loader = new GLTFLoader();
      loader.load(
        modelPath,
        (gltf) => {
          if (hint) hint.style.display = 'none';
          const root = gltf.scene;
          if (explode) setupExplode(root);
          scene.add(root);
          activeObject = root;
          frameObject(root);
        },
        undefined,
        () => showPlaceholder()
      );
    } else {
      showPlaceholder();
    }
  }

  // Also skip the render loop entirely while off-screen — an auto-rotating
  // model re-renders every frame forever otherwise, even scrolled away.
  let isVisible = false;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      isVisible = entry.isIntersecting;
      if (isVisible) loadModel();
    });
  }, { rootMargin: '400px 0px' });
  io.observe(canvas);

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;
    resize();
    controls.update();
    updateExplode();
    renderer.render(scene, camera);
  }
  animate();
}
