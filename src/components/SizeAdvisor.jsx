import { useRef, useState } from 'react'
import { measureFromImage } from '../services/bodyMeasure'
import { recommendSize } from '../services/sizeRecommend'

export default function SizeAdvisor() {
  const imgRef = useRef(null)
  const [photoUrl, setPhotoUrl] = useState('')
  const [dims, setDims] = useState({ w: 1, h: 1 })
  const [pts, setPts] = useState([])
  const [height, setHeight] = useState('')
  const [chest, setChest] = useState('')
  const [fit, setFit] = useState('regular')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  function onPhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setPhotoUrl(URL.createObjectURL(file))
    setPts([])
    setResult(null)
    setError('')
  }

  function onPhotoClick(e) {
    if (pts.length >= 2) return
    const img = imgRef.current
    const r = img.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * img.naturalWidth
    const y = ((e.clientY - r.top) / r.height) * img.naturalHeight
    setPts([...pts, { x, y }])
    setResult(null)
    setError('')
  }

  async function onCalculate() {
    setError('')
    setResult(null)
    if (!photoUrl) return setError('Please upload a photo first.')
    if (pts.length < 2) return setError('Please mark the two corners of the A4 paper on the photo.')
    const typed = Number(height)
    if (height && (typed < 120 || typed > 220)) return setError('Please enter a height between 120 and 220 cm, or leave it empty.')
    setBusy(true)
    try {
      const ref = { x1: pts[0].x, y1: pts[0].y, x2: pts[1].x, y2: pts[1].y }
      const m = await measureFromImage(imgRef.current, ref)
      const h = typed || m.height
      const rec = recommendSize({
        height: h,
        shoulder: m.shoulder,
        hipWidth: m.hipWidth,
        chest: chest ? Number(chest) : undefined,
        fit,
      })
      setResult({ ...m, ...rec, usedHeight: h })
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    }
    setBusy(false)
  }

  const pct = (v, total) => `${(v / total) * 100}%`
  const hint =
    pts.length === 0 ? 'Tap the TOP-LEFT corner of the paper.'
    : pts.length === 1 ? 'Now tap the BOTTOM-RIGHT corner of the paper.'
    : 'Paper marked.'

  return (
    <div className="sa">
      <h3>Size Advisor</h3>
      <p style={{ fontSize: 13 }}>
        Hold an A4 sheet flat against your chest (portrait, facing the camera) and take a
        full-body front photo, standing straight with shoes. Your photo stays in your browser
        and is not uploaded to our server.
      </p>

      <label>
        Photo: <input type="file" accept="image/*" onChange={onPhoto} />
      </label>

      {photoUrl && (
        <>
          <p style={{ fontSize: 13, textAlign: 'center' }}><b>{hint}</b></p>
          <div className="sa-wrap" onClick={onPhotoClick}>
            <img
              ref={imgRef}
              src={photoUrl}
              alt="Your photo"
              className="sa-photo"
              onLoad={e => setDims({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
            />
            {pts.length === 2 && (
              <div
                className="sa-rect"
                style={{
                  left: pct(Math.min(pts[0].x, pts[1].x), dims.w),
                  top: pct(Math.min(pts[0].y, pts[1].y), dims.h),
                  width: pct(Math.abs(pts[1].x - pts[0].x), dims.w),
                  height: pct(Math.abs(pts[1].y - pts[0].y), dims.h),
                }}
              />
            )}
            {pts.map((pt, i) => (
              <span key={i} className="sa-dot" style={{ left: pct(pt.x, dims.w), top: pct(pt.y, dims.h) }} />
            ))}
          </div>
          {pts.length > 0 && (
            <button type="button" className="btn ghost" onClick={() => { setPts([]); setResult(null) }}>
              Mark again
            </button>
          )}
        </>
      )}

      <label>
        Height (cm, optional):
        <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="Leave empty to read from the photo" />
      </label>

      <label>
        Chest (cm, optional):
        <input type="number" value={chest} onChange={e => setChest(e.target.value)} />
      </label>

      <label>
        Fit:
        <select value={fit} onChange={e => setFit(e.target.value)}>
          <option value="regular">Regular</option>
          <option value="loose">Loose</option>
        </select>
      </label>

      <button type="button" className="btn gold" onClick={onCalculate} disabled={busy}>
        {busy ? 'Calculating...' : 'Recommend my size'}
      </button>

      {error && <p className="sa-error">{error}</p>}

      {result && (
        <div className="sa-result">
          <p>
            <b>Shirt size: {result.top}</b> | <b>Pant size: {result.bottom}</b> (approx)
          </p>
          <p style={{ fontSize: 13 }}>
            Height ~{result.usedHeight} cm{height ? '' : ' (from photo)'}, Shoulder ~{result.shoulder} cm,
            Hip ~{result.hipWidth} cm. This is an estimate from your photo, not an exact measurement.
            You can change the size in the order section.
          </p>
        </div>
      )}
    </div>
  )
}