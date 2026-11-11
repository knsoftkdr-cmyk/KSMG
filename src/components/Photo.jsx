import { useEffect, useState } from 'react';
// Shows a photo from a web address (Supabase Storage) or a Blob, or a placeholder if none.
export default function Photo({ blob, alt }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!blob) return setUrl(null);
    if (typeof blob === 'string') return setUrl(blob);
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url ? <img src={url} alt={alt} loading="lazy" /> : <div className="ph">No photo yet</div>;
}