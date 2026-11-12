import { useId } from 'react';

const SHIRT = 'M60 20 L80 12 Q100 28 120 12 L140 20 L180 55 L160 85 L142 72 L142 205 L58 205 L58 72 L40 85 L20 55 Z';

function isLight(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

export default function ShirtArt({ colour, stroke, pattern }) {
  const id = useId().replace(/:/g, '');
  const light = isLight(colour);
  const ink = light ? 'rgba(0,0,0,0.30)' : 'rgba(255,255,255,0.32)';
  const line = light ? 'rgba(0,0,0,0.28)' : 'rgba(255,255,255,0.30)';
  return (
    <g>
      <defs>
        <clipPath id={`clip-${id}`}><path d={SHIRT} /></clipPath>
        <linearGradient id={`shade-${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.28" />
          <stop offset="0.25" stopColor="#000" stopOpacity="0" />
          <stop offset="0.7" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#000" stopOpacity="0.30" />
        </linearGradient>
        <pattern id={`checks-${id}`} width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="7" fill={ink} opacity="0.55" />
          <rect width="7" height="14" fill={ink} opacity="0.55" />
        </pattern>
        <pattern id={`stripes-${id}`} width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="4" height="10" fill={ink} />
        </pattern>
      </defs>

      <path d={SHIRT} fill={colour} />
      <g clipPath={`url(#clip-${id})`}>
        {pattern === 'Checks' && <rect width="200" height="220" fill={`url(#checks-${id})`} />}
        {pattern === 'Stripes' && <rect width="200" height="220" fill={`url(#stripes-${id})`} />}
        <rect width="200" height="220" fill={`url(#shade-${id})`} />
        <path d="M64 80 Q70 120 66 165" stroke={line} strokeWidth="1.2" fill="none" />
        <path d="M136 90 Q132 130 136 170" stroke={line} strokeWidth="1.2" fill="none" />
        <path d="M58 198 H142" stroke={line} strokeWidth="1.2" />
      </g>
      <path d={SHIRT} fill="none" stroke={stroke} strokeWidth="2" />

      <path d="M80 12 L100 32 L88 44 L66 24 L60 20 Z" fill={colour} stroke={stroke} strokeWidth="1.2" />
      <path d="M120 12 L100 32 L112 44 L134 24 L140 20 Z" fill={colour} stroke={stroke} strokeWidth="1.2" />
      <path d="M100 34 V205" stroke={line} strokeWidth="1.2" />
      {[56, 86, 116, 146, 176].map(y => <circle key={y} cx="100" cy={y} r="2.2" fill={line} />)}
      <path d="M112 66 H132 V84 L122 90 L112 84 Z" fill="none" stroke={line} strokeWidth="1.2" />
    </g>
  );
}