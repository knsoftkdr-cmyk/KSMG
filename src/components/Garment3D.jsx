import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
// import { OrbitControls, ContactShadows, useGLTF } from '@react-three/drei';
import { OrbitControls, ContactShadows, useGLTF, useTexture } from '@react-three/drei';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BODY, garmentSvg } from '../data/garmentArt.js';

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
    console.log('3D colour:', colour, garment, pattern);
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
  stripeTex.repeat.set(4, 4);
}
    model.traverse(o => {
      if (o.isMesh && o.material.name.includes('Material4782')) {
        const m = o.material;
        if (pattern === 'Checks' || pattern === 'Stripes') { m.map = stripeTex; m.color.set('#ffffff'); }
        // else if (pattern === 'Stripes') { m.map = stripeTex; m.color.set('#ffffff'); }
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

function LogoPlane({ url, pos }) {
  const tex = useTexture(url);
  const scene = useThree(s => s.scene);
  const [place, setPlace] = useState(null);
  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    scene.updateMatrixWorld(true);
    const rc = new THREE.Raycaster(
      new THREE.Vector3(0.35 + pos.dx * 0.012, 0.4 - pos.dy * 0.012, 5),
      new THREE.Vector3(0, 0, -1), 0, 10
    );
    const hit = rc.intersectObject(scene, true).find(h => h.object.isMesh && h.face);
    if (!hit) { setPlace(null); return; }
    const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
    if (n.z < 0) n.negate();
    const p = hit.point.clone().add(n.clone().multiplyScalar(0.01));
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    setPlace({ p, q });
  }, [tex, scene, pos.dx, pos.dy]);
  if (!place) return null;
  const img = tex.image;
  const asp = img && img.width ? img.height / img.width : 1;
  const w = pos.size * 0.01;
  return (
    <mesh position={place.p} quaternion={place.q} raycast={() => null}>
      <planeGeometry args={[w, w * asp]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} polygonOffset polygonOffsetFactor={-4} />
    </mesh>
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
function CameraRig({ view, controls }) {
  const { camera } = useThree();
  useEffect(() => {
    const pos = view === 'back' ? [0, 0.3, -6] : view === 'side' ? [6, 0.3, 0] : [0, 0.3, 6];
    camera.position.set(...pos);
    camera.lookAt(0, 0, 0);
    if (controls.current) controls.current.update();
  }, [view, camera, controls]);
  return null;
}

export default function Garment3D({ garment = 'Shirt', colour, pattern = 'Plain', logoUrl = '', logoPos = { dx: 0, dy: 0, size: 32 } }) {
  const [view, setView] = useState('front');
  const controls = useRef();
  return (
    <div>
      <div className="g3d">
        <Canvas camera={{ position: [0, 0.3, 6], fov: 40 }} dpr={[1, 2]}>
          <hemisphereLight args={['#ffffff', '#9aa3c0', 1.2]} />
          <ambientLight intensity={1.0} />
          <directionalLight position={[4, 6, 5]} intensity={1.4} />
          <directionalLight position={[-4, 3, 4]} intensity={0.9} />
          <directionalLight position={[0, 3, -6]} intensity={0.8} />
          <Suspense fallback={null}>
            {garment === 'Shirt'
  ? <ShirtModel colour={colour} pattern={pattern} />
  : /trouser|pant/i.test(garment)
    ? <PantsModel colour={colour} pattern={pattern} />
    : garment === 'Lab coat'
      ? <LabCoatModel colour={colour} pattern={pattern} />
      : <Garment garment={garment} colour={colour} pattern={pattern} />}
    {garment === 'Shirt' && logoUrl && <LogoPlane url={logoUrl} pos={logoPos} />}
            </Suspense>
          <ContactShadows position={[0, -1.25, 0]} opacity={0.35} scale={8} blur={2.5} far={3} />
          <OrbitControls ref={controls} enablePan={false} minDistance={3} maxDistance={10} />
          <CameraRig view={view} controls={controls} />
        </Canvas>
      </div>
      <div className="ds-mode">
        {['front', 'back', 'side'].map(v => (
          <button key={v} type="button" className={view === v ? 'btn gold' : 'btn ghost'} onClick={() => setView(v)}>{v[0].toUpperCase() + v.slice(1)}</button>
        ))}
      </div>
      <p className="ds-note small">Drag to rotate. Pinch or scroll to zoom.</p>
    </div>
  );
}