const P = {
  schools: <><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" /><path d="M22 9v6" /></>,
  healthcare: <><path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21l8.8-8.3a5 5 0 0 0 0-7.1z" /><path d="M6 12h3l1.5-2.5 3 5 1.5-2.5h3" /></>,
  corporate: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><path d="M3 13h18" /></>,
  hospitality: <><path d="M5 17a7 7 0 0 1 14 0" /><path d="M3 17h18" /><path d="M2 20h20" /><path d="M12 10V8" /><circle cx="12" cy="7" r="1" /></>,
  industrial: <><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="6.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" /></>,
  government: <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M12 8.5l1.1 2.3 2.5.3-1.8 1.7.5 2.5-2.3-1.2-2.3 1.2.5-2.5-1.8-1.7 2.5-.3z" /></>,
  transport: <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />,
  retail: <><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.7 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 7H6" /></>,
  sports: <path d="M6 7v10M3 9.5v5M18 7v10M21 9.5v5M6 12h12" />,
  food: <><path d="M12 22V9" /><path d="M12 9c-2-.5-3.5-2-3.5-4 2 .3 3.5 1.8 3.5 4zM12 9c2-.5 3.5-2 3.5-4-2 .3-3.5 1.8-3.5 4z" /><path d="M12 15c-2-.5-3.5-2-3.5-4 2 .3 3.5 1.8 3.5 4zM12 15c2-.5 3.5-2 3.5-4-2 .3-3.5 1.8-3.5 4z" /></>,
  beauty: <><path d="M12 20c-3-2-5-5-5-9 2 0 4 1.5 5 4 1-2.5 3-4 5-4 0 4-2 7-5 9z" /><path d="M12 15c-1.5-2-1.5-6 0-9 1.5 3 1.5 7 0 9z" /></>,
  ceremonial: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" /><circle cx="17" cy="9" r="2.5" /><path d="M17 14c2.5 0 4.5 1.8 4.5 5" /></>,
  events: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /><path d="M8 14h2M14 14h2M8 17.5h2" /></>,
  facilities: <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></>,
  specialised: <><path d="M3 9l9-5 9 5" /><path d="M5 10v8M9 10v8M15 10v8M19 10v8" /><path d="M3 21h18" /></>,
};

export default function IndIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[name] || P.specialised}
    </svg>
  );
}