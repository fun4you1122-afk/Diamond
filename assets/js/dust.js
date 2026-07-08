/* =========================================================================
   Diamond Events — "golden dust" particle signature
   Vanilla port of a React/three-fiber particle component: 10,000 gold
   particles cycle between scattered dust, brand words sampled from a
   canvas-rendered glyph mask, and 3D shapes (a brilliant-cut diamond,
   a ring, a sphere). Same shader + phase machine as the original.
   Skipped entirely under prefers-reduced-motion or if WebGL is missing;
   the loop only runs while the section is on screen.
   ========================================================================= */
import * as THREE from '../vendor/three.module.min.js';

const CONFIG = {
  sequence: [
    { type: 'text', text: 'DIAMOND' },
    { type: 'shape', shape: 'diamond' },
    { type: 'text', text: 'EVENTS' },
    { type: 'shape', shape: 'torus' },
    { type: 'text', text: 'WEDDINGS & FLOWERS' },
    { type: 'shape', shape: 'sphere' }
  ],
  particleCount: 10000,
  particleColor: '#e7cd92',
  particleSize: 0.02,
  fontFamily: "'Montserrat', sans-serif",
  holdDuration: 3.0,
  animationSpeed: 1.0,
  scatterRadius: 12,
  maxComponentWidth: 15.0
};

/* ---------------- position generators ---------------- */

function getScatteredPositions(count, radius) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = Math.cbrt(Math.random()) * radius;
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);
  }
  return pos;
}

function getTextPositions(text, count, size, fontFamily) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return new Float32Array(count * 3);

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 1024, 1024);
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let fontSize = 220;
  ctx.font = '700 ' + fontSize + 'px ' + fontFamily;
  const textWidth = ctx.measureText(text).width;
  if (textWidth > 900) {
    fontSize = Math.floor(fontSize * (900 / textWidth));
    ctx.font = '700 ' + fontSize + 'px ' + fontFamily;
  }
  ctx.fillText(text, 512, 512);

  const imgData = ctx.getImageData(0, 0, 1024, 1024).data;
  const points = [];
  for (let i = 0; i < 1024 * 1024; i++) {
    if (imgData[i * 4] > 128) {
      const x = i % 1024;
      const y = Math.floor(i / 1024);
      points.push({ x: (x / 1024 - 0.5) * size, y: -(y / 1024 - 0.5) * size });
    }
  }

  const positions = new Float32Array(count * 3);
  if (!points.length) return positions;
  for (let i = 0; i < count; i++) {
    const p = points[(Math.random() * points.length) | 0];
    positions[i * 3] = p.x + (Math.random() - 0.5) * 0.15;
    positions[i * 3 + 1] = p.y + (Math.random() - 0.5) * 0.15;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
  }
  return positions;
}

function getTorusPositions(count, scale) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI * 2;
    const radius = 2.5, tube = 1.0;
    pos[i * 3] = ((radius + tube * Math.cos(v)) * Math.cos(u)) * scale + (Math.random() - 0.5) * 0.3;
    pos[i * 3 + 1] = ((radius + tube * Math.cos(v)) * Math.sin(u)) * scale + (Math.random() - 0.5) * 0.3;
    pos[i * 3 + 2] = (tube * Math.sin(v)) * scale + (Math.random() - 0.5) * 0.3;
  }
  return pos;
}

function getSpherePositions(count, radius) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta) + (Math.random() - 0.5) * 0.2;
    pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) + (Math.random() - 0.5) * 0.2;
    pos[i * 3 + 2] = radius * Math.cos(phi) + (Math.random() - 0.5) * 0.2;
  }
  return pos;
}

/* Brilliant-cut diamond (the brand mark): octagonal table + crown +
   pavilion, sampled on the surface with faceted (polygonal) sides. */
function getDiamondPositions(count) {
  const SIDES = 8;
  const step = (Math.PI * 2) / SIDES;
  const facet = (theta) => {
    const a = (((theta % step) + step) % step) - step / 2;
    return Math.cos(step / 2) / Math.cos(a);
  };
  const R = 3.2, tableR = 1.75, crownH = 1.3, pavH = 3.5, yOff = 0.9;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const f = facet(theta);
    const sel = Math.random();
    let r, y;
    if (sel < 0.14) {                 // flat table on top
      r = Math.sqrt(Math.random()) * tableR * f;
      y = crownH;
    } else if (sel < 0.42) {          // crown slope
      const t = Math.random();
      r = (tableR + (R - tableR) * t) * f;
      y = crownH * (1 - t);
    } else {                          // pavilion down to the point
      const t = Math.random();
      r = R * (1 - t) * f;
      y = -pavH * t;
    }
    pos[i * 3] = r * Math.cos(theta) + (Math.random() - 0.5) * 0.15;
    pos[i * 3 + 1] = y + yOff + (Math.random() - 0.5) * 0.15;
    pos[i * 3 + 2] = r * Math.sin(theta) + (Math.random() - 0.5) * 0.15;
  }
  return pos;
}

/* left-to-right build order with a little randomness */
function getOrderedDelays(target, count) {
  const delays = new Float32Array(count);
  let minX = Infinity, maxX = -Infinity;
  for (let i = 0; i < count; i++) {
    const x = target[i * 3];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
  }
  const range = (maxX - minX) || 1;
  for (let i = 0; i < count; i++) {
    delays[i] = ((target[i * 3] - minX) / range) * 0.7 + Math.random() * 0.3;
  }
  return delays;
}

/* ---------------- shaders (as in the source component) ---------------- */

const vertexShader = `
attribute vec3 aTarget;
attribute float aDelay;
attribute float aSize;
uniform float uProgress;
uniform float uSize;
varying float vAlpha;
void main() {
  float p = clamp((uProgress - aDelay) * 3.0, 0.0, 1.0);
  float ease = p < 0.5 ? 4.0 * p * p * p : 1.0 - pow(-2.0 * p + 2.0, 3.0) / 2.0;
  vec3 finalPos = mix(position, aTarget, ease);
  vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
  gl_PointSize = uSize * aSize * (1.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
  vAlpha = smoothstep(0.0, 0.2, p);
}`;

const fragmentShader = `
uniform vec3 uColor;
varying float vAlpha;
void main() {
  vec2 cxy = 2.0 * gl_PointCoord - 1.0;
  float r = dot(cxy, cxy);
  if (r > 1.0) discard;
  float alpha = 1.0 - smoothstep(0.7, 1.0, r);
  gl_FragColor = vec4(uColor, alpha * vAlpha * 0.5);
}`;

/* ---------------- bootstrap ---------------- */

(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const host = document.getElementById('dust-canvas');
  if (!host) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (e) {
    return; /* no WebGL: the section still shows its static heading */
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 9;

  /* build all targets once fonts are ready so text sampling is accurate */
  const fontSpec = '700 220px ' + CONFIG.fontFamily;
  Promise.resolve(document.fonts && document.fonts.load ? document.fonts.load(fontSpec) : null)
    .catch(function () {})
    .then(function () { return (document.fonts && document.fonts.ready) || null; })
    .then(start);

  function start() {
    const count = CONFIG.particleCount;
    const origin = getScatteredPositions(count, CONFIG.scatterRadius);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) sizes[i] = Math.random() * 0.8 + 0.4;

    const targets = CONFIG.sequence.map(function (item) {
      let dest, isText = false;
      if (item.type === 'text') {
        dest = getTextPositions(item.text, count, 12, CONFIG.fontFamily);
        isText = true;
      } else if (item.shape === 'diamond') {
        dest = getDiamondPositions(count);
      } else if (item.shape === 'torus') {
        dest = getTorusPositions(count, 2.0);
      } else {
        dest = getSpherePositions(count, 4);
      }
      return { dest: dest, delays: getOrderedDelays(dest, count), isText: isText };
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(origin, 3));
    geo.setAttribute('aTarget', new THREE.BufferAttribute(targets[0].dest.slice(), 3));
    geo.setAttribute('aDelay', new THREE.BufferAttribute(targets[0].delays.slice(), 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        uProgress: { value: 0 },
        uSize: { value: 10.0 },
        uColor: { value: new THREE.Color(CONFIG.particleColor) }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    /* phase machine */
    let currentProgress = 0, targetProgress = 0, targetIndex = 0;
    let phase = 'CONSTRUCTING', holdTimer = 0, elapsed = 0;

    function resize() {
      const w = host.clientWidth || 1, h = host.clientHeight || 1;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      mat.uniforms.uSize.value = Math.min(w, h) * CONFIG.particleSize * renderer.getPixelRatio();
    }
    window.addEventListener('resize', resize, { passive: true });
    resize();

    /* only animate while the section is on screen */
    let running = false, rafId = 0, lastT = 0;
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && !running) { running = true; lastT = 0; rafId = requestAnimationFrame(frame); }
        else if (!en.isIntersecting && running) { running = false; cancelAnimationFrame(rafId); }
      });
    }, { threshold: 0 });
    io.observe(host);

    function frame(t) {
      if (!running) return;
      rafId = requestAnimationFrame(frame);
      const delta = Math.min(lastT ? (t - lastT) / 1000 : 0.016, 0.05);
      lastT = t;
      elapsed += delta;

      if (phase === 'CONSTRUCTING') {
        targetProgress = Math.min(1.5, targetProgress + delta * 0.4 * CONFIG.animationSpeed);
        if (targetProgress === 1.5) { phase = 'HOLDING'; holdTimer = 0; }
      } else if (phase === 'HOLDING') {
        holdTimer += delta;
        if (holdTimer > CONFIG.holdDuration) phase = 'DECONSTRUCTING';
      } else {
        targetProgress = Math.max(0, targetProgress - delta * 0.6 * CONFIG.animationSpeed);
        if (targetProgress === 0) {
          targetIndex = (targetIndex + 1) % targets.length;
          geo.attributes.aTarget.array.set(targets[targetIndex].dest);
          geo.attributes.aTarget.needsUpdate = true;
          geo.attributes.aDelay.array.set(targets[targetIndex].delays);
          geo.attributes.aDelay.needsUpdate = true;
          phase = 'CONSTRUCTING';
        }
      }

      currentProgress += (targetProgress - currentProgress) * 0.1;
      mat.uniforms.uProgress.value = currentProgress;

      /* never overflow the viewport: clamp world scale to the visible width */
      const visH = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
      const visW = visH * camera.aspect;
      const s = Math.min(1, visW / CONFIG.maxComponentWidth);
      points.scale.set(s, s, s);

      if (targets[targetIndex].isText) {
        const snapY = Math.round(points.rotation.y / (Math.PI * 2)) * (Math.PI * 2);
        points.rotation.y += (snapY - points.rotation.y) * 0.08;
      } else {
        points.rotation.y += delta * 0.15;
      }
      points.rotation.x = Math.sin(elapsed * 0.2) * 0.1;

      renderer.render(scene, camera);
    }
  }
})();
