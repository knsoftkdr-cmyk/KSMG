import { Link } from 'react-router-dom';
import { CONTENT } from '../data/content.js';
import usePageMeta from '../hooks/usePageMeta.js';
export default function ContentPage({ slug }) {
  const c = CONTENT[slug];
  usePageMeta(c.title, c.intro);
  return (
    <>
      <div className="banner bd bd-default"><div><h1>{c.title}</h1><p>{c.intro}</p></div></div>
      <section className="wrap prose">
        {c.notice && <p className="notice">{c.notice}</p>}
        {c.sections.map(s => (
          <div key={s.h}>
            <h2>{s.h}</h2>
            {s.p && <p>{s.p}</p>}
            {s.list && <ul>{s.list.map(x => <li key={x}>{x}</li>)}</ul>}
            {s.table && <table><tbody>{s.table.map(([a, b]) => <tr key={a}><th>{a}</th><td>{b}</td></tr>)}</tbody></table>}
            {s.cta && <Link className="btn gold" to="/quote">Request a quote</Link>}
          </div>
        ))}
      </section>
    </>
  );
}
