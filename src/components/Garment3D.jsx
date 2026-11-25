import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, useGLTF } from '@react-three/drei';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BODY, garmentSvg } from '../data/garmentArt.js';
import { StudioLights, FabricRig, LogoDecal } from './studio3d.jsx';

const S = 0.011;
const DEPTH = 30;
const BEV = 7;
const bulge = x => 0.55 + 0.9 * (1 - Math.min(1, Math.abs(x - 100) / 90) ** 2);

function Garment({ garment, colour, pattern }) {
  const [tex, setTex] = useState(null);

  const geo = useMemo(() => {
    const d = BODY[garment] || BODY.Shirt;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path fill="#000" d="${d}"/></svg>`;
    const data = new SVGLoader().parse(svg);
    const shapes = SVGLoader.createShapes(data.paths[0]);
    let g = new THREE.ExtrudeGeometry(shapes, { depth: DEPTH, bevelEnabled: true, bevelThickness: BEV, bevelSize: 6, bevelSegments: 6, curveSegments: 10 });
    g.translate(-100, -110, -DEPTH / 2);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, pos.getZ(i) * bulge(pos.getX(i) + 100));
    g.deleteAttribute('normal');
    g.deleteAttribute('uv');
    g = mergeVertices(g);
    g.computeVertexNormals();
    const gp = g.attributes.position;
    const uv = new Float32Array(gp.count * 2);
    for (let i = 0; i < gp.count; i++) {
      const x = gp.getX(i), y = gp.getY(i), z = gp.getZ(i);
      const zr = z / bulge(x + 100);
      const u = (x + 100) / 200;
      const v = 1 - (y + 110) / 220;
      const front = zr < -(DEPTH / 2 + BEV) + 4;
      uv[i * 2] = front ? u * 0.5 : 0.5 + u * 0.5;
      uv[i * 2 + 1] = v;
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.scale(S, S, S);
    return g;
  }, [garment]);

  useEffect(() => {
    let dead = false;
    let t = null;
    const stroke = colour.toLowerCase() === '#ffffff' ? '#999999' : 'rgba(0,0,0,0.35)';
    let inner = '';
    try { inner = garmentSvg(garment, { colour, stroke, pattern, id: 'g3d' }); } catch { inner = ''; }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="1000" height="1100">${inner}</svg>`;
    const lum = (() => { const c = new THREE.Color(colour); return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b; })();
    const overlay = lum > 0.45 ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.22)';
    const img = new Image();
    img.onload = () => {
      if (dead) return;
      const c = document.createElement('canvas');
      c.width = 2000; c.height = 1100;
      const x = c.getContext('2d');
      x.fillStyle = colour; x.fillRect(0, 0, 2000, 1100);
      x.drawImage(img, 0, 0, 1000, 1100);
      try { x.getImageData(0, 0, 1, 1); } catch (e) { console.warn('3D texture blocked', e); x.fillStyle = colour; x.fillRect(0, 0, 1000, 1100); }
      x.fillStyle = colour; x.fillRect(1000, 0, 1000, 1100);
      x.fillStyle = overlay;
      if (pattern === 'Stripes' || pattern === 'Checks') for (let i = 0; i < 1000; i += 80) x.fillRect(1000 + i, 0, 40, 1100);
      if (pattern === 'Checks') for (let j = 0; j < 1100; j += 80) x.fillRect(1000, j, 1000, 40);

      t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      setTex(t);
    };
    img.onerror = e => console.warn('3D svg image failed', e);
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    return () => { dead = true; if (t) t.dispose(); };
  }, [garment, colour, pattern]);

  return (
    <mesh geometry={geo} rotation={[Math.PI, 0, 0]}>
      <meshStandardMaterial key={tex ? 'with-map' : 'no-map'} color={tex ? '#ffffff' : colour} map={tex} roughness={0.85} />
    </mesh>
  );
}

function ShirtModel({ colour, pattern }) {
  const { scene } = useGLTF('/models/shirt/scene.gltf');
  const { model, k, c } = useMemo(() => {
    const m = scene.clone(true);
    m.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.userData.orig = o.material.map; } });
    const box = new THREE.Box3().setFromObject(m);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    return { model: m, k: 2.6 / Math.max(size.x, size.y, size.z), c };
  }, [scene]);
  useEffect(() => {
    let stripeTex = null;
    if (pattern === 'Stripes' || pattern === 'Checks') {
      const cv = document.createElement('canvas');
      cv.width = 256; cv.height = 256;
      const x = cv.getContext('2d');
      x.fillStyle = colour; x.fillRect(0, 0, 256, 256);
      x.fillStyle = 'rgba(255,255,255,0.35)';
      for (let i = 0; i < 256; i += 32) x.fillRect(i, 0, 12, 256);
      if (pattern === 'Checks') for (let j = 0; j < 256; j += 32) x.fillRect(0, j, 256, 12);
      stripeTex = new THREE.CanvasTexture(cv);
      stripeTex.colorSpace = THREE.SRGBColorSpace;
      stripeTex.wrapS = stripeTex.wrapT = THREE.RepeatWrapping;
      stripeTex.repeat.set(14, 14);
    }
    model.traverse(o => {
      if (o.isMesh && o.material.name.includes('Material4782')) {
        const m = o.material;
        if (pattern === 'Checks' || pattern === 'Stripes') { m.map = stripeTex; m.color.set('#ffffff'); }
        else { m.map = null; m.color.set(colour); }
        m.needsUpdate = true;
      }
    });
    return () => { if (stripeTex) stripeTex.dispose(); };
  }, [model, colour, pattern]);
  return (
    <group scale={k}>
      <primitive object={model} position={[-c.x, -c.y, -c.z]} />
    </group>
  );
}

function PantsModel({ colour, pattern }) {
  const { scene } = useGLTF('/models/pants/scene.gltf');
  const { model, k, c } = useMemo(() => {
    const m = scene.clone(true);
    m.traverse(o => { if (o.isMesh) o.material = o.material.clone(); });
    const box = new THREE.Box3().setFromObject(m);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    return { model: m, k: 2.6 / Math.max(size.x, size.y, size.z), c };
  }, [scene]);
  useEffect(() => {
    let tex = null;
    if (pattern === 'Stripes' || pattern === 'Checks') {
      const cv = document.createElement('canvas');
      cv.width = 256; cv.height = 256;
      const x = cv.getContext('2d');
      x.fillStyle = colour; x.fillRect(0, 0, 256, 256);
      x.fillStyle = 'rgba(255,255,255,0.35)';
      for (let i = 0; i < 256; i += 32) x.fillRect(i, 0, 12, 256);
      if (pattern === 'Checks') for (let j = 0; j < 256; j += 32) x.fillRect(0, j, 256, 12);
      tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(0.5, 0.5);
    }
    model.traverse(o => {
      if (o.isMesh) {
        o.material.map = tex;
        o.material.color.set(tex ? '#ffffff' : colour);
        o.material.needsUpdate = true;
      }
    });
    return () => { if (tex) tex.dispose(); };
  }, [model, colour, pattern]);
  return (
    <group scale={k}>
      <primitive object={model} position={[-c.x, -c.y, -c.z]} />
    </group>
  );
}

function LabCoatModel({ colour, pattern }) {
  const { scene } = useGLTF('/models/labcoat/scene.gltf');
  const { model, k, c } = useMemo(() => {
    const m = scene.clone(true);
    m.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.userData.orig = o.material.map; } });
    const box = new THREE.Box3().setFromObject(m);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    return { model: m, k: 2.6 / Math.max(size.x, size.y, size.z), c };
  }, [scene]);
  useEffect(() => {
    let tex = null;
    if (pattern === 'Stripes' || pattern === 'Checks') {
      const cv = document.createElement('canvas');
      cv.width = 256; cv.height = 256;
      const x = cv.getContext('2d');
      x.fillStyle = colour; x.fillRect(0, 0, 256, 256);
      x.fillStyle = 'rgba(255,255,255,0.35)';
      for (let i = 0; i < 256; i += 32) x.fillRect(i, 0, 12, 256);
      if (pattern === 'Checks') for (let j = 0; j < 256; j += 32) x.fillRect(0, j, 256, 12);
      tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 4);
    }
    model.traverse(o => {
      if (o.isMesh) {
        o.material.map = tex || o.material.userData.orig;
        o.material.color.set(tex ? '#ffffff' : colour);
        o.material.needsUpdate = true;
      }
    });
    return () => { if (tex) tex.dispose(); };
  }, [model, colour, pattern]);
  return (
    <group scale={k}>
      <primitive object={model} position={[-c.x, -c.y, -c.z]} />
    </group>
  );
}

function ScrubTopModel({ colour, pattern }) {
  const { scene } = useGLTF('/models/scrubtop/scrubtop.glb');
  const { model, k, c } = useMemo(() => {
    const m = scene.clone(true);
    m.traverse(o => { if (o.isMesh) o.material = o.material.clone(); });
    const box = new THREE.Box3().setFromObject(m);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    return { model: m, k: 2.6 / Math.max(size.x, size.y, size.z), c };
  }, [scene]);
  useEffect(() => {
    let tex = null;
    if (pattern === 'Stripes' || pattern === 'Checks') {
      const cv = document.createElement('canvas');
      cv.width = 256; cv.height = 256;
      const x = cv.getContext('2d');
      x.fillStyle = colour; x.fillRect(0, 0, 256, 256);
      x.fillStyle = 'rgba(255,255,255,0.35)';
      for (let i = 0; i < 256; i += 32) x.fillRect(i, 0, 12, 256);
      if (pattern === 'Checks') for (let j = 0; j < 256; j += 32) x.fillRect(0, j, 256, 12);
      tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(8, 8);
    }
    model.traverse(o => {
      if (o.isMesh) {
        o.material.map = tex;
        o.material.color.set(tex ? '#ffffff' : colour);
        o.material.needsUpdate = true;
      }
    });
    return () => { if (tex) tex.dispose(); };
  }, [model, colour, pattern]);
  return (
    <group scale={k}>
      <primitive object={model} position={[-c.x, -c.y, -c.z]} />
    </group>
  );
}

function ApronModel({ colour, pattern }) {
  const { scene } = useGLTF('/models/apron/scene.gltf');
  const { model, k, c } = useMemo(() => {
    const m = scene.clone(true);
    m.traverse(o => { if (o.isMesh) o.material = o.material.clone(); });
    const box = new THREE.Box3().setFromObject(m);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    return { model: m, k: 2.6 / Math.max(size.x, size.y, size.z), c };
  }, [scene]);
  useEffect(() => {
    let tex = null;
    if (pattern === 'Stripes' || pattern === 'Checks') {
      const cv = document.createElement('canvas');
      cv.width = 256; cv.height = 256;
      const x = cv.getContext('2d');
      x.fillStyle = colour; x.fillRect(0, 0, 256, 256);
      x.fillStyle = 'rgba(255,255,255,0.35)';
      for (let i = 0; i < 256; i += 32) x.fillRect(i, 0, 12, 256);
      if (pattern === 'Checks') for (let j = 0; j < 256; j += 32) x.fillRect(0, j, 256, 12);
      tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(6, 6);
    }
    model.traverse(o => {
      if (o.isMesh) {
        o.material.map = tex;
        o.material.color.set(tex ? '#ffffff' : colour);
        o.material.needsUpdate = true;
      }
    });
    return () => { if (tex) tex.dispose(); };
  }, [model, colour, pattern]);
  return (
    <group scale={k}>
      <primitive object={model} position={[-c.x, -c.y, -c.z]} />
    </group>
  );
}

function SkirtModel({ colour, pattern }) {
  const { scene } = useGLTF('/models/skirt/skirt.glb');
  const { model, k, c } = useMemo(() => {
    const m = scene.clone(true);
    m.traverse(o => { if (o.isMesh) o.material = o.material.clone(); });
    const box = new THREE.Box3().setFromObject(m);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    return { model: m, k: 2.6 / Math.max(size.x, size.y, size.z), c };
  }, [scene]);
  useEffect(() => {
    let tex = null;
    if (pattern === 'Stripes' || pattern === 'Checks') {
      const cv = document.createElement('canvas');
      cv.width = 256; cv.height = 256;
      const x = cv.getContext('2d');
      x.fillStyle = colour; x.fillRect(0, 0, 256, 256);
      x.fillStyle = 'rgba(255,255,255,0.35)';
      for (let i = 0; i < 256; i += 32) x.fillRect(i, 0, 12, 256);
      if (pattern === 'Checks') for (let j = 0; j < 256; j += 32) x.fillRect(0, j, 256, 12);
      tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 1);
    }
    model.traverse(o => {
      if (o.isMesh) {
        o.material.map = tex;
        o.material.color.set(tex ? '#ffffff' : colour);
        o.material.needsUpdate = true;
      }
    });
    return () => { if (tex) tex.dispose(); };
  }, [model, colour, pattern]);
  return (
    <group scale={k}>
      <primitive object={model} position={[-c.x, -c.y, -c.z]} />
    </group>
  );
}

function PinaforeModel({ colour, pattern }) {
  const { scene } = useGLTF('/models/pinafore/pinafore.glb');
  const { model, k, c } = useMemo(() => {
    const m = scene.clone(true);
    m.traverse(o => { if (o.isMesh) o.material = o.material.clone(); });
    const box = new THREE.Box3().setFromObject(m);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    return { model: m, k: 2.6 / Math.max(size.x, size.y, size.z), c };
  }, [scene]);
  useEffect(() => {
    let tex = null;
    if (pattern === 'Stripes' || pattern === 'Checks') {
      const cv = document.createElement('canvas');
      cv.width = 256; cv.height = 256;
      const x = cv.getContext('2d');
      x.fillStyle = colour; x.fillRect(0, 0, 256, 256);
      x.fillStyle = 'rgba(255,255,255,0.35)';
      for (let i = 0; i < 256; i += 32) x.fillRect(i, 0, 12, 256);
      if (pattern === 'Checks') for (let j = 0; j < 256; j += 32) x.fillRect(0, j, 256, 12);
      tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(3, 3);
    }
    model.traverse(o => {
      if (o.isMesh) {
        o.material.map = tex;
        o.material.color.set(tex ? '#ffffff' : colour);
        o.material.needsUpdate = true;
      }
    });
    return () => { if (tex) tex.dispose(); };
  }, [model, colour, pattern]);
  return (
    <group scale={k}>
      <primitive object={model} position={[-c.x, -c.y, -c.z]} />
    </group>
  );
}

function BlazerModel({ colour, pattern }) {
  const { scene } = useGLTF('/models/blazer/blazer.glb');
  const { model, k, c } = useMemo(() => {
    const m = scene.clone(true);
    m.traverse(o => { if (o.isMesh) o.material = o.material.clone(); });
    const box = new THREE.Box3().setFromObject(m);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    return { model: m, k: 2.6 / Math.max(size.x, size.y, size.z), c };
  }, [scene]);
  useEffect(() => {
    let tex = null;
    if (pattern === 'Stripes' || pattern === 'Checks') {
      const cv = document.createElement('canvas');
      cv.width = 256; cv.height = 256;
      const x = cv.getContext('2d');
      x.fillStyle = colour; x.fillRect(0, 0, 256, 256);
      x.fillStyle = 'rgba(255,255,255,0.35)';
      for (let i = 0; i < 256; i += 32) x.fillRect(i, 0, 12, 256);
      if (pattern === 'Checks') for (let j = 0; j < 256; j += 32) x.fillRect(0, j, 256, 12);
      tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(6, 6);
    }
    model.traverse(o => {
      if (o.isMesh && o.material.name !== 'buttons') {
        o.material.map = tex;
        o.material.color.set(tex ? '#ffffff' : colour);
        o.material.needsUpdate = true;
      }
    });
    return () => { if (tex) tex.dispose(); };
  }, [model, colour, pattern]);
  return (
    <group scale={k}>
      <primitive object={model} position={[-c.x, -c.y, -c.z]} />
    </group>
  );
}

function ChefCoatModel({ colour, pattern }) {
  const { scene } = useGLTF('/models/chefcoat/chefcoat.glb');
  const { model, k, c } = useMemo(() => {
    const m = scene.clone(true);
    m.traverse(o => { if (o.isMesh) o.material = o.material.clone(); });
    const box = new THREE.Box3().setFromObject(m);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    return { model: m, k: 2.6 / Math.max(size.x, size.y, size.z), c };
  }, [scene]);
  useEffect(() => {
    let tex = null;
    if (pattern === 'Stripes' || pattern === 'Checks') {
      const cv = document.createElement('canvas');
      cv.width = 256; cv.height = 256;
      const x = cv.getContext('2d');
      x.fillStyle = colour; x.fillRect(0, 0, 256, 256);
      x.fillStyle = 'rgba(255,255,255,0.35)';
      for (let i = 0; i < 256; i += 32) x.fillRect(i, 0, 12, 256);
      if (pattern === 'Checks') for (let j = 0; j < 256; j += 32) x.fillRect(0, j, 256, 12);
      tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(6, 6);
    }
    model.traverse(o => {
      if (o.isMesh) {
        o.material.map = tex;
        o.material.color.set(tex ? '#ffffff' : colour);
        o.material.needsUpdate = true;
      }
    });
    return () => { if (tex) tex.dispose(); };
  }, [model, colour, pattern]);
  return (
    <group scale={k}>
      <primitive object={model} position={[-c.x, -c.y, -c.z]} />
    </group>
  );
}

function HiVisModel({ colour }) {
  const { scene } = useGLTF('/models/hivis/hivis.glb');
  const { model, k, c } = useMemo(() => {
    const m = scene.clone(true);
    m.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.userData.orig = o.material.map; } });
    const box = new THREE.Box3().setFromObject(m);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    return { model: m, k: 2.6 / Math.max(size.x, size.y, size.z), c };
  }, [scene]);
  useEffect(() => {
    let tex = null;
    const col = new THREE.Color(colour);
        const hx = parseInt(colour.replace('#', ''), 16); const R = (hx >> 16) & 255, G = (hx >> 8) & 255, B = hx & 255;
    model.traverse(o => {
      if (!o.isMesh) return;
      const orig = o.material.userData.orig;
      const img = orig && orig.image;
      if (!img || !img.width) return;
      try {
        const cv = document.createElement('canvas');
        cv.width = img.width; cv.height = img.height;
        const x = cv.getContext('2d', { willReadFrequently: true });
        x.drawImage(img, 0, 0);
        const d = x.getImageData(0, 0, cv.width, cv.height);
        const p = d.data;
        for (let i = 0; i < p.length; i += 4) {
          const mx = Math.max(p[i], p[i + 1], p[i + 2]);
          const mn = Math.min(p[i], p[i + 1], p[i + 2]);
          const s = mx === 0 ? 0 : (mx - mn) / mx;
          if (s > 0.45) {
            const v = mx / 255; // fabric only; silver stripes stay as they are
            p[i] = R * v; p[i + 1] = G * v; p[i + 2] = B * v;
          }
        }
        x.putImageData(d, 0, 0);
        tex = new THREE.CanvasTexture(cv);
        tex.flipY = false;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        o.material.map = tex;
        o.material.color.set('#ffffff');
        o.material.needsUpdate = true;
      } catch (e) { console.warn('hivis recolour failed', e); }
    });
    return () => { if (tex) tex.dispose(); };
  }, [model, colour]);
  return (
    <group scale={k}>
      <primitive object={model} position={[-c.x, -c.y, -c.z]} />
    </group>
  );
}

function CoverallModel({ colour }) {
  const { scene } = useGLTF('/models/coverall/coverall.glb');
  const { model, k, c } = useMemo(() => {
    const m = scene.clone(true);
    m.traverse(o => {
      if (!o.isMesh) return;
      o.material = o.material.clone();
      o.material.userData.orig = o.material.map;
      o.material.side = THREE.DoubleSide;
      o.material.metalness = 0;
      o.material.roughness = 0.85;
      if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals();
    });
    const box = new THREE.Box3().setFromObject(m);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    return { model: m, k: 2.6 / Math.max(size.x, size.y, size.z), c };
  }, [scene]);
  useEffect(() => {
    let tex = null;
    const hx = parseInt(colour.replace('#', ''), 16);
    const R = (hx >> 16) & 255, G = (hx >> 8) & 255, B = hx & 255;
    model.traverse(o => {
      if (!o.isMesh) return;
      const orig = o.material.userData.orig;
      const img = orig && orig.image;
      if (!img || !img.width) return;
      try {
        const cv = document.createElement('canvas');
        cv.width = img.width; cv.height = img.height;
        const x = cv.getContext('2d', { willReadFrequently: true });
        x.drawImage(img, 0, 0);
        const d = x.getImageData(0, 0, cv.width, cv.height);
        const p = d.data;
        for (let i = 0; i < p.length; i += 4) {
          const mx = Math.max(p[i], p[i + 1], p[i + 2]);
          const mn = Math.min(p[i], p[i + 1], p[i + 2]);
          const s = mx === 0 ? 0 : (mx - mn) / mx;
          if (s > 0.45) {
          const v = Math.max(0.6, Math.min(1.5, mx / 100));
            p[i] = Math.min(255, R * v); p[i + 1] = Math.min(255, G * v); p[i + 2] = Math.min(255, B * v);
          } else if (mx <= 120) {
            p[i] = R * 0.6; p[i + 1] = G * 0.6; p[i + 2] = B * 0.6;
          } else {
            p[i] = 255; p[i + 1] = 255; p[i + 2] = 255;
          }
        }
        x.putImageData(d, 0, 0);
        tex = new THREE.CanvasTexture(cv);
        tex.flipY = false;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        o.material.map = tex;
        o.material.color.set('#ffffff');
        o.material.emissiveMap = tex;
        o.material.emissive.set('#ffffff');
        o.material.emissiveIntensity = 0.4;
        o.material.needsUpdate = true;
      } catch (e) { console.warn('coverall recolour failed', e); }
    });
    return () => { if (tex) tex.dispose(); };
  }, [model, colour]);
  return (
    <group scale={k}>
      <primitive object={model} position={[-c.x, -c.y, -c.z]} />
    </group>
  );
}


// ---- School shirt panels (collar / sleeves / cuffs) -------------------------
// The school shirt models are one mesh, normalised to about -0.5..0.5 in
// height. These limits (in the model's own space) mark where each part is.
const SHIRT_PANEL_GLSL = `
  float ksSide = abs(vObjPos.x);
  float ksSleeve = step(0.265, ksSide) * step(0.03, vObjPos.y);
  float ksCuff = ksSleeve * step(vObjPos.y, 0.128 - 0.25 * (ksSide - 0.27)) * uCuffOn;
  float ksCollar = step(0.43, vObjPos.y) * step(ksSide, 0.15)
    + step(0.37, vObjPos.y) * step(ksSide, 0.11) * step(0.035, vObjPos.z);
  if (uPanelOn.x > 0.5 && ksCollar > 0.5) diffuseColor.rgb = uCollar;
  else if (uPanelOn.z > 0.5 && ksCuff > 0.5) diffuseColor.rgb = uCuff;
  else if (uPanelOn.y > 0.5 && ksSleeve > 0.5) diffuseColor.rgb = uSleeve;
`;
const TRI_TILE = 0.12; // fabric swatch size on the garment: smaller = finer checks

function panelUniforms(mat) {
  if (!mat.userData.ks) {
    mat.userData.ks = {
      uPanelOn: { value: new THREE.Vector3() },
      uCollar: { value: new THREE.Color() },
      uSleeve: { value: new THREE.Color() },
      uCuff: { value: new THREE.Color() },
      uCuffOn: { value: 1 },
    };
  }
  return mat.userData.ks;
}

// tri: map the fabric swatch in world space (no stretching on any model).
// panel: recolour collar / sleeves / cuffs of the school shirt.
function installShader(mat, { tri, panel }) {
  const ks = panel ? panelUniforms(mat) : null;
  mat.onBeforeCompile = shader => {
    if (tri) {
      shader.uniforms.uTriScale = { value: 1 / TRI_TILE };
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vTriPos;\nvarying vec3 vTriNrm;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvTriPos = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvTriNrm = normalize(mat3(modelMatrix) * normal);');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vTriPos;\nvarying vec3 vTriNrm;\nuniform float uTriScale;')
        .replace('#include <map_fragment>', `
#ifdef USE_MAP
  vec3 an = abs(normalize(vTriNrm));
  vec2 tuv = (an.z >= an.x) ? vTriPos.xy : vTriPos.zy;
  vec4 sampledDiffuseColor = texture2D(map, tuv * uTriScale);
  diffuseColor *= sampledDiffuseColor;
#endif
`);
    }
    if (panel) {
      Object.assign(shader.uniforms, ks);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vObjPos;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObjPos = position;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vObjPos;\nuniform vec3 uPanelOn;\nuniform vec3 uCollar;\nuniform vec3 uSleeve;\nuniform vec3 uCuff;\nuniform float uCuffOn;')
        .replace('#include <color_fragment>', '#include <color_fragment>\n' + SHIRT_PANEL_GLSL);
    }
  };
  mat.customProgramCacheKey = () => `ks-${tri ? 1 : 0}-${panel ? 1 : 0}`;
}

// Long sleeves for the half-sleeve school shirt: a tapered sleeve from the
// short-sleeve opening down to the wrist, finished with a cuff.
// Values are in the shirt model's own space (see SHIRT_PANEL_GLSL).
function addFullSleeves(mesh) {
  const L = 0.46;
  const made = [];
  [1, -1].forEach(side => {
    const dir = new THREE.Vector3(0.12 * side, -1, 0).normalize();
    // Starts a little inside the short sleeve so the join is hidden under its hem.
    const start = new THREE.Vector3(0.318 * side, 0.13, -0.046);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.05, L, 32, 6, true),
      new THREE.MeshStandardMaterial({ roughness: 0.9, side: THREE.DoubleSide })
    );
    sleeve.position.copy(start).addScaledVector(dir, L / 2);
    sleeve.quaternion.copy(q);
    sleeve.userData.part = 'sleeve';
    const cuff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.053, 0.065, 32, 1, false),
      new THREE.MeshStandardMaterial({ roughness: 0.9 })
    );
    cuff.position.copy(start).addScaledVector(dir, L - 0.02);
    cuff.quaternion.copy(q);
    cuff.userData.part = 'cuff';
    mesh.add(sleeve, cuff);
    made.push(sleeve, cuff);
  });
  return made;
}

// panels: { collar, sleeves, cuffs } colours ('' = same as the shirt). Shirts only.
// sleeve: 'Half' | 'Full'. Shirts only.
function SetPart({ url, colour, pattern = 'Plain', repeat = 3, height, y, wide = 1, pocket = false, texUrl = '', panels = null, sleeve = 'Half' }) {
  const { scene } = useGLTF(url);
  const full = !!panels && sleeve === 'Full';
  const { model, k } = useMemo(() => {
    const m = scene.clone(true);
    m.traverse(o => { if (o.isMesh) o.material = o.material.clone(); });
    const box = new THREE.Box3().setFromObject(m);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    m.position.set(-c.x, -c.y, -c.z);
    if (pocket) {
      const pk = new THREE.Mesh(
        new THREE.BoxGeometry(0.105, 0.125, 0.014),
        new THREE.MeshStandardMaterial({ roughness: 0.85 })
      );
      pk.position.set(0.15, 0.17, 0.142);
      pk.rotation.x = -0.12;
      m.add(pk);
    }
    if (full) {
      let body = null;
      m.traverse(o => { if (o.isMesh && !body) body = o; });
      if (body) addFullSleeves(body);
    }
    return { model: m, k: height / size.y };
  }, [scene, height, pocket, full]);

  const pc = panels || {};
  const hasPanels = !!panels;
  useEffect(() => {
    let tex = null;
    let dead = false;
    const apply = t => {
      model.traverse(o => {
        if (!o.isMesh) return;
        const mat = o.material;
        const part = o.userData.part;
        // Extra sleeve pieces take the sleeve (or cuff) panel colour when one is set.
        const own = part === 'cuff' ? (pc.cuffs || pc.sleeves) : part === 'sleeve' ? pc.sleeves : '';
        if (own) {
          mat.map = null;
          mat.color.set(own);
          installShader(mat, { tri: false, panel: false });
        } else {
          mat.map = t;
          mat.color.set(t ? '#ffffff' : colour);
          const isBody = !part && hasPanels;
          installShader(mat, { tri: !!(t && texUrl), panel: isBody });
          if (isBody) {
            const ks = panelUniforms(mat);
            ks.uPanelOn.value.set(pc.collar ? 1 : 0, pc.sleeves ? 1 : 0, pc.cuffs ? 1 : 0);
            ks.uCollar.value.set(pc.collar || '#ffffff');
            ks.uSleeve.value.set(pc.sleeves || '#ffffff');
            ks.uCuff.value.set(pc.cuffs || '#ffffff');
            // With long sleeves the cuff sits at the wrist, not at the short-sleeve hem.
            ks.uCuffOn.value = full ? 0 : 1;
          }
        }
        mat.needsUpdate = true;
      });
    };
    if (texUrl) {
      new THREE.TextureLoader().load(texUrl, t => {
        if (dead) { t.dispose(); return; }
        t.colorSpace = THREE.SRGBColorSpace;
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(repeat, repeat);
        t.anisotropy = 8;
        t.flipY = false;
        tex = t;
        apply(t);
      });
    } else {
      if (pattern === 'Stripes' || pattern === 'Checks') {
        const cv = document.createElement('canvas');
        cv.width = 256; cv.height = 256;
        const x = cv.getContext('2d');
        x.fillStyle = colour; x.fillRect(0, 0, 256, 256);
        x.fillStyle = 'rgba(255,255,255,0.35)';
        for (let i = 0; i < 256; i += 32) x.fillRect(i, 0, 12, 256);
        if (pattern === 'Checks') for (let j = 0; j < 256; j += 32) x.fillRect(0, j, 256, 12);
        tex = new THREE.CanvasTexture(cv);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(repeat, repeat);
      }
      apply(tex);
    }
    return () => { dead = true; if (tex) tex.dispose(); };
  }, [model, colour, pattern, repeat, texUrl, hasPanels, pc.collar, pc.sleeves, pc.cuffs, full]);
  return (
    <group position={[0, y, 0]} scale={[k * wide, k, k * wide]}>
      <primitive object={model} />
    </group>
  );
}
function SchoolShirtModel({ colour, pattern = 'Plain', texUrl = '', panels = null, sleeve = 'Half' }) {
  return (
    <group scale={2.6}>
      <SetPart url="/models/school-shirt/shirt-school.glb" colour={colour} pattern={pattern} height={1} y={0} texUrl={texUrl} panels={panels || {}} sleeve={sleeve} />
    </group>
  );
}
function SchoolSet({ shirtColour, pantColour, shirtPattern = 'Plain', pantPattern = 'Plain', shirtWide = 1, pantY = -0.45, shirtTex = '', pantTex = '', panels = null, sleeve = 'Half' }) {
  return (
    <group scale={1.75} position={[0, 0.306, 0]}>
      <SetPart url="/models/school-shirt/shirt-tucked.glb" colour={shirtColour} pattern={shirtPattern} repeat={4} height={0.65} y={0.225} wide={shirtWide} texUrl={shirtTex} panels={panels} sleeve={sleeve} />
      <SetPart url="/models/school-pant/pant-school.glb" colour={pantColour} pattern={pantPattern} repeat={3} height={0.90} y={pantY} wide={1.08} texUrl={pantTex} />
    </group>
  );
}

function BlazerSchoolModel({ colour, height = 1.15, y = 0.725, wide = 1.58 }) {
  const { scene } = useGLTF('/models/blazer_school/blazer_school.glb');
  const { model, k } = useMemo(() => {
    const m = scene.clone(true);
    m.traverse(o => { if (o.isMesh) o.material = o.material.clone(); });
    const box = new THREE.Box3().setFromObject(m);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    m.position.set(-c.x, -c.y, -c.z);
    
    return { model: m, k: height / size.y };
  }, [scene, height]);
  useEffect(() => {
    model.traverse(o => {
      if (o.isMesh) {
        o.material.color.set(colour);
        o.material.needsUpdate = true;
      }
    });
  }, [model, colour]);
  const lining = useMemo(() => model.clone(true), [model]);
  return (
    
    <group position={[0, y, 0]} scale={[k * wide, k, k * wide]}>
      <primitive object={model} />
      <group scale={0.96}><primitive object={lining} /></group>
    </group>
  );
}

function BlazerSet({ blazerColour, shirtColour, shirtPattern, pantColour = '#5a5f6b' }) {
  const FIT_W = 1.4; // blazer width vs shirt (peddadi chesthe broad)
  const LEN = 0.85;   // blazer length (peddadi chesthe longer)
  const shirt = useGLTF('/models/school-shirt/shirt-tucked.glb');
  const blazer = useGLTF('/models/blazer_school/blazer_school.glb');
  const fit = useMemo(() => {
    const sb = new THREE.Box3().setFromObject(shirt.scene).getSize(new THREE.Vector3());
    const bb = new THREE.Box3().setFromObject(blazer.scene).getSize(new THREE.Vector3());
    const shirtWidth = sb.x * (0.65 / sb.y) * 0.88 * 1.75;
    const shirtTop = 0.306 + 1.75 * (0.225 + 0.325);
    const s = (shirtWidth * FIT_W) / bb.x;
    const height = bb.y * s * LEN;
    return { height, y: shirtTop + 0.02 - height / 2, wide: 1 / LEN };
  }, [shirt, blazer]);
  return (
    <>
      <SchoolSet shirtColour={shirtColour} shirtPattern={shirtPattern} pantColour={pantColour} shirtWide={0.60} pantY={-0.48}/>
      <BlazerSchoolModel colour={blazerColour} height={fit.height} y={fit.y} wide={fit.wide} />
    </>
  );
}

function GownModel({ colour }) {
  const { scene } = useGLTF('/models/gown/gown_clean.glb');
  const { model, k } = useMemo(() => {
    const m = scene.clone(true);
    m.traverse(o => { if (o.isMesh) o.material = o.material.clone(); });
    const box = new THREE.Box3().setFromObject(m);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    m.position.set(-c.x, -c.y, -c.z);
    return { model: m, k: 2.6 / size.y };
  }, [scene]);
  useEffect(() => {
    model.traverse(o => {
      if (o.isMesh) {
        o.material.color.set(colour);
        o.material.needsUpdate = true;
      }
    });
  }, [model, colour]);
  return (
    <group scale={k}>
      <primitive object={model} />
    </group>
  );
}

function CameraRig({ view, controls, dist = 6 }) {
  const { camera } = useThree();
  useEffect(() => {
    const pos = view === 'back' ? [0, 0.3, -dist] : view === 'side' ? [dist, 0.3, 0] : [0, 0.3, dist];
    camera.position.set(...pos);
    camera.lookAt(0, 0, 0);
    if (controls.current) controls.current.update();
  }, [view, camera, controls, dist]);
  return null;
}

const VIEWS = [['front', 'Front'], ['back', 'Back'], ['side', 'Side']];

// Front / Back / Side switch that sits on top of the 3D preview.
function ViewSwitch({ view, setView }) {
  return (
    <div className="g3d-views" role="group" aria-label="Camera view">
      {VIEWS.map(([v, n]) => (
        <button key={v} type="button" aria-pressed={view === v} aria-label={`${n} view`}
          className={view === v ? 'on' : ''} onClick={() => setView(v)}>{n}</button>
      ))}
    </div>
  );
}

// Scene pieces shared by every preview: ground shadow and the fabric look.
function StageExtras({ fabric, shadows }) {
  return (
    <>
      <ContactShadows position={[0, -1.25, 0]} opacity={0.42} scale={8} blur={2.8} far={3} resolution={512} color="#1c2340" />
      <FabricRig fabric={fabric} shadows={shadows} />
    </>
  );
}

export default function Garment3D({ garment = 'Shirt', colour, pattern = 'Plain', fabric = 'Cotton', logoUrl = '', logoPos = { dx: 0, dy: 0, size: 32, rot: 0 }, logoPosGirl = null, decoration = 'None', shirtPanels = null, sleeve = 'Half', shirtColour = '#ffffff', shirtPattern = 'Plain', pantColour = '#5a5f6b', shirtTex = '', pantTex = '' }) {
  const [view, setView] = useState('front');
  const controls = useRef();
  const logo = (extra = {}) => logoUrl
    ? <LogoDecal key={garment + logoUrl} url={logoUrl} decoration={decoration} pos={{ ...logoPos, ...extra }} />
    : null;
  // The school shirt sits smaller in the set previews, so the logo is shifted and scaled to its chest.
  const onSetShirt = p => ({ dx: p.dx - 14, dy: p.dy - 40, size: p.size * 0.7, rot: p.rot || 0 });
  const small = onSetShirt(logoPos);
  const girl = onSetShirt(logoPosGirl || logoPos);

  if (garment === 'Pair' || garment === 'Blazer') {
    return (
      <div className="g3d-wrap">
        <div className="g3d-stage">
          <div className="g3d-pair">
            {garment === 'Pair' ? (
              <>
                <MiniCanvas view={view} fabric={fabric} label="Boys: shirt and trousers">
                  <SchoolSet shirtColour={shirtColour} shirtPattern={shirtPattern} shirtTex={shirtTex} pantColour={pantColour} pantTex={pantTex} panels={shirtPanels || {}} sleeve={sleeve} />
                  {logo(small)}
                </MiniCanvas>
                <MiniCanvas view={view} fabric={fabric} label="Girls: shirt and skirt">
                  <group scale={1.75} position={[0, 0.306, 0]}>
                    <SetPart url="/models/school-shirt/shirt-tucked.glb" colour={shirtColour} repeat={4} height={0.65} y={0.225} wide={1} texUrl={shirtTex} panels={shirtPanels || {}} sleeve={sleeve} />
                    <group position={[0.015, 0, 0]}><SetPart url="/models/skirt/skirt.glb" colour={pantColour} repeat={3} height={0.72} y={-0.23} wide={1.20} texUrl={pantTex} /></group>
                  </group>
                  {logo(girl)}
                </MiniCanvas>
              </>
            ) : (
              <>
                <MiniCanvas view={view} fabric={fabric} label="Blazer only">
                  <BlazerSchoolModel colour={colour} height={1.9} y={0} wide={1} />
                  {logo()}
                </MiniCanvas>
                <MiniCanvas view={view} fabric={fabric} label="With shirt and trousers">
                  <BlazerSet blazerColour={colour} shirtColour={shirtColour} shirtPattern={shirtPattern} pantColour={pantColour} />
                  {logo(small)}
                </MiniCanvas>
              </>
            )}
          </div>
          <ViewSwitch view={view} setView={setView} />
        </div>
        <p className="g3d-hint">Drag to rotate · scroll or pinch to zoom · tap Move to slide the garment. Each preview moves on its own.</p>
      </div>
    );
  }

  return (
    <div className="g3d-wrap">
      <div className="g3d-stage">
        <div className="g3d" role="img" aria-label={`3D preview of ${garment}. Use the Front, Back and Side buttons to change the view.`}>
          <Canvas shadows gl={{ preserveDrawingBuffer: true, antialias: true }} camera={{ position: [0, 0.3, 5.4], fov: 40 }} dpr={[1, 2]}>
            <StudioLights shadows />
            <Suspense fallback={null}>
              {garment === 'Shirt'
                ? <SchoolShirtModel colour={colour} pattern={pattern} texUrl={shirtTex} panels={shirtPanels} sleeve={sleeve} />
                : /trouser|pant/i.test(garment)
                  ? <SchoolSet shirtColour={shirtColour} shirtPattern={shirtPattern} shirtTex={shirtTex} pantColour={colour} pantTex={pantTex} panels={shirtPanels || {}} sleeve={sleeve} />
                  : garment === 'Lab coat'
                    ? <LabCoatModel colour={colour} pattern={pattern} />
                    : (garment === 'Scrub top' || garment === 'Salon wear')
                      ? <ScrubTopModel colour={colour} pattern={pattern} />
                      : garment === 'Apron'
                        ? <ApronModel colour={colour} pattern={pattern} />
                        : garment === 'Skirt'
                          ? <SkirtModel colour={colour} pattern={pattern} />
                          : garment === 'Pinafore'
                            ? <PinaforeModel colour={colour} pattern={pattern} />
                            : garment === 'Chef coat'
                              ? <ChefCoatModel colour={colour} pattern={pattern} />
                              : garment === 'Hi-vis jacket'
                                ? <HiVisModel colour={colour} />
                                : garment === 'Gown'
                                  ? <GownModel colour={colour} />
                                  : garment === 'Coverall'
                                    ? <CoverallModel colour={colour} />
                                    : <Garment garment={garment} colour={colour} pattern={pattern} />}
              {logo()}
            </Suspense>
            <StageExtras fabric={fabric} shadows />
            <OrbitControls ref={controls} enablePan screenSpacePanning zoomToCursor enableDamping dampingFactor={0.12} minDistance={1.5} maxDistance={10} />
            <CameraRig view={view} controls={controls} dist={5.4} />
          </Canvas>
        </div>
        <ViewSwitch view={view} setView={setView} />
      </div>
      <p className="g3d-hint">Drag to rotate · scroll or pinch to zoom · right-click drag to move.</p>
    </div>
  );
}

function MiniCanvas({ view, fabric, label, children }) {
  const controls = useRef();
  const [move, setMove] = useState(false);
  return (
    <div className="g3d g3d-half" role="img" aria-label={`3D preview: ${label}`}>
      {label && <span className="g3d-label">{label}</span>}
      <button type="button" className={move ? 'g3d-chip on' : 'g3d-chip'} aria-pressed={move}
        title={move ? 'Dragging moves the garment' : 'Dragging rotates the garment'} onClick={() => setMove(m => !m)}>
        {move ? 'Move' : 'Rotate'}
      </button>
      <Canvas gl={{ preserveDrawingBuffer: true, antialias: true }} camera={{ position: [0, 0.3, 6], fov: 40 }} dpr={[1, 2]}>
        <StudioLights />
        <Suspense fallback={null}>{children}</Suspense>
        <StageExtras fabric={fabric} />
        <OrbitControls
          ref={controls}
          enablePan
          screenSpacePanning
          enableDamping
          dampingFactor={0.12}
          minDistance={1.5}
          maxDistance={10}
          mouseButtons={{ LEFT: move ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
          touches={{ ONE: move ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
        />
        <CameraRig view={view} controls={controls} />
      </Canvas>
    </div>
  );
}
