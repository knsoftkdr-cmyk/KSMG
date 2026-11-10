import { useEffect, useState } from 'react';
// Shows a photo stored as a Blob in IndexedDB, or a placeholder if none.
export default function Photo({ blob, alt }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!blob) return setUrl(null);
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url ? <img src={url} alt={alt} /> : <div className="ph">No photo yet</div>;
}
