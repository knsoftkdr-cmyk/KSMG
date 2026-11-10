import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import Settings from './Settings.jsx';
import { COMPANY } from '../data/company.js';
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="nav">
      <Link to="/" className="brand" onClick={close}>{COMPANY.brand}<small>KSMG Global</small></Link>
      <button className="menu" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'}</button>
      <nav className={open ? 'open' : ''} onClick={close}>
        <NavLink to="/industries">Industries</NavLink>
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contact">Contact</NavLink>
        <NavLink to="/admin/add-product">Add product</NavLink>
        <NavLink to="/admin/enquiries">Enquiries</NavLink>
        <Link to="/quote" className="btn gold">Request a quote</Link>
        <Settings />
      </nav>
    </header>
  );
}
