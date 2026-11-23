import { useEffect, useRef } from 'react';

// Real walkthrough of the KSMG production unit. Plays muted while on screen, pauses when scrolled away.
export default function CompanyVideo() {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || !('IntersectionObserver' in window)) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.4 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <section className="wrap cv">
      <div className="cv-media">
        <video
          ref={ref}
          src="/video/ksmg-company.mp4"
          poster="/video/ksmg-company-poster.jpg"
          muted loop playsInline controls preload="metadata"
          aria-label="Walkthrough of the KSMG production unit"
        />
      </div>
      <div className="cv-text">
        <span className="eyebrow">Inside KSMG</span>
        <h2>See our production unit</h2>
        <p className="cv-lead">A real look at our stitching floor, where uniform orders are cut, stitched, checked and packed by our own team.</p>
        <p>Every bulk order is made here under our supervision, so fabric, fit and finish stay consistent from the first piece to the last. Because we supply the fabric and make the garments ourselves, schools and institutions deal with one team from fabric selection to delivery.</p>
        <ol className="cv-steps">
          <li><strong>Fabric and cutting</strong><span>Fabric from our own collections is checked for shade and width, then cut to your approved size chart.</span></li>
          <li><strong>Stitching</strong><span>Skilled tailors stitch each garment on industrial machines, following the approved sample for style, pockets and trims.</span></li>
          <li><strong>Quality check</strong><span>Every piece is checked for measurements, seams, buttons and finish before it moves on.</span></li>
          <li><strong>Pressing and packing</strong><span>Garments are pressed, folded and packed size-wise, ready for distribution to students or staff.</span></li>
        </ol>
        <ul className="cv-points">
          <li>Custom logos, colours and designs for your institution</li>
          <li>Size sets for every age group and body type</li>
          <li>Repeat orders matched to your earlier shades</li>
        </ul>
      </div>
    </section>
  );
}
