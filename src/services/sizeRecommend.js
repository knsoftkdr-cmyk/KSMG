import { SIZE_CHART } from '../data/sizeChart'

const last = SIZE_CHART.length - 1

function byHeight(h) {
  const i = SIZE_CHART.findIndex(s => h >= s.heightMin && h < s.heightMax)
  if (i >= 0) return i
  return h < SIZE_CHART[0].heightMin ? 0 : last
}

function nearest(key, value) {
  let best = 0
  SIZE_CHART.forEach((s, i) => {
    if (Math.abs(s[key] - value) < Math.abs(SIZE_CHART[best][key] - value)) best = i
  })
  return best
}

// input: { height, shoulder, hipWidth, chest (optional), fit: 'regular' | 'loose' }
export function recommendSize({ height, shoulder, hipWidth, chest, fit = 'regular' }) {
  const h = byHeight(height)
  let top = Math.max(h, nearest('shoulder', shoulder))
  let bottom = Math.max(h, nearest('hipWidth', hipWidth))

  if (chest) top = nearest('chest', chest) // customer typed chest = first priority

  if (fit === 'loose') {
    top = Math.min(top + 1, last)
    bottom = Math.min(bottom + 1, last)
  }

  return { top: SIZE_CHART[top].size, bottom: SIZE_CHART[bottom].size }
}