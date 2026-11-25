// Shared 3D "studio" pieces for the Design Studio previews:
// lighting + reflections, fabric surface look, and the logo decal.
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';

// How each fabric reads on screen. weave = depth of the woven texture,
// rough = how matte the surface is (polyester has a slight sheen).
export const FABRIC_LOOK = {
  Cotton: { weave: 0.3, rough: 0.92 },
  'Poly-cotton blend': { weave: 0.22, rough: 0.85 },
  Polyester: { weave: 0.12, rough: 0.72 },
};
const DEFAULT_LOOK = { weave: 0.22, rough: 0.88 };
export const fabricLook = fabric => FABRIC_LOOK[fabric] || DEFAULT_LOOK;

// Soft studio reflections without downloading an HDR file.
function StudioEnvironment() {
  const gl = useThree(s => s.gl);
  const scene = useThree(s => s.scene);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
      if (room.dispose) room.dispose();
    };
  }, [gl, scene]);
  return null;
}

// Key / fill / rim lighting, like a product photo set-up.
export function StudioLights({ shadows = false }) {
  return (
    <>
      <StudioEnvironment />
      <hemisphereLight args={['#ffffff', '#c3c8d6', 0.45]} />
      <directionalLight
        position={[3.5, 5, 4.5]}
        intensity={1.9}
        color="#fff6ea"
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={4}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-camera-near={1}
        shadow-camera-far={20}
      />
      <directionalLight position={[-4.5, 2.5, 3]} intensity={0.7} color="#e6eeff" />
      <directionalLight position={[0, 3.5, -5]} intensity={1.1} />
      <directionalLight position={[-3, 2.5, -4]} intensity={0.6} color="#e6eeff" />
    </>
  );
}

// Woven-cloth normal map, drawn once in code (no image download).
let weaveTex = null;
function weaveNormalMap() {
  if (weaveTex) return weaveTex;
  const N = 128, THREADS = 8;
  const h = new Float32Array(N * N);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const u = (x / N) * THREADS, v = (y / N) * THREADS;
      const cu = Math.floor(u), cv = Math.floor(v);
      const fu = u - cu, fv = v - cv;
      // 2/1 twill: the over/under step shifts by one thread each row.
      const warpOnTop = ((cu + cv) % 3) !== 0;
      const warp = Math.sin(Math.PI * fu) * (0.6 + 0.4 * Math.sin(Math.PI * fv));
      const weft = Math.sin(Math.PI * fv) * (0.6 + 0.4 * Math.sin(Math.PI * fu));
      h[y * N + x] = warpOnTop ? warp : weft;
    }
  }
  const data = new Uint8Array(N * N * 4);
  const at = (x, y) => h[((y + N) % N) * N + ((x + N) % N)];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * 2.2;
      const dy = (at(x, y + 1) - at(x, y - 1)) * 2.2;
      const n = new THREE.Vector3(-dx, -dy, 1).normalize();
      const i = (y * N + x) * 4;
      data[i] = (n.x * 0.5 + 0.5) * 255;
      data[i + 1] = (n.y * 0.5 + 0.5) * 255;
      data[i + 2] = (n.z * 0.5 + 0.5) * 255;
      data[i + 3] = 255;
    }
  }
  weaveTex = new THREE.DataTexture(data, N, N, THREE.RGBAFormat);
  weaveTex.wrapS = weaveTex.wrapT = THREE.RepeatWrapping;
  weaveTex.magFilter = THREE.LinearFilter;
  weaveTex.minFilter = THREE.LinearMipmapLinearFilter;
  weaveTex.generateMipmaps = true;
  weaveTex.anisotropy = 8;
  weaveTex.needsUpdate = true;
  return weaveTex;
}

// How many weave tiles fit across one unit of UV space on this mesh,
// so the thread size looks about the same on every garment.
const WEAVE_TILE = 0.03; // world units per weave tile (after scaling)
function weaveRepeat(mesh) {
  const g = mesh.geometry;
  const uv = g.attributes.uv;
  if (!uv) return 0;
  let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
  for (let i = 0; i < uv.count; i++) {
    const u = uv.getX(i), v = uv.getY(i);
    if (u < u0) u0 = u; if (u > u1) u1 = u;
    if (v < v0) v0 = v; if (v > v1) v1 = v;
  }
  const span = Math.max(u1 - u0, v1 - v0);
  if (!(span > 0)) return 0;
  if (!g.boundingBox) g.computeBoundingBox();
  const size = g.boundingBox.getSize(new THREE.Vector3());
  const scale = new THREE.Vector3();
  mesh.matrixWorld.decompose(new THREE.Vector3(), new THREE.Quaternion(), scale);
  const world = Math.max(size.x * scale.x, size.y * scale.y, size.z * scale.z);
  return Math.min(600, Math.max(4, world / span / WEAVE_TILE));
}

const isFabricMaterial = m =>
  m && m.isMeshStandardMaterial && !m.transparent && !/button|zip|metal|reflect/i.test(m.name || '');

// Gives every garment mesh in the scene a cloth surface: matte, no metal
// shine, soft reflections and a fine woven texture. Also turns on shadows.
export function FabricRig({ fabric, shadows = false }) {
  const scene = useThree(s => s.scene);
  const look = fabricLook(fabric);
  const lookRef = useRef(look);
  lookRef.current = look;
  const applied = useRef(new WeakMap());

  useFrame(() => {
    const cur = lookRef.current;
    scene.traverse(o => {
      if (!o.isMesh || o.userData.noFabric) return;
      if (shadows && !o.userData.shadowSet && o.material && !o.material.transparent) {
        o.castShadow = true;
        o.receiveShadow = true;
        o.userData.shadowSet = true;
      }
      const m = o.material;
      if (!isFabricMaterial(m)) return;
      if (applied.current.get(m) === cur) return;
      applied.current.set(m, cur);
      m.metalness = 0;
      m.roughness = cur.rough;
      m.envMapIntensity = 0.55;
      if (!m.userData.ownNormal) m.userData.ownNormal = m.normalMap ? 'yes' : 'no';
      if (m.userData.ownNormal === 'no' && o.geometry.attributes.uv) {
        if (m.userData.weaveRep === undefined) m.userData.weaveRep = weaveRepeat(o);
        const rep = m.userData.weaveRep;
        if (rep > 0) {
          if (!m.userData.weave) {
            m.userData.weave = weaveNormalMap().clone();
            m.userData.weave.needsUpdate = true;
          }
          m.userData.weave.repeat.set(rep, rep);
          m.normalMap = m.userData.weave;
          m.normalScale.set(cur.weave, cur.weave);
        }
      }
      m.needsUpdate = true;
    });
  });
  return null;
}

// Relief map for an embroidered logo: the logo shape is raised from the
// cloth (soft edges) and covered in diagonal satin-stitch threads.
function embroideryNormalMap(img, stitches) {
  const N = 256;
  const cv = document.createElement('canvas');
  cv.width = N; cv.height = N;
  const x = cv.getContext('2d', { willReadFrequently: true });
  x.drawImage(img, 0, 0, N, N);
  const px = x.getImageData(0, 0, N, N).data;
  const a = new Float32Array(N * N);
  for (let i = 0; i < N * N; i++) a[i] = px[i * 4 + 3] / 255;
  // Soften the outline so the edge reads as a rounded, padded border.
  const blur = (src, r) => {
    const tmp = new Float32Array(N * N), out = new Float32Array(N * N);
    for (let y = 0; y < N; y++) for (let i = 0; i < N; i++) {
      let s = 0, c = 0;
      for (let k = -r; k <= r; k++) { const j = i + k; if (j >= 0 && j < N) { s += src[y * N + j]; c++; } }
      tmp[y * N + i] = s / c;
    }
    for (let y = 0; y < N; y++) for (let i = 0; i < N; i++) {
      let s = 0, c = 0;
      for (let k = -r; k <= r; k++) { const j = y + k; if (j >= 0 && j < N) { s += tmp[j * N + i]; c++; } }
      out[y * N + i] = s / c;
    }
    return out;
  };
  const soft = blur(a, 3);
  // Where two thread colours meet there is a small groove between the fills.
  const lum = new Float32Array(N * N);
  for (let i = 0; i < N * N; i++) lum[i] = (0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]) / 255;
  const edge = new Float32Array(N * N);
  for (let y = 1; y < N - 1; y++) for (let i = 1; i < N - 1; i++) {
    const gx = lum[y * N + i + 1] - lum[y * N + i - 1];
    const gy = lum[(y + 1) * N + i] - lum[(y - 1) * N + i];
    edge[y * N + i] = Math.min(1, Math.hypot(gx, gy) * 2);
  }
  const groove = blur(edge, 1);
  const freq = (Math.PI * 2 * stitches) / N;
  const h = new Float32Array(N * N);
  for (let y = 0; y < N; y++) {
    for (let i = 0; i < N; i++) {
      const t = (i + y) * freq * 0.7071; // threads run at 45 degrees
      const thread = Math.pow(Math.abs(Math.sin(t)), 0.6);
      const k = y * N + i;
      h[k] = soft[k] * (0.55 + 0.45 * thread) - 0.35 * groove[k] * a[k];
    }
  }
  const data = new Uint8Array(N * N * 4);
  const at = (i, y) => h[Math.min(N - 1, Math.max(0, y)) * N + Math.min(N - 1, Math.max(0, i))];
  for (let y = 0; y < N; y++) {
    for (let i = 0; i < N; i++) {
      const dx = (at(i + 1, y) - at(i - 1, y)) * 3;
      const dy = (at(i, y - 1) - at(i, y + 1)) * 3;
      const len = Math.hypot(dx, dy, 1);
      const o = (y * N + i) * 4;
      data[o] = (-dx / len * 0.5 + 0.5) * 255;
      data[o + 1] = (-dy / len * 0.5 + 0.5) * 255;
      data[o + 2] = (1 / len * 0.5 + 0.5) * 255;
      data[o + 3] = 255;
    }
  }
  const t = new THREE.DataTexture(data, N, N, THREE.RGBAFormat);
  t.flipY = true;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

// How the logo is applied. The surface finish changes with the method.
const FINISH = {
  Embroidery: { roughness: 0.5, env: 1.0, normal: 1.0 },
  'Screen print': { roughness: 0.95, env: 0.4, normal: 0.25 },
  'Heat transfer': { roughness: 0.3, env: 1.2, normal: 0 },
  None: { roughness: 0.85, env: 0.5, normal: 0 },
};

// The customer's logo, applied onto the garment surface. It follows the
// curve of the cloth instead of floating in front of it.
// pos: { dx, dy, size, rot } in the same units as the 2D preview.
// decoration: 'Embroidery' | 'Screen print' | 'Heat transfer' | 'None'.
export function LogoDecal({ url, pos, decoration = 'None' }) {
  const tex = useTexture(url);
  const scene = useThree(s => s.scene);
  const [geo, setGeo] = useState(null);
  const rot = pos.rot || 0;

  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
  }, [tex]);

  useEffect(() => {
    let made = null;
    // Wait one frame so the garment is in place and its matrices are current.
    const raf = requestAnimationFrame(() => {
      scene.updateMatrixWorld(true);
      const rc = new THREE.Raycaster(
        new THREE.Vector3(0.35 + pos.dx * 0.012, 0.4 - pos.dy * 0.012, 5),
        new THREE.Vector3(0, 0, -1), 0, 10
      );
      const hit = rc.intersectObject(scene, true)
        .find(h => h.object.isMesh && h.face && !h.object.userData.noFabric && h.object.visible);
      if (!hit) { setGeo(null); return; }
      const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
      if (n.z < 0) n.negate();
      // Face the decal along the surface normal, upright, then apply the rotation.
      const look = new THREE.Matrix4().lookAt(hit.point.clone().add(n), hit.point, new THREE.Vector3(0, 1, 0));
      const orient = new THREE.Euler().setFromRotationMatrix(look);
      orient.z += THREE.MathUtils.degToRad(-rot);
      const img = tex.image;
      const asp = img && img.width ? img.height / img.width : 1;
      const w = pos.size * 0.01;
      try {
        made = new DecalGeometry(hit.object, hit.point, orient, new THREE.Vector3(w, w * asp, Math.max(0.25, w)));
        setGeo(made.attributes.position.count ? made : null);
      } catch (e) {
        console.warn('logo decal failed', e);
        setGeo(null);
      }
    });
    return () => { cancelAnimationFrame(raf); if (made) made.dispose(); };
  }, [tex, scene, pos.dx, pos.dy, pos.size, rot]);

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    roughness: 0.8,
    metalness: 0,
  }), []);
  useEffect(() => { mat.map = tex; mat.needsUpdate = true; }, [mat, tex]);
  useEffect(() => () => mat.dispose(), [mat]);

  // Surface finish for the chosen decoration method.
  const w = pos.size * 0.01;
  useEffect(() => {
    const f = FINISH[decoration] || FINISH.None;
    let own = null;
    mat.roughness = f.roughness;
    mat.envMapIntensity = f.env;
    mat.normalMap = null;
    if (decoration === 'Embroidery' && tex.image && tex.image.width) {
      try {
        own = embroideryNormalMap(tex.image, Math.max(12, Math.round(w / 0.006)));
        mat.normalMap = own;
      } catch (e) { console.warn('embroidery look failed', e); }
    } else if (decoration === 'Screen print') {
      // Ink sits in the weave, so the cloth texture shows through.
      own = weaveNormalMap().clone();
      own.repeat.set(Math.max(2, w / WEAVE_TILE), Math.max(2, w / WEAVE_TILE));
      own.needsUpdate = true;
      mat.normalMap = own;
    }
    if (mat.normalMap) mat.normalScale.set(f.normal, f.normal);
    mat.needsUpdate = true;
    return () => { if (own) own.dispose(); };
  }, [mat, tex, decoration, w]);

  if (!geo) return null;
  return <mesh geometry={geo} material={mat} raycast={() => null} userData={{ noFabric: true }} renderOrder={2} />;
}
