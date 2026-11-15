import { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import Settings from './Settings.jsx';
import { COMPANY } from '../data/company.js';
import { INDUSTRIES } from '../data/industries.js';
import { useAuth } from '../services/auth.jsx';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, role } = useAuth();
  const [mega, setMega] = useState(false);
  const [megaP, setMegaP] = useState(false);
  
  const close = () => { setOpen(false); setMega(false); setMegaP(false); };
  const navigate = useNavigate();
  const location = useLocation();
  const goIndustries = (e) => {
    e.preventDefault();
    const scroll = () => document.getElementById('industries')?.scrollIntoView({ behavior: 'smooth' });
    if (location.pathname === '/') scroll();
    else { navigate('/'); setTimeout(scroll, 400); }
  };
  return (
    <header className="nav">
      <Link to="/" className="brand" onClick={close}><img src="/images/ksmg-logo.png" alt="KSMG Global Private Limited" /></Link>
      <button className="menu" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'}</button>
      <nav className={open ? 'open' : ''} onClick={close}>
        <NavLink to="/" end>Home</NavLink>
        <div className={mega ? 'mega open' : 'mega'}>
          <Link to="/" onClick={goIndustries}>Industries</Link>
          <button
            type="button"
            className="mega-toggle"
            aria-expanded={mega}
            aria-label="Show industries list"
            onClick={e => { e.stopPropagation(); setMega(!mega); }}
          >{mega ? '−' : '+'}</button>
          <div className="mega-panel">
            <div className="mega-grid">
              {INDUSTRIES.map(i => (
                <Link key={i.slug} to={`/industries/${i.slug}`}>{i.name}</Link>
              ))}
            </div>
            <Link to="/industries" className="mega-all">View all industries</Link>
          </div>
        </div>
                <div className={megaP ? 'mega open' : 'mega'}>
          <NavLink to="/products">Products</NavLink>
          <button
            type="button"
            className="mega-toggle"
            aria-expanded={megaP}
            aria-label="Show products list"
            onClick={e => { e.stopPropagation(); setMegaP(!megaP); }}
          >{megaP ? '−' : '+'}</button>
          <div className="mega-panel">
            <div className="mega-grid">
              {INDUSTRIES.map(i => (
                <Link key={i.slug} to={`/industries/${i.slug}`}>{i.name}</Link>
              ))}
            </div>
            <Link to="/products" className="mega-all">View all products</Link>
          </div>
        </div>
        <NavLink to="/design-studio">Design Studio</NavLink>
        {/* <NavLink to="/about">About</NavLink> */}
        <NavLink to="/contact">Contact</NavLink>
        {['product_manager', 'super_admin'].includes(role) && <NavLink to="/admin/add-product">Add product</NavLink>}
        {['sales', 'super_admin'].includes(role) && <NavLink to="/admin/enquiries">Enquiries</NavLink>}
        {['sales', 'super_admin'].includes(role) && <NavLink to="/admin/dashboard">Dashboard</NavLink>}
        {role === 'super_admin' && <NavLink to="/admin/staff">Staff</NavLink>}
        {user && <NavLink to="/my-requests">My requests</NavLink>}
        <NavLink to="/login">{user ? 'Account' : 'Log in'}</NavLink>
        <Link to="/quote" className="btn gold">Request a quote</Link>
        <Settings />
      </nav>
    </header>
  );
}