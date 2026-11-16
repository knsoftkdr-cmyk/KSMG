import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Link } from 'react-router-dom';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, RoundedBox, ContactShadows } from '@react-three/drei';
import usePageMeta from '../hooks/usePageMeta.js';

const COLOURS = [
  ['Navy', '#0a1330'], ['White', '#ffffff'], ['Sky blue', '#7fb2e5'], ['Grey', '#8b8f98'],
  ['Maroon', '#7a1f2b'], ['Green', '#1f6b4a'], ['Black', '#1a1a1a'], ['Khaki', '#b8a77a'],
];

function Shirt({ colour }) {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.44, 1.0);
    s.lineTo(-0.22, 1.09);
    s.quadraticCurveTo(0, 0.8, 0.22, 1.09);
    s.lineTo(0.44, 1.0);
    s.lineTo(0.89, 0.61);
    s.lineTo(0.67, 0.28);
    s.lineTo(0.47, 0.42);
    s.lineTo(0.47, -1.06);
    s.lineTo(-0.47, -1.06);
    s.lineTo(-0.47, 0.42);
    s.lineTo(-0.67, 0.28);
    s.lineTo(-0.89, 0.61);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.26, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 5, curveSegments: 14 });
    g.translate(0, 0, -0.13);
    return g;
  }, []);
  const mat = { color: colour, roughness: 0.85, metalness: 0 };
  const buttons = [0.55, 0.2, -0.15, -0.5, -0.85];
  return (
    <group position={[0, 0.05, 0]}>
      <mesh geometry={geo}><meshStandardMaterial {...mat} /></mesh>
      <RoundedBox args={[0.3, 0.2, 0.1]} radius={0.04} smoothness={4} position={[-0.15, 1.0, 0.2]} rotation={[0, 0, 0.55]}><meshStandardMaterial {...mat} /></RoundedBox>
      <RoundedBox args={[0.3, 0.2, 0.1]} radius={0.04} smoothness={4} position={[0.15, 1.0, 0.2]} rotation={[0, 0, -0.55]}><meshStandardMaterial {...mat} /></RoundedBox>
      <RoundedBox args={[0.13, 1.85, 0.03]} radius={0.01} smoothness={2} position={[0, -0.05, 0.2]}><meshStandardMaterial {...mat} /></RoundedBox>
      <RoundedBox args={[0.3, 0.32, 0.03]} radius={0.02} smoothness={2} position={[0.22, 0.38, 0.2]}><meshStandardMaterial {...mat} /></RoundedBox>
      {buttons.map(y => (
        <mesh key={y} position={[0, y, 0.225]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.03, 16]} />
          <meshStandardMaterial color="#e9e6dc" roughness={0.4} />
        </mesh>
      ))}
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

export default function DesignStudio3D() {
  usePageMeta('3D Design Studio', 'Rotate, zoom and colour a 3D garment preview.');
  const [colour, setColour] = useState(COLOURS[0][1]);
  const [view, setView] = useState('front');
  const controls = useRef();
  const colourName = (COLOURS.find(c => c[1] === colour) || ['Custom'])[0];

  return (
    <section className="ds">
      <div className="ds-head">
        <h1>3D Design Studio</h1>
        <p className="ds-note"><strong>Preview version.</strong> Drag to rotate, scroll to zoom. <Link to="/design-studio">Back to the classic studio</Link></p>
      </div>
      <div className="ds-grid">
        <div className="ds-form">
          <div className="ds-field">
            <span>Colour: {colourName}</span>
            <div className="ds-swatches">
              {COLOURS.map(([n, c]) => (
                <button key={n} type="button" title={n} aria-label={n} className={colour === c ? 'sw on' : 'sw'} style={{ background: c }} onClick={() => setColour(c)} />
              ))}
            </div>
          </div>
          <div className="ds-field">
            <span>View</span>
            <div className="rfq-actions">
              {['front', 'back', 'side'].map(v => (
                <button key={v} type="button" className={view === v ? 'btn gold' : 'btn ghost'} onClick={() => setView(v)}>{v[0].toUpperCase() + v.slice(1)}</button>
              ))}
            </div>
          </div>
        </div>
                <div className="ds-preview" style={{ height: 480 }}>
          <Canvas camera={{ position: [0, 0.3, 6], fov: 40 }} dpr={[1, 2]}>
            <hemisphereLight args={['#ffffff', '#9aa3c0', 1.1]} />
            <ambientLight intensity={0.9} />
            <directionalLight position={[4, 6, 5]} intensity={1.6} />
            <directionalLight position={[-4, 3, 4]} intensity={0.9} />
            <directionalLight position={[0, 3, -6]} intensity={0.8} />
            <Shirt colour={colour} />
            <ContactShadows position={[0, -1.2, 0]} opacity={0.35} scale={8} blur={2.5} far={3} />
            <OrbitControls ref={controls} enablePan={false} minDistance={3} maxDistance={10} />
            <CameraRig view={view} controls={controls} />
          </Canvas>
        </div>
      </div>
    </section>
  );
}