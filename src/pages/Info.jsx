// Placeholder text pages. Replace with REAL company details from your team.
export default function Info({ kind }) {
  const pages = {
    about: ['About us', 'Add the real company profile here: history, location, what you manufacture. Do not add certifications, clients or capacity numbers unless verified.'],
    contact: ['Contact', 'Add the real address, phone number and enquiry email here.'],
    404: ['Page not found', 'Use the menu to find what you need.'],
  };
  const [title, text] = pages[kind];
  return <section className="wrap narrow"><h1>{title}</h1><p>{text}</p></section>;
}
