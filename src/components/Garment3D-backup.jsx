// import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
// import * as THREE from 'three';
// import { Canvas, useThree, useFrame } from '@react-three/fiber';
// // import { OrbitControls, ContactShadows, useGLTF } from '@react-three/drei';
// import { OrbitControls, ContactShadows, useGLTF, useTexture } from '@react-three/drei';
// import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
// import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
// import { BODY, garmentSvg } from '../data/garmentArt.js';

// const S = 0.011;
// const DEPTH = 30;
// const BEV = 7;
// const bulge = x => 0.55 + 0.9 * (1 - Math.min(1, Math.abs(x - 100) / 90) ** 2);

// function Garment({ garment, colour, pattern }) {
//   const [tex, setTex] = useState(null);

//   const geo = useMemo(() => {
//     const d = BODY[garment] || BODY.Shirt;
//     const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path fill="#000" d="${d}"/></svg>`;
//     const data = new SVGLoader().parse(svg);
//     const shapes = SVGLoader.createShapes(data.paths[0]);
//     let g = new THREE.ExtrudeGeometry(shapes, { depth: DEPTH, bevelEnabled: true, bevelThickness: BEV, bevelSize: 6, bevelSegments: 6, curveSegments: 10 });
//     g.translate(-100, -110, -DEPTH / 2);
//     const pos = g.attributes.position;
//     for (let i = 0; i < pos.count; i++) pos.setZ(i, pos.getZ(i) * bulge(pos.getX(i) + 100));
//     g.deleteAttribute('normal');
//     g.deleteAttribute('uv');
//     g = mergeVertices(g);
//     g.computeVertexNormals();
//     const gp = g.attributes.position;
//     const uv = new Float32Array(gp.count * 2);
//     for (let i = 0; i < gp.count; i++) {
//       const x = gp.getX(i), y = gp.getY(i), z = gp.getZ(i);
//       const zr = z / bulge(x + 100);
//       const u = (x + 100) / 200;
//       const v = 1 - (y + 110) / 220;
//       const front = zr < -(DEPTH / 2 + BEV) + 4;
//       uv[i * 2] = front ? u * 0.5 : 0.5 + u * 0.5;
//       uv[i * 2 + 1] = v;
//     }
//     g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
//     g.scale(S, S, S);
//     return g;
//   }, [garment]);

//   useEffect(() => {
//     let dead = false;
//     let t = null;
//     const stroke = colour.toLowerCase() === '#ffffff' ? '#999999' : 'rgba(0,0,0,0.35)';
//     let inner = '';
//     try { inner = garmentSvg(garment, { colour, stroke, pattern, id: 'g3d' }); } catch { inner = ''; }
//     const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="1000" height="1100">${inner}</svg>`;
//     const lum = (() => { const c = new THREE.Color(colour); return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b; })();
//     const overlay = lum > 0.45 ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.22)';
//     const img = new Image();
//     img.onload = () => {
//       if (dead) return;
//       const c = document.createElement('canvas');
//       c.width = 2000; c.height = 1100;
//       const x = c.getContext('2d');
//       x.fillStyle = colour; x.fillRect(0, 0, 2000, 1100);
//       x.drawImage(img, 0, 0, 1000, 1100);
//       try { x.getImageData(0, 0, 1, 1); } catch (e) { console.warn('3D texture blocked', e); x.fillStyle = colour; x.fillRect(0, 0, 1000, 1100); }
//       x.fillStyle = colour; x.fillRect(1000, 0, 1000, 1100);
//       x.fillStyle = overlay;
//       if (pattern === 'Stripes' || pattern === 'Checks') for (let i = 0; i < 1000; i += 80) x.fillRect(1000 + i, 0, 40, 1100);
//       if (pattern === 'Checks') for (let j = 0; j < 1100; j += 80) x.fillRect(1000, j, 1000, 40);

//       t = new THREE.CanvasTexture(c);
//       t.colorSpace = THREE.SRGBColorSpace;
//       t.anisotropy = 8;
//       setTex(t);
//     };
//     console.log('3D colour:', colour, garment, pattern);
//     img.onerror = e => console.warn('3D svg image failed', e);
//     img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
//     return () => { dead = true; if (t) t.dispose(); };
//   }, [garment, colour, pattern]);

//   return (
//     <mesh geometry={geo} rotation={[Math.PI, 0, 0]}>
//       <meshStandardMaterial key={tex ? 'with-map' : 'no-map'} color={tex ? '#ffffff' : colour} map={tex} roughness={0.85} />
//     </mesh>
//   );
// }

// function ShirtModel({ colour, pattern }) {
//   const { scene } = useGLTF('/models/shirt/scene.gltf');
//   const { model, k, c } = useMemo(() => {
//     const m = scene.clone(true);
//     m.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.userData.orig = o.material.map; } });
//     const box = new THREE.Box3().setFromObject(m);
//     const size = box.getSize(new THREE.Vector3());
//     const c = box.getCenter(new THREE.Vector3());
//     return { model: m, k: 2.6 / Math.max(size.x, size.y, size.z), c };
//   }, [scene]);
//   useEffect(() => {
//     let stripeTex = null;
//     if (pattern === 'Stripes' || pattern === 'Checks') {
//       const cv = document.createElement('canvas');
//       cv.width = 256; cv.height = 256;
//       const x = cv.getContext('2d');
//       x.fillStyle = colour; x.fillRect(0, 0, 256, 256);
//       x.fillStyle = 'rgba(255,255,255,0.35)';
//       for (let i = 0; i < 256; i += 32) x.fillRect(i, 0, 12, 256);
//       if (pattern === 'Checks') for (let j = 0; j < 256; j += 32) x.fillRect(0, j, 256, 12);
//       stripeTex = new THREE.CanvasTexture(cv);
//       stripeTex.colorSpace = THREE.SRGBColorSpace;
//       stripeTex.wrapS = stripeTex.wrapT = THREE.RepeatWrapping;
//       stripeTex.repeat.set(14, 14);
//     }
//     model.traverse(o => {
//       if (o.isMesh && o.material.name.includes('Material4782')) {
//         const m = o.material;
//         if (pattern === 'Checks' || pattern === 'Stripes') { m.map = stripeTex; m.color.set('#ffffff'); }
//         else { m.map = null; m.color.set(colour); }
//         m.needsUpdate = true;
//       }
//     });
//     return () => { if (stripeTex) stripeTex.dispose(); };
//   }, [model, colour, pattern]);
//   return (
//     <group scale={k}>
//       <primitive object={model} position={[-c.x, -c.y, -c.z]} />
//     </group>
//   );
// }

// function PantsModel({ colour, pattern }) {
//   const { scene } = useGLTF('/models/pants/scene.gltf');
//   const { model, k, c } = useMemo(() => {
//     const m = scene.clone(true);
//     m.traverse(o => { if (o.isMesh) o.material = o.material.clone(); });
//     const box = new THREE.Box3().setFromObject(m);
//     const size = box.getSize(new THREE.Vector3());
//     const c = box.getCenter(new THREE.Vector3());
//     return { model: m, k: 2.6 / Math.max(size.x, size.y, size.z), c };
//   }, [scene]);
//   useEffect(() => {
//     let tex = null;
//     if (pattern === 'Stripes' || pattern === 'Checks') {
//       const cv = document.createElement('canvas');
//       cv.width = 256; cv.height = 256;
//       const x = cv.getContext('2d');
//       x.fillStyle = colour; x.fillRect(0, 0, 256, 256);
//       x.fillStyle = 'rgba(255,255,255,0.35)';
//       for (let i = 0; i < 256; i += 32) x.fillRect(i, 0, 12, 256);
//       if (pattern === 'Checks') for (let j = 0; j < 256; j += 32) x.fillRect(0, j, 256, 12);
//       tex = new THREE.CanvasTexture(cv);
//       tex.colorSpace = THREE.SRGBColorSpace;
//       tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
//       tex.repeat.set(0.5, 0.5);
//     }
//     model.traverse(o => {
//       if (o.isMesh) {
//         o.material.map = tex;
//         o.material.color.set(tex ? '#ffffff' : colour);
//         o.material.needsUpdate = true;
//       }
//     });
//     return () => { if (tex) tex.dispose(); };
//   }, [model, colour, pattern]);
//   return (
//     <group scale={k}>
//       <primitive object={model} position={[-c.x, -c.y, -c.z]} />
//     </group>
//   );
// }

// function LogoPlane({ url, pos }) {
//   const tex = useTexture(url);
//   const scene = useThree(s => s.scene);
//   const [place, setPlace] = useState(null);
//   useEffect(() => {
//     tex.colorSpace = THREE.SRGBColorSpace;
//     scene.updateMatrixWorld(true);
//     const rc = new THREE.Raycaster(
//       new THREE.Vector3(0.35 + pos.dx * 0.012, 0.4 - pos.dy * 0.012, 5),
//       new THREE.Vector3(0, 0, -1), 0, 10
//     );
//     const hit = rc.intersectObject(scene, true).find(h => h.object.isMesh && h.face);
//     if (!hit) { setPlace(null); return; }
//     const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
//     if (n.z < 0) n.negate();
//     const p = hit.point.clone().add(n.clone().multiplyScalar(0.01));
//     const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
//     setPlace({ p, q });
//   }, [tex, scene, pos.dx, pos.dy]);
//   if (!place) return null;
//   const img = tex.image;
//   const asp = img && img.width ? img.height / img.width : 1;
//   const w = pos.size * 0.01;
//   return (
//     <mesh position={place.p} quaternion={place.q} raycast={() => null}>
//       <planeGeometry args={[w, w * asp]} />
//       <meshBasicMaterial map={tex} transparent toneMapped={false} polygonOffset polygonOffsetFactor={-4} />
//     </mesh>
//   );
// }

// function LabCoatModel({ colour, pattern }) {
//   const { scene } = useGLTF('/models/labcoat/scene.gltf');
//   const { model, k, c } = useMemo(() => {
//     const m = scene.clone(true);
//     m.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.userData.orig = o.material.map; } });
//     const box = new THREE.Box3().setFromObject(m);
//     const size = box.getSize(new THREE.Vector3());
//     const c = box.getCenter(new THREE.Vector3());
//     return { model: m, k: 2.6 / Math.max(size.x, size.y, size.z), c };
//   }, [scene]);
//   useEffect(() => {
//     let tex = null;
//     if (pattern === 'Stripes' || pattern === 'Checks') {
//       const cv = document.createElement('canvas');
//       cv.width = 256; cv.height = 256;
//       const x = cv.getContext('2d');
//       x.fillStyle = colour; x.fillRect(0, 0, 256, 256);
//       x.fillStyle = 'rgba(255,255,255,0.35)';
//       for (let i = 0; i < 256; i += 32) x.fillRect(i, 0, 12, 256);
//       if (pattern === 'Checks') for (let j = 0; j < 256; j += 32) x.fillRect(0, j, 256, 12);
//       tex = new THREE.CanvasTexture(cv);
//       tex.colorSpace = THREE.SRGBColorSpace;
//       tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
//       tex.repeat.set(4, 4);
//     }
//     model.traverse(o => {
//       if (o.isMesh) {
//         o.material.map = tex || o.material.userData.orig;
//         o.material.color.set(tex ? '#ffffff' : colour);
//         o.material.needsUpdate = true;
//       }
//     });
//     return () => { if (tex) tex.dispose(); };
//   }, [model, colour, pattern]);
//   return (
//     <group scale={k}>
//       <primitive object={model} position={[-c.x, -c.y, -c.z]} />
//     </group>
//   );
// }

// function ScrubTopModel({ colour, pattern }) {
//   const { scene } = useGLTF('/models/scrubtop/scrubtop.glb');
//   const { model, k, c } = useMemo(() => {
//     const m = scene.clone(true);
//     m.traverse(o => { if (o.isMesh) o.material = o.material.clone(); });
//     const box = new THREE.Box3().setFromObject(m);
//     const size = box.getSize(new THREE.Vector3());
//     const c = box.getCenter(new THREE.Vector3());
//     return { model: m, k: 2.6 / Math.max(size.x, size.y, size.z), c };
//   }, [scene]);
//   useEffect(() => {
//     let tex = null;
//     if (pattern === 'Stripes' || pattern === 'Checks') {
//       const cv = document.createElement('canvas');
//       cv.width = 256; cv.height = 256;
//       const x = cv.getContext('2d');
//       x.fillStyle = colour; x.fillRect(0, 0, 256, 256);
//       x.fillStyle = 'rgba(255,255,255,0.35)';
//       for (let i = 0; i < 256; i += 32) x.fillRect(i, 0, 12, 256);
//       if (pattern === 'Checks') for (let j = 0; j < 256; j += 32) x.fillRect(0, j, 256, 12);
//       tex = new THREE.CanvasTexture(cv);
//       tex.colorSpace = THREE.SRGBColorSpace;
//       tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
//       tex.repeat.set(8, 8);
//     }
//     model.traverse(o => {
//       if (o.isMesh) {
//         o.material.map = tex;
//         o.material.color.set(tex ? '#ffffff' : colour);
//         o.material.needsUpdate = true;
//       }
//     });
//     return () => { if (tex) tex.dispose(); };
//   }, [model, colour, pattern]);
//   return (
//     <group scale={k}>
//       <primitive object={model} position={[-c.x, -c.y, -c.z]} />
//     </group>
//   );
// }

// function ApronModel({ colour, pattern }) {
//   const { scene } = useGLTF('/models/apron/scene.gltf');
//   const { model, k, c } = useMemo(() => {
//     const m = scene.clone(true);
//     m.traverse(o => { if (o.isMesh) o.material = o.material.clone(); });
//     const box = new THREE.Box3().setFromObject(m);
//     const size = box.getSize(new THREE.Vector3());
//     const c = box.getCenter(new THREE.Vector3());
//     return { model: m, k: 2.6 / Math.max(size.x, size.y, size.z), c };
//   }, [scene]);
//   useEffect(() => {
//     let tex = null;
//     if (pattern === 'Stripes' || pattern === 'Checks') {
//       const cv = document.createElement('canvas');
//       cv.width = 256; cv.height = 256;
//       const x = cv.getContext('2d');
//       x.fillStyle = colour; x.fillRect(0, 0, 256, 256);
//       x.fillStyle = 'rgba(255,255,255,0.35)';
//       for (let i = 0; i < 256; i += 32) x.fillRect(i, 0, 12, 256);
//       if (pattern === 'Checks') for (let j = 0; j < 256; j += 32) x.fillRect(0, j, 256, 12);
//       tex = new THREE.CanvasTexture(cv);
//       tex.colorSpace = THREE.SRGBColorSpace;
//       tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
//       tex.repeat.set(6, 6);
//     }
//     model.traverse(o => {
//       if (o.isMesh) {
//         o.material.map = tex;
//         o.material.color.set(tex ? '#ffffff' : colour);
//         o.material.needsUpdate = true;
//       }
//     });
//     return () => { if (tex) tex.dispose(); };
//   }, [model, colour, pattern]);
//   return (
//     <group scale={k}>
//       <primitive object={model} position={[-c.x, -c.y, -c.z]} />
//     </group>
//   );
// }

// function SkirtModel({ colour, pattern }) {
//   const { scene } = useGLTF('/models/skirt/skirt.glb');
//   const { model, k, c } = useMemo(() => {
//     const m = scene.clone(true);
//     m.traverse(o => { if (o.isMesh) o.material = o.material.clone(); });
//     const box = new THREE.Box3().setFromObject(m);
//     const size = box.getSize(new THREE.Vector3());
//     const c = box.getCenter(new THREE.Vector3());
//     return { model: m, k: 2.6 / Math.max(size.x, size.y, size.z), c };
//   }, [scene]);
//   useEffect(() => {
//     let tex = null;
//     if (pattern === 'Stripes' || pattern === 'Checks') {
//       const cv = document.createElement('canvas');
//       cv.width = 256; cv.height = 256;
//       const x = cv.getContext('2d');
//       x.fillStyle = colour; x.fillRect(0, 0, 256, 256);
//       x.fillStyle = 'rgba(255,255,255,0.35)';
//       for (let i = 0; i < 256; i += 32) x.fillRect(i, 0, 12, 256);
//       if (pattern === 'Checks') for (let j = 0; j < 256; j += 32) x.fillRect(0, j, 256, 12);
//       tex = new THREE.CanvasTexture(cv);
//       tex.colorSpace = THREE.SRGBColorSpace;
//       tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
//       tex.repeat.set(1, 1);
//     }
//     model.traverse(o => {
//       if (o.isMesh) {
//         o.material.map = tex;
//         o.material.color.set(tex ? '#ffffff' : colour);
//         o.material.needsUpdate = true;
//       }
//     });
//     return () => { if (tex) tex.dispose(); };
//   }, [model, colour, pattern]);
//   return (
//     <group scale={k}>
//       <primitive object={model} position={[-c.x, -c.y, -c.z]} />
//     </group>
//   );
// }

// function PinaforeModel({ colour, pattern }) {
//   const { scene } = useGLTF('/models/pinafore/pinafore.glb');
//   const { model, k, c } = useMemo(() => {
//     const m = scene.clone(true);
//     m.traverse(o => { if (o.isMesh) o.material = o.material.clone(); });
//     const box = new THREE.Box3().setFromObject(m);
//     const size = box.getSize(new THREE.Vector3());
//     const c = box.getCenter(new THREE.Vector3());
//     return { model: m, k: 2.6 / Math.max(size.x, size.y, size.z), c };
//   }, [scene]);
//   useEffect(() => {
//     let tex = null;
//     if (pattern === 'Stripes' || pattern === 'Checks') {
//       const cv = document.createElement('canvas');
//       cv.width = 256; cv.height = 256;
//       const x = cv.getContext('2d');
//       x.fillStyle = colour; x.fillRect(0, 0, 256, 256);
//       x.fillStyle = 'rgba(255,255,255,0.35)';
//       for (let i = 0; i < 256; i += 32) x.fillRect(i, 0, 12, 256);
//       if (pattern === 'Checks') for (let j = 0; j < 256; j += 32) x.fillRect(0, j, 256, 12);
//       tex = new THREE.CanvasTexture(cv);
//       tex.colorSpace = THREE.SRGBColorSpace;
//       tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
//       tex.repeat.set(3, 3);
//     }
//     model.traverse(o => {
//       if (o.isMesh) {
//         o.material.map = tex;
//         o.material.color.set(tex ? '#ffffff' : colour);
//         o.material.needsUpdate = true;
//       }
//     });
//     return () => { if (tex) tex.dispose(); };
//   }, [model, colour, pattern]);
//   return (
//     <group scale={k}>
//       <primitive object={model} position={[-c.x, -c.y, -c.z]} />
//     </group>
//   );
// }

// function BlazerModel({ colour, pattern }) {
//   const { scene } = useGLTF('/models/blazer/blazer.glb');
//   const { model, k, c } = useMemo(() => {
//     const m = scene.clone(true);
//     m.traverse(o => { if (o.isMesh) o.material = o.material.clone(); });
//     const box = new THREE.Box3().setFromObject(m);
//     const size = box.getSize(new THREE.Vector3());
//     const c = box.getCenter(new THREE.Vector3());
//     return { model: m, k: 2.6 / Math.max(size.x, size.y, size.z), c };
//   }, [scene]);
//   useEffect(() => {
//     let tex = null;
//     if (pattern === 'Stripes' || pattern === 'Checks') {
//       const cv = document.createElement('canvas');
//       cv.width = 256; cv.height = 256;
//       const x = cv.getContext('2d');
//       x.fillStyle = colour; x.fillRect(0, 0, 256, 256);
//       x.fillStyle = 'rgba(255,255,255,0.35)';
//       for (let i = 0; i < 256; i += 32) x.fillRect(i, 0, 12, 256);
//       if (pattern === 'Checks') for (let j = 0; j < 256; j += 32) x.fillRect(0, j, 256, 12);
//       tex = new THREE.CanvasTexture(cv);
//       tex.colorSpace = THREE.SRGBColorSpace;
//       tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
//       tex.repeat.set(6, 6);
//     }
//     model.traverse(o => {
//       if (o.isMesh && o.material.name !== 'buttons') {
//         o.material.map = tex;
//         o.material.color.set(tex ? '#ffffff' : colour);
//         o.material.needsUpdate = true;
//       }
//     });
//     return () => { if (tex) tex.dispose(); };
//   }, [model, colour, pattern]);
//   return (
//     <group scale={k}>
//       <primitive object={model} position={[-c.x, -c.y, -c.z]} />
//     </group>
//   );
// }

// function ShadowRig() {
//   const scene = useThree(s => s.scene);
//   useFrame(() => {
//     scene.traverse(o => {
//       if (o.isMesh && !o.userData.shadowSet && o.material && !o.material.transparent) {
//         o.castShadow = true;
//         o.receiveShadow = true;
//         o.userData.shadowSet = true;
//       }
//     });
//   });
//   return null;
// }

// function ChefCoatModel({ colour, pattern }) {
//   const { scene } = useGLTF('/models/chefcoat/chefcoat.glb');
//   const { model, k, c } = useMemo(() => {
//     const m = scene.clone(true);
//     m.traverse(o => { if (o.isMesh) o.material = o.material.clone(); });
//     const box = new THREE.Box3().setFromObject(m);
//     const size = box.getSize(new THREE.Vector3());
//     const c = box.getCenter(new THREE.Vector3());
//     return { model: m, k: 2.6 / Math.max(size.x, size.y, size.z), c };
//   }, [scene]);
//   useEffect(() => {
//     let tex = null;
//     if (pattern === 'Stripes' || pattern === 'Checks') {
//       const cv = document.createElement('canvas');
//       cv.width = 256; cv.height = 256;
//       const x = cv.getContext('2d');
//       x.fillStyle = colour; x.fillRect(0, 0, 256, 256);
//       x.fillStyle = 'rgba(255,255,255,0.35)';
//       for (let i = 0; i < 256; i += 32) x.fillRect(i, 0, 12, 256);
//       if (pattern === 'Checks') for (let j = 0; j < 256; j += 32) x.fillRect(0, j, 256, 12);
//       tex = new THREE.CanvasTexture(cv);
//       tex.colorSpace = THREE.SRGBColorSpace;
//       tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
//       tex.repeat.set(6, 6);
//     }
//     model.traverse(o => {
//       if (o.isMesh) {
//         o.material.map = tex;
//         o.material.color.set(tex ? '#ffffff' : colour);
//         o.material.needsUpdate = true;
//       }
//     });
//     return () => { if (tex) tex.dispose(); };
//   }, [model, colour, pattern]);
//   return (
//     <group scale={k}>
//       <primitive object={model} position={[-c.x, -c.y, -c.z]} />
//     </group>
//   );
// }

// function HiVisModel({ colour }) {
//   const { scene } = useGLTF('/models/hivis/hivis.glb');
//   const { model, k, c } = useMemo(() => {
//     const m = scene.clone(true);
//     m.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.userData.orig = o.material.map; } });
//     const box = new THREE.Box3().setFromObject(m);
//     const size = box.getSize(new THREE.Vector3());
//     const c = box.getCenter(new THREE.Vector3());
//     return { model: m, k: 2.6 / Math.max(size.x, size.y, size.z), c };
//   }, [scene]);
//   useEffect(() => {
//     let tex = null;
//     const col = new THREE.Color(colour);
//         const hx = parseInt(colour.replace('#', ''), 16); const R = (hx >> 16) & 255, G = (hx >> 8) & 255, B = hx & 255;
//     model.traverse(o => {
//       if (!o.isMesh) return;
//       const orig = o.material.userData.orig;
//       const img = orig && orig.image;
//       if (!img || !img.width) return;
//       try {
//         const cv = document.createElement('canvas');
//         cv.width = img.width; cv.height = img.height;
//         const x = cv.getContext('2d', { willReadFrequently: true });
//         x.drawImage(img, 0, 0);
//         const d = x.getImageData(0, 0, cv.width, cv.height);
//         const p = d.data;
//         for (let i = 0; i < p.length; i += 4) {
//           const mx = Math.max(p[i], p[i + 1], p[i + 2]);
//           const mn = Math.min(p[i], p[i + 1], p[i + 2]);
//           const s = mx === 0 ? 0 : (mx - mn) / mx;
//           if (s > 0.45) {
//             const v = mx / 255; // fabric only; silver stripes stay as they are
//             p[i] = R * v; p[i + 1] = G * v; p[i + 2] = B * v;
//           }
//         }
//         x.putImageData(d, 0, 0);
//         tex = new THREE.CanvasTexture(cv);
//         tex.flipY = false;
//         tex.colorSpace = THREE.SRGBColorSpace;
//         tex.anisotropy = 8;
//         o.material.map = tex;
//         o.material.color.set('#ffffff');
//         o.material.needsUpdate = true;
//       } catch (e) { console.warn('hivis recolour failed', e); }
//     });
//     return () => { if (tex) tex.dispose(); };
//   }, [model, colour]);
//   return (
//     <group scale={k}>
//       <primitive object={model} position={[-c.x, -c.y, -c.z]} />
//     </group>
//   );
// }

// function CoverallModel({ colour }) {
//   const { scene } = useGLTF('/models/coverall/coverall.glb');
//   const { model, k, c } = useMemo(() => {
//     const m = scene.clone(true);
//     m.traverse(o => {
//       if (!o.isMesh) return;
//       o.material = o.material.clone();
//       o.material.userData.orig = o.material.map;
//       o.material.side = THREE.DoubleSide;
//       o.material.metalness = 0;
//       o.material.roughness = 0.85;
//       if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals();
//     });
//     const box = new THREE.Box3().setFromObject(m);
//     const size = box.getSize(new THREE.Vector3());
//     const c = box.getCenter(new THREE.Vector3());
//     return { model: m, k: 2.6 / Math.max(size.x, size.y, size.z), c };
//   }, [scene]);
//   useEffect(() => {
//     let tex = null;
//     const hx = parseInt(colour.replace('#', ''), 16);
//     const R = (hx >> 16) & 255, G = (hx >> 8) & 255, B = hx & 255;
//     model.traverse(o => {
//       if (!o.isMesh) return;
//       const orig = o.material.userData.orig;
//       const img = orig && orig.image;
//       if (!img || !img.width) return;
//       try {
//         const cv = document.createElement('canvas');
//         cv.width = img.width; cv.height = img.height;
//         const x = cv.getContext('2d', { willReadFrequently: true });
//         x.drawImage(img, 0, 0);
//         const d = x.getImageData(0, 0, cv.width, cv.height);
//         const p = d.data;
//         for (let i = 0; i < p.length; i += 4) {
//           const mx = Math.max(p[i], p[i + 1], p[i + 2]);
//           const mn = Math.min(p[i], p[i + 1], p[i + 2]);
//           const s = mx === 0 ? 0 : (mx - mn) / mx;
//           if (s > 0.45) {
//           const v = Math.max(0.6, Math.min(1.5, mx / 100));
//             p[i] = Math.min(255, R * v); p[i + 1] = Math.min(255, G * v); p[i + 2] = Math.min(255, B * v);
//           } else if (mx <= 120) {
//             p[i] = R * 0.6; p[i + 1] = G * 0.6; p[i + 2] = B * 0.6;
//           } else {
//             p[i] = 255; p[i + 1] = 255; p[i + 2] = 255;
//           }
//         }
//         x.putImageData(d, 0, 0);
//         tex = new THREE.CanvasTexture(cv);
//         tex.flipY = false;
//         tex.colorSpace = THREE.SRGBColorSpace;
//         tex.anisotropy = 8;
//         o.material.map = tex;
//         o.material.color.set('#ffffff');
//         o.material.emissiveMap = tex;
//         o.material.emissive.set('#ffffff');
//         o.material.emissiveIntensity = 0.4;
//         o.material.needsUpdate = true;
//       } catch (e) { console.warn('coverall recolour failed', e); }
//     });
//     return () => { if (tex) tex.dispose(); };
//   }, [model, colour]);
//   return (
//     <group scale={k}>
//       <primitive object={model} position={[-c.x, -c.y, -c.z]} />
//     </group>
//   );
// }


// function SetPart({ url, colour, pattern = 'Plain', repeat = 3, height, y, wide = 1, pocket = false }) {
//   const { scene } = useGLTF(url);
//   const { model, k } = useMemo(() => {
//     const m = scene.clone(true);
//     m.traverse(o => { if (o.isMesh) o.material = o.material.clone(); });
//     const box = new THREE.Box3().setFromObject(m);
//     const size = box.getSize(new THREE.Vector3());
//     const c = box.getCenter(new THREE.Vector3());
//     m.position.set(-c.x, -c.y, -c.z);
//     if (pocket) {
//       const pk = new THREE.Mesh(
//         new THREE.BoxGeometry(0.105, 0.125, 0.014),
//         new THREE.MeshStandardMaterial({ roughness: 0.85 })
//       );
//       pk.position.set(0.15, 0.17, 0.142);
//       pk.rotation.x = -0.12;
//       m.add(pk);
//     }
//     return { model: m, k: height / size.y };
//   }, [scene, height, pocket]);
//   useEffect(() => {
//     let tex = null;
//     if (pattern === 'Stripes' || pattern === 'Checks') {
//       const cv = document.createElement('canvas');
//       cv.width = 256; cv.height = 256;
//       const x = cv.getContext('2d');
//       x.fillStyle = colour; x.fillRect(0, 0, 256, 256);
//       x.fillStyle = 'rgba(255,255,255,0.35)';
//       for (let i = 0; i < 256; i += 32) x.fillRect(i, 0, 12, 256);
//       if (pattern === 'Checks') for (let j = 0; j < 256; j += 32) x.fillRect(0, j, 256, 12);
//       tex = new THREE.CanvasTexture(cv);
//       tex.colorSpace = THREE.SRGBColorSpace;
//       tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
//       tex.repeat.set(repeat, repeat);
//     }
//     model.traverse(o => {
//       if (o.isMesh) {
//         o.material.map = tex;
//         o.material.color.set(tex ? '#ffffff' : colour);
//         o.material.needsUpdate = true;
//       }
//     });
//     return () => { if (tex) tex.dispose(); };
//   }, [model, colour, pattern, repeat]);
//   return (
//     <group position={[0, y, 0]} scale={[k * wide, k, k * wide]}>
//       <primitive object={model} />
//     </group>
//   );
// }

// function SchoolShirtModel({ colour, pattern = 'Plain' }) {
//   return (
//     <group scale={2.6}>
//       <SetPart url="/models/school-shirt/shirt-school.glb" colour={colour} pattern={pattern} height={1} y={0} />
//     </group>
//   );
// }
// function SchoolSet({ shirtColour, pantColour, shirtPattern = 'Plain', pantPattern = 'Plain', shirtWide = 1, pantY = -0.45 }) {
// return (
//     <group scale={1.75} position={[0, 0.306, 0]}>
//       <SetPart url="/models/school-shirt/shirt-tucked.glb" colour={shirtColour} pattern={shirtPattern} repeat={4}  height={0.65} y={0.225} wide={shirtWide} />
//       <SetPart url="/models/school-pant/pant-school.glb" colour={pantColour} pattern={pantPattern} repeat={3} height={0.90} y={pantY} wide={1.08} />
//     </group>
//   );
// }

// function BlazerSchoolModel({ colour, height = 1.15, y = 0.725, wide = 1.58 }) {
//   const { scene } = useGLTF('/models/blazer_school/blazer_school.glb');
//   const { model, k } = useMemo(() => {
//     const m = scene.clone(true);
//     m.traverse(o => { if (o.isMesh) o.material = o.material.clone(); });
//     const box = new THREE.Box3().setFromObject(m);
//     const size = box.getSize(new THREE.Vector3());
//     const c = box.getCenter(new THREE.Vector3());
//     m.position.set(-c.x, -c.y, -c.z);
    
//     return { model: m, k: height / size.y };
//   }, [scene, height]);
//   useEffect(() => {
//     model.traverse(o => {
//       if (o.isMesh) {
//         o.material.color.set(colour);
//         o.material.needsUpdate = true;
//       }
//     });
//   }, [model, colour]);
//   const lining = useMemo(() => model.clone(true), [model]);
//   return (
    
//     <group position={[0, y, 0]} scale={[k * wide, k, k * wide]}>
//       <primitive object={model} />
//       <group scale={0.96}><primitive object={lining} /></group>
//     </group>
//   );
// }

// function BlazerSetOld({ blazerColour, shirtColour, shirtPattern }) {
//   return (
//     <><SchoolSet shirtColour={shirtColour} shirtPattern={shirtPattern} pantColour="#5a5f6b" shirtWide={0.88} />
//       <BlazerSchoolModel colour={blazerColour} />
//     </>
//   );
// }
// function BlazerSet({ blazerColour, shirtColour, shirtPattern, pantColour = '#5a5f6b' }) {
//   const FIT_W = 1.4; // blazer width vs shirt (peddadi chesthe broad)
//   const LEN = 0.85;   // blazer length (peddadi chesthe longer)
//   const shirt = useGLTF('/models/school-shirt/shirt-tucked.glb');
//   const blazer = useGLTF('/models/blazer_school/blazer_school.glb');
//   const fit = useMemo(() => {
//     const sb = new THREE.Box3().setFromObject(shirt.scene).getSize(new THREE.Vector3());
//     const bb = new THREE.Box3().setFromObject(blazer.scene).getSize(new THREE.Vector3());
//     const shirtWidth = sb.x * (0.65 / sb.y) * 0.88 * 1.75;
//     const shirtTop = 0.306 + 1.75 * (0.225 + 0.325);
//     const s = (shirtWidth * FIT_W) / bb.x;
//     const height = bb.y * s * LEN;
//     return { height, y: shirtTop + 0.02 - height / 2, wide: 1 / LEN };
//   }, [shirt, blazer]);
//   return (
//     <>
//       <SchoolSet shirtColour={shirtColour} shirtPattern={shirtPattern} pantColour={pantColour} shirtWide={0.60} pantY={-0.48}/>
//       <BlazerSchoolModel colour={blazerColour} height={fit.height} y={fit.y} wide={fit.wide} />
//     </>
//   );
// }

// function BlazerPair({ view, colour, shirtColour, shirtPattern }) {
//   if (view === 'side') {
//     return <BlazerSet blazerColour={colour} shirtColour={shirtColour} shirtPattern={shirtPattern} />;
//   }
//   const d = view === 'back' ? -1 : 1;
//   return (
//     <>
//       <group position={[-1.5 * d, 0, 0]}>
//         <BlazerSchoolModel colour={colour} height={1.9} y={0} wide={1} />
//       </group>
//       <group position={[1.3 * d, 0, 0]}>
//         <BlazerSet blazerColour={colour} shirtColour={shirtColour} shirtPattern={shirtPattern} />
//       </group>
//     </>
//   );
// }

// function GownModel({ colour }) {
//   const { scene } = useGLTF('/models/gown/gown_clean.glb');
//   const { model, k } = useMemo(() => {
//     const m = scene.clone(true);
//     m.traverse(o => { if (o.isMesh) o.material = o.material.clone(); });
//     const box = new THREE.Box3().setFromObject(m);
//     const size = box.getSize(new THREE.Vector3());
//     const c = box.getCenter(new THREE.Vector3());
//     m.position.set(-c.x, -c.y, -c.z);
//     return { model: m, k: 2.6 / size.y };
//   }, [scene]);
//   useEffect(() => {
//     model.traverse(o => {
//       if (o.isMesh) {
//         o.material.color.set(colour);
//         o.material.needsUpdate = true;
//       }
//     });
//   }, [model, colour]);
//   return (
//     <group scale={k}>
//       <primitive object={model} />
//     </group>
//   );
// }

// function CameraRig({ view, controls }) {
//   const { camera } = useThree();
//   useEffect(() => {
//     const pos = view === 'back' ? [0, 0.3, -6] : view === 'side' ? [6, 0.3, 0] : [0, 0.3, 6];
//     camera.position.set(...pos);
//     camera.lookAt(0, 0, 0);
//     if (controls.current) controls.current.update();
//   }, [view, camera, controls]);
//   return null;
// }

// export default function Garment3D({ garment = 'Shirt', colour, pattern = 'Plain', logoUrl = '', logoPos = { dx: 0, dy: 0, size: 32 }, shirtColour = '#ffffff', shirtPattern = 'Plain', pantColour = '#5a5f6b' }){
//   const [blazerOnly, setBlazerOnly] = useState(false);
//   const [view, setView] = useState('front');
//   const controls = useRef();
//     if (garment === 'Blazer') {
//     return (
//       <div>
//         <div className="g3d-pair">
//           <MiniCanvas view={view}>
//             <BlazerSchoolModel colour={colour} height={1.9} y={0} wide={1} />
//           </MiniCanvas>
//           <MiniCanvas view={view}>
//             <BlazerSet blazerColour={colour} shirtColour={shirtColour} shirtPattern={shirtPattern} pantColour={pantColour} />
//           </MiniCanvas>
//         </div>
//         <div className="ds-mode">
//           {['front', 'back', 'side'].map(v => (
//             <button key={v} type="button" aria-pressed={view === v} className={view === v ? 'btn gold' : 'btn ghost'} onClick={() => setView(v)}>
//               {v.charAt(0).toUpperCase() + v.slice(1)}
//             </button>
//           ))}
//         </div>
//         <p className="ds-note small">Drag to rotate. Pinch or scroll to zoom. Each preview moves on its own.</p>
//       </div>
//     );
//   }
//   return (
//     <div>
//       <div className="g3d" role="img" aria-label={`3D preview of ${garment}. Use the Front, Back and Side buttons to change the view.`}>
//         <Canvas shadows camera={{ position: [0, 0.3, 6], fov: 40 }} dpr={[1, 2]}>
//           <hemisphereLight args={['#ffffff', '#9aa3c0', 1.2]} />
//           <ambientLight intensity={1.0} />
//           <directionalLight position={[4, 6, 5]} intensity={1.4} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.02} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} shadow-camera-near={1} shadow-camera-far={20} />
//           <directionalLight position={[-4, 3, 4]} intensity={0.9} />
//           <directionalLight position={[0, 3, -6]} intensity={0.8} />
//           <Suspense fallback={null}>
//             {garment === 'Shirt'
//               ? <SchoolShirtModel colour={colour} pattern={pattern} />
//               : /trouser|pant/i.test(garment)
//                 ?<SchoolSet shirtColour={shirtColour} shirtPattern={shirtPattern} pantColour={colour} />
//                 : garment === 'Lab coat'
//                   ? <LabCoatModel colour={colour} pattern={pattern} />
//                   : (garment === 'Scrub top' || garment === 'Salon wear')
//                     ? <ScrubTopModel colour={colour} pattern={pattern} />
//                     : garment === 'Apron'
//                       ? <ApronModel colour={colour} pattern={pattern} />
//                       : garment === 'Skirt'
//                         ? <SkirtModel colour={colour} pattern={pattern} />
//                         : garment === 'Pinafore'
//                           ? <PinaforeModel colour={colour} pattern={pattern} />
//                           : garment === 'Blazer'
//                           ? <BlazerPair view={view} colour={colour} shirtColour={shirtColour} shirtPattern={shirtPattern} />
//                             : garment === 'Chef coat'
//                               ? <ChefCoatModel colour={colour} pattern={pattern} />
//                               : garment === 'Hi-vis jacket'
//                                 ? <HiVisModel colour={colour} />
//                                 : garment === 'Gown'
//                                   ? <GownModel colour={colour} />
//                                 : garment === 'Coverall'
//                                 ? <CoverallModel colour={colour} />
//                                 : <Garment garment={garment} colour={colour} pattern={pattern} />}
//             {garment === 'Shirt' && logoUrl && <LogoPlane url={logoUrl} pos={logoPos} />}
//           </Suspense>
//           <ContactShadows position={[0, -1.25, 0]} opacity={0.35} scale={8} blur={2.5} far={3} />
//           <OrbitControls ref={controls} enablePan={false} minDistance={3} maxDistance={10} />
//           <CameraRig view={view} controls={controls} />
//           <ShadowRig />
//         </Canvas>
//       </div>
//       <div className="ds-mode">{['front', 'back', 'side'].map(v => (
//   <button
//     key={v}
//     type="button"
//     aria-label={`View ${v}`}
//     aria-pressed={view === v}
//     className={view === v ? 'btn gold' : 'btn ghost'}
//     onClick={() => setView(v)}
//   >
//     {v.charAt(0).toUpperCase() + v.slice(1)}
//   </button>
// ))}
//       </div>
//       {garment === 'Blazer' && (
//   <div className="ds-mode">
//     <button type="button" className={!blazerOnly ? 'btn gold' : 'btn ghost'} onClick={() => setBlazerOnly(false)}>With shirt and trouser</button>
//     <button type="button" className={blazerOnly ? 'btn gold' : 'btn ghost'} onClick={() => setBlazerOnly(true)}>Blazer only</button>
//   </div>
// )}
//       <p className="ds-note small">Drag to rotate. Pinch or scroll to zoom.</p>
//     </div>
//   );
// }


// function Lights() {
//   return (
//     <>
//       <hemisphereLight args={['#ffffff', '#9aa3c0', 1.2]} />
//       <ambientLight intensity={1.0} />
//       <directionalLight position={[4, 6, 5]} intensity={1.4} />
//       <directionalLight position={[-4, 3, 4]} intensity={0.9} />
//       <directionalLight position={[0, 3, -6]} intensity={0.8} />
//     </>
//   );
// }

// function MiniCanvas({ view, children }) {
//   const controls = useRef();
//   return (
//     <div className="g3d g3d-half">
//       <Canvas camera={{ position: [0, 0.3, 6], fov: 40 }} dpr={[1, 2]}>
//         <Lights />
//         <Suspense fallback={null}>{children}</Suspense>
//         <ContactShadows position={[0, -1.25, 0]} opacity={0.35} scale={8} blur={2.5} far={3} />
//         <OrbitControls ref={controls} enablePan={false} minDistance={3} maxDistance={10} />
//         <CameraRig view={view} controls={controls} />
//       </Canvas>
//     </div>
//   );
// }


import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
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

function ShadowRig() {
  const scene = useThree(s => s.scene);
  useFrame(() => {
    scene.traverse(o => {
      if (o.isMesh && !o.userData.shadowSet && o.material && !o.material.transparent) {
        o.castShadow = true;
        o.receiveShadow = true;
        o.userData.shadowSet = true;
      }
    });
  });
  return null;
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


function SetPart({ url, colour, pattern = 'Plain', repeat = 3, height, y, wide = 1, pocket = false, texUrl = '' }) {
  const { scene } = useGLTF(url);
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
    return { model: m, k: height / size.y };
  }, [scene, height, pocket]);
  useEffect(() => {
    let tex = null;
    let dead = false;
    const apply = t => {
      model.traverse(o => {
        if (o.isMesh) {
          o.material.map = t;
          o.material.color.set(t ? '#ffffff' : colour);
          o.material.needsUpdate = true;
        }
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
  }, [model, colour, pattern, repeat, texUrl]);
  return (
    <group position={[0, y, 0]} scale={[k * wide, k, k * wide]}>
      <primitive object={model} />
    </group>
  );
}
function SchoolShirtModel({ colour, pattern = 'Plain' }) {
  return (
    <group scale={2.6}>
      <SetPart url="/models/school-shirt/shirt-school.glb" colour={colour} pattern={pattern} height={1} y={0} />
    </group>
  );
}
function SchoolSet({ shirtColour, pantColour, shirtPattern = 'Plain', pantPattern = 'Plain', shirtWide = 1, pantY = -0.45 }) {
return (
    <group scale={1.75} position={[0, 0.306, 0]}>
      <SetPart url="/models/school-shirt/shirt-tucked.glb" colour={shirtColour} pattern={shirtPattern} repeat={4}  height={0.65} y={0.225} wide={shirtWide} />
      <SetPart url="/models/school-pant/pant-school.glb" colour={pantColour} pattern={pantPattern} repeat={3} height={0.90} y={pantY} wide={1.08} />
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

function BlazerSetOld({ blazerColour, shirtColour, shirtPattern }) {
  return (
    <><SchoolSet shirtColour={shirtColour} shirtPattern={shirtPattern} pantColour="#5a5f6b" shirtWide={0.88} />
      <BlazerSchoolModel colour={blazerColour} />
    </>
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

function BlazerPair({ view, colour, shirtColour, shirtPattern }) {
  if (view === 'side') {
    return <BlazerSet blazerColour={colour} shirtColour={shirtColour} shirtPattern={shirtPattern} />;
  }
  const d = view === 'back' ? -1 : 1;
  return (
    <>
      <group position={[-1.5 * d, 0, 0]}>
        <BlazerSchoolModel colour={colour} height={1.9} y={0} wide={1} />
      </group>
      <group position={[1.3 * d, 0, 0]}>
        <BlazerSet blazerColour={colour} shirtColour={shirtColour} shirtPattern={shirtPattern} />
      </group>
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

export default function Garment3D({ garment = 'Shirt', colour, pattern = 'Plain', logoUrl = '', logoPos = { dx: 0, dy: 0, size: 32 }, shirtColour = '#ffffff', shirtPattern = 'Plain', pantColour = '#5a5f6b' }){
  const [blazerOnly, setBlazerOnly] = useState(false);
  const [view, setView] = useState('front');
  const controls = useRef();
    if (garment === 'Blazer') {
    return (
      <div>
        <div className="g3d-pair">
          <MiniCanvas view={view}>
            <BlazerSchoolModel colour={colour} height={1.9} y={0} wide={1} />
          </MiniCanvas>
          <MiniCanvas view={view}>
            <BlazerSet blazerColour={colour} shirtColour={shirtColour} shirtPattern={shirtPattern} pantColour={pantColour} />
          </MiniCanvas>
        </div>
        <div className="ds-mode">
          {['front', 'back', 'side'].map(v => (
            <button key={v} type="button" aria-pressed={view === v} className={view === v ? 'btn gold' : 'btn ghost'} onClick={() => setView(v)}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <p className="ds-note small">Drag to rotate. Pinch or scroll to zoom. Each preview moves on its own.</p>
      </div>
    );
  }
  return (
    <div>
      <div className="g3d" role="img" aria-label={`3D preview of ${garment}. Use the Front, Back and Side buttons to change the view.`}>
        <Canvas shadows camera={{ position: [0, 0.3, 6], fov: 40 }} dpr={[1, 2]}>
          <hemisphereLight args={['#ffffff', '#9aa3c0', 1.2]} />
          <ambientLight intensity={1.0} />
          <directionalLight position={[4, 6, 5]} intensity={1.4} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.02} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} shadow-camera-near={1} shadow-camera-far={20} />
          <directionalLight position={[-4, 3, 4]} intensity={0.9} />
          <directionalLight position={[0, 3, -6]} intensity={0.8} />
          <Suspense fallback={null}>
            {garment === 'Shirt'
              ? <SchoolShirtModel colour={colour} pattern={pattern} />
              : /trouser|pant/i.test(garment)
                ?<SchoolSet shirtColour={shirtColour} shirtPattern={shirtPattern} pantColour={colour} />
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
                          : garment === 'Blazer'
                          ? <BlazerPair view={view} colour={colour} shirtColour={shirtColour} shirtPattern={shirtPattern} />
                            : garment === 'Chef coat'
                              ? <ChefCoatModel colour={colour} pattern={pattern} />
                              : garment === 'Hi-vis jacket'
                                ? <HiVisModel colour={colour} />
                                : garment === 'Gown'
                                  ? <GownModel colour={colour} />
                                : garment === 'Coverall'
                                ? <CoverallModel colour={colour} />
                                : <Garment garment={garment} colour={colour} pattern={pattern} />}
            {garment === 'Shirt' && logoUrl && <LogoPlane url={logoUrl} pos={logoPos} />}
          </Suspense>
          <ContactShadows position={[0, -1.25, 0]} opacity={0.35} scale={8} blur={2.5} far={3} />
          <OrbitControls ref={controls} enablePan={false} minDistance={3} maxDistance={10} />
          <CameraRig view={view} controls={controls} />
          <ShadowRig />
        </Canvas>
      </div>
      <div className="ds-mode">{['front', 'back', 'side'].map(v => (
  <button
    key={v}
    type="button"
    aria-label={`View ${v}`}
    aria-pressed={view === v}
    className={view === v ? 'btn gold' : 'btn ghost'}
    onClick={() => setView(v)}
  >
    {v.charAt(0).toUpperCase() + v.slice(1)}
  </button>
))}
      </div>
      {garment === 'Blazer' && (
  <div className="ds-mode">
    <button type="button" className={!blazerOnly ? 'btn gold' : 'btn ghost'} onClick={() => setBlazerOnly(false)}>With shirt and trouser</button>
    <button type="button" className={blazerOnly ? 'btn gold' : 'btn ghost'} onClick={() => setBlazerOnly(true)}>Blazer only</button>
  </div>
)}
      <p className="ds-note small">Drag to rotate. Pinch or scroll to zoom.</p>
    </div>
  );
}


function Lights() {
  return (
    <>
      <hemisphereLight args={['#ffffff', '#9aa3c0', 1.2]} />
      <ambientLight intensity={1.0} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} />
      <directionalLight position={[-4, 3, 4]} intensity={0.9} />
      <directionalLight position={[0, 3, -6]} intensity={0.8} />
    </>
  );
}

function MiniCanvas({ view, children }) {
  const controls = useRef();
  return (
    <div className="g3d g3d-half">
      <Canvas camera={{ position: [0, 0.3, 6], fov: 40 }} dpr={[1, 2]}>
        <Lights />
        <Suspense fallback={null}>{children}</Suspense>
        <ContactShadows position={[0, -1.25, 0]} opacity={0.35} scale={8} blur={2.5} far={3} />
        <OrbitControls ref={controls} enablePan={false} minDistance={3} maxDistance={10} />
        <CameraRig view={view} controls={controls} />
      </Canvas>
    </div>
  );
}