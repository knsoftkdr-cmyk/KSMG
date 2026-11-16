// import { Link } from 'react-router-dom';
// import { COMPANY as DETAILS } from '../data/company.js';
// import usePageMeta from '../hooks/usePageMeta.js';

// const TBC = 'Company to confirm: this detail has not been provided yet.';

// function Row({ label, value, href }) {
//   return (
//     <div className="info-row">
//       <span className="info-label">{label}</span>
//       {value
//         ? (href ? <a href={href}>{value}</a> : <span>{value}</span>)
//         : <span className="info-tbc">{TBC}</span>}
//     </div>
//   );
// }

// export default function Info({ kind }) {

//   const META = {
//     about: ['About us', 'About Prasanna Reddy Garments, a brand of KSMG Global Private Limited.'],
//     contact: ['Contact us', 'Contact Prasanna Reddy Garments for uniform enquiries.'],
//     '404': ['Page not found', 'This page could not be found.'],
//   };
  
//   usePageMeta(...(META[kind] || META.about));
//   if (kind === '404') {
//     return (
//       <section className="wrap narrow">
//         <h1>Page not found</h1>
//         <p>Use the menu to find what you need.</p>
//       </section>
//     );
//   }

//   if (kind === 'about') {
//     return (
//       <section className="wrap narrow">
//         <h1>About us</h1>
//         <p><strong>Prasanna Reddy Garments</strong>, a brand of KSMG Global Private Limited, supplies uniforms to schools, hospitals, offices, hotels, factories and other institutions.</p>
//         {DETAILS.about
//           ? <p>{DETAILS.about}</p>
//           : <p className="info-notice">Company to confirm: the company profile (history, location, what is manufactured) has not been provided yet. No certifications, clients or capacity figures are published until they are verified.</p>}
//         <p>
//           <Link to="/industries" className="btn ghost">See industries</Link>{' '}
//           <Link to="/quote" className="btn gold">Request a quote</Link>
//         </p>
//       </section>
//     );
//   }

//   return (
//     <section className="wrap narrow">
//       <h1>Contact</h1>
//       <div className="info-card">
//         <Row label="Address" value={DETAILS.address} />
//         <Row label="Phone" value={DETAILS.phone} href={DETAILS.phone ? `tel:${DETAILS.phone.replace(/\s/g, '')}` : ''} />
//         <Row label="Email" value={DETAILS.email} href={DETAILS.email ? `mailto:${DETAILS.email}` : ''} />
//         <Row label="WhatsApp" value={DETAILS.whatsapp} />
//         <Row label="Working hours" value={DETAILS.hours} />
//       </div>
//       <p>For product and price enquiries, the quote request form is the fastest way to reach our sales team.</p>
//       <p><Link to="/quote" className="btn gold">Request a quote</Link></p>
//     </section>
//   );
// }



import { useState } from 'react';
import { Link } from 'react-router-dom';
import { COMPANY as DETAILS } from '../data/company.js';
import usePageMeta from '../hooks/usePageMeta.js';

const PHONE = '+91 98-9628 9628';
const PHONE_LINK = 'tel:+919896289628';
const EMAIL = 'info@ksmgtextiles.com';
const ADDR_BODUPPAL = 'H. No. 8-43/37/6/C, Sai Bhavani Nagar, Boduppal, Near Substation, East Balaji Hills, Medchal-Malkajgiri District, Telangana – 500039, India.';
const ADDR_KONDAPUR = 'Aditya Neeladri, 4th Cross, Block-C, Sriram Nagar, Kondapur, Hyderabad – 500084, India.';

function ContactPage() {
  const [f, setF] = useState({ name: '', email: '', phone: '', message: '' });
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const send = e => {
    e.preventDefault();
    const subject = `Enquiry from ${f.name}`;
    const body = `Name: ${f.name}\nEmail: ${f.email}\nPhone: ${f.phone}\n\n${f.message}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  return (
    <section className="wrap">
      <h1>Contact</h1>
      <div className="contact-grid">
        <form className="contact-form" onSubmit={send}>
          <h2>Send us a message</h2>
          <label>Full name<input required value={f.name} onChange={set('name')} /></label>
          <label>Email<input type="email" required value={f.email} onChange={set('email')} /></label>
          <label>Phone<input value={f.phone} onChange={set('phone')} /></label>
          <label>Message<textarea rows="5" required value={f.message} onChange={set('message')} /></label>
          <button className="btn gold">Send message</button>
        </form>
        <div className="contact-box">
          <h2>Contact information</h2>
          <div className="cb-row"><span>Phone</span><a href={PHONE_LINK}>{PHONE}</a></div>
          <div className="cb-row"><span>Email</span><a href={`mailto:${EMAIL}`}>{EMAIL}</a></div>
          <div className="cb-row"><span>Boduppal</span><p>{ADDR_BODUPPAL}</p></div>
          <div className="cb-row"><span>Kondapur</span><p>{ADDR_KONDAPUR}</p></div>
          <Link to="/quote" className="btn ghost cb-quote">Request a quote</Link>
        </div>
      </div>
    </section>
  );
}

export default function Info({ kind }) {
  const META = {
    about: ['About us', 'About Prasanna Reddy Garments, a brand of KSMG Global Private Limited.'],
    contact: ['Contact us', 'Contact Prasanna Reddy Garments for uniform enquiries.'],
    '404': ['Page not found', 'This page could not be found.'],
  };

  usePageMeta(...(META[kind] || META.about));
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

  return <ContactPage />;
}