import usePageMeta from '../hooks/usePageMeta.js';

const MODELS = [
  ['Shirt', 'eigenscene', 'https://sketchfab.com/eigenscene', ''],
  ['Pants 1', 'neutralize', 'https://sketchfab.com/neutralize', ''],
  ['Labcoat', 'Mhanimations', 'https://sketchfab.com/Mhanimations', ''],
  ['Scrubs Clothing', 'Marc Sawyer', 'https://sketchfab.com/whitewashstudio', 'top only, adapted'],
  ['Apron', 'Alexander Kurmanin', 'https://sketchfab.com/kurmanin', ''],
  ['Pink Gingham Circle Skirt', 'Digital Dressmaker', 'https://sketchfab.com/digitaldressmaker', 'adapted'],
  ['Pinafore dress for kids', 'Mariia Moskvina', 'https://sketchfab.com/mariia89', 'adapted'],
  ['Double-Breasted Formal Blazer', 'SathwikBannu', 'https://sketchfab.com/sathwik.sai24', 'adapted'],
  ['The White Coat Chef', 'restore50', 'https://sketchfab.com/restore50', 'coat only, adapted'],
  ['high_visibilty_vest_1', 'ap-school', 'https://sketchfab.com/ap-school', 'adapted'],
];

export default function Credits() {
  usePageMeta('Credits', '3D model credits for the KSMG Custom Design Studio.');
  return (
    <section className="ds">
      <div className="ds-head">
        <h1>Credits</h1>
        <p className="ds-note">
          The 3D garment previews in our Design Studio use the models below. All are licensed under{' '}
          <a href="http://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>.
        </p>
      </div>
      <ul className="ds-list">
        {MODELS.map(([title, author, url, note]) => (
          <li key={title}>
            <span>
              "{title}"{note ? ` (${note})` : ''} by{' '}
              <a href={url} target="_blank" rel="noopener noreferrer">{author}</a>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
