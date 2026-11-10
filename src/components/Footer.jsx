import { Link } from 'react-router-dom';
import { COMPANY } from '../data/company.js';
import { CONTENT } from '../data/content.js';
export default function Footer() {
  return (
    <footer className="foot">
      <nav className="flinks" aria-label="Footer">
        <Link to="/about">About</Link><Link to="/contact">Contact</Link>
        {Object.entries(CONTENT).map(([k, c]) => <Link key={k} to={`/${k}`}>{c.title}</Link>)}
      </nav>
      <p>{COMPANY.brand}, a brand of {COMPANY.legalName}. Phase 1 build: catalogue entries marked "Sample" are placeholders.</p>
    </footer>
  );
}
