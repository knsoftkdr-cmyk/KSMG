import { Link } from 'react-router-dom';
import { COMPANY as DETAILS } from '../data/company.js';

const TBC = 'Company to confirm: this detail has not been provided yet.';

function Row({ label, value, href }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      {value
        ? (href ? <a href={href}>{value}</a> : <span>{value}</span>)
        : <span className="info-tbc">{TBC}</span>}
    </div>
  );
}

export default function Info({ kind }) {
  if (kind === '404') {
    return (
      <section className="wrap narrow">
        <h1>Page not found</h1>
        <p>Use the menu to find what you need.</p>
      </section>
    );
  }

  if (kind === 'about') {
    return (
      <section className="wrap narrow">
        <h1>About us</h1>
        <p><strong>Prasanna Reddy Garments</strong>, a brand of KSMG Global Private Limited, supplies uniforms to schools, hospitals, offices, hotels, factories and other institutions.</p>
        {DETAILS.about
          ? <p>{DETAILS.about}</p>
          : <p className="info-notice">Company to confirm: the company profile (history, location, what is manufactured) has not been provided yet. No certifications, clients or capacity figures are published until they are verified.</p>}
        <p>
          <Link to="/industries" className="btn ghost">See industries</Link>{' '}
          <Link to="/quote" className="btn gold">Request a quote</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="wrap narrow">
      <h1>Contact</h1>
      <div className="info-card">
        <Row label="Address" value={DETAILS.address} />
        <Row label="Phone" value={DETAILS.phone} href={DETAILS.phone ? `tel:${DETAILS.phone.replace(/\s/g, '')}` : ''} />
        <Row label="Email" value={DETAILS.email} href={DETAILS.email ? `mailto:${DETAILS.email}` : ''} />
        <Row label="WhatsApp" value={DETAILS.whatsapp} />
        <Row label="Working hours" value={DETAILS.hours} />
      </div>
      <p>For product and price enquiries, the quote request form is the fastest way to reach our sales team.</p>
      <p><Link to="/quote" className="btn gold">Request a quote</Link></p>
    </section>
  );
}