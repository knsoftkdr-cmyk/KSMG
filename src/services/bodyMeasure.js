import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

const A4_H = 29.7 // cm (paper held in portrait)
const A4_W = 21.0 // cm

// Tune these numbers after testing with real photos
const HEIGHT_FACTOR = 1 / 0.93 // nose-to-heel is about 93% of full height
const SHOULDER_FACTOR = 1.1    // shoulder joints to shirt shoulder width
const HIP_FACTOR = 1.7         // hip joints to full hip width

let landmarker = null

async function getLandmarker() {
  if (landmarker) return landmarker
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
  )
  landmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
    },
    runningMode: 'IMAGE',
    numPoses: 1,
  })
  return landmarker
}

// imgEl: loaded <img>, ref: {x1,y1,x2,y2} = two corners of the A4 paper in image pixels
export async function measureFromImage(imgEl, ref) {
  const lm = await getLandmarker()
  const result = lm.detect(imgEl)
  const p = result.landmarks && result.landmarks[0]
  if (!p) throw new Error('We could not detect a body. Please upload a clear full-body front photo.')

  const W = imgEl.naturalWidth
  const H = imgEl.naturalHeight

  const refH = Math.abs(ref.y2 - ref.y1)
  const refW = Math.abs(ref.x2 - ref.x1)
  if (refH < 20 || refW < 20) throw new Error('The paper marking is too small. Please mark the two corners again.')
  const ratio = refH / refW
  if (ratio < 1.15 || ratio > 1.7) {
    throw new Error('The paper looks tilted or the corners are wrong. Hold the paper flat and straight, then mark again.')
  }
  const cmPerPx = (A4_H / refH + A4_W / refW) / 2

  const px = (a, b) => Math.hypot((a.x - b.x) * W, (a.y - b.y) * H)
  const heelY = Math.max(p[29].y, p[30].y)
  const noseToHeelPx = (heelY - p[0].y) * H

  const height = Math.round(noseToHeelPx * HEIGHT_FACTOR * cmPerPx)
  if (height < 120 || height > 220) {
    throw new Error('Could not read the height. Make sure the full body is visible and the paper corners are marked correctly.')
  }

  return {
    height,
    shoulder: Math.round(px(p[11], p[12]) * cmPerPx * SHOULDER_FACTOR),
    hipWidth: Math.round(px(p[23], p[24]) * cmPerPx * HIP_FACTOR),
  }
}