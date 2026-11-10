import { Link } from 'react-router-dom';

export default function HomeSections() {
  return (
    <section className="wrap">
      <div className="hs">
        <div className="hs-block">
          <h2>Design your own uniform</h2>
          <p>Pick a garment, colour and logo and see a conceptual preview. Our team reviews every design before quoting.</p>
          <Link to="/design-studio" className="hs-link">Open Design Studio</Link>
        </div>
        <div className="hs-block">
          <h2>Export, distributors and tenders</h2>
          <p>Overseas buyers, distributors and public-sector bodies can send their details through the quote request.</p>
          <div className="hs-links">
            <Link to="/export" className="hs-link">Export &amp; Distributors</Link>
            <Link to="/tenders" className="hs-link">Government Tenders</Link>
          </div>
        </div>
      </div>
    </section>
  );
}