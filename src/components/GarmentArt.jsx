import { useId } from 'react';
import { garmentSvg } from '../data/garmentArt.js';

export default function GarmentArt({ garment, colour, stroke, pattern }) {
  const id = useId().replace(/:/g, '');
  const html = garmentSvg(garment, { colour, stroke, pattern, id });
  return <g dangerouslySetInnerHTML={{ __html: html }} />;
}