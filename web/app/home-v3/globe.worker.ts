// components/globe.worker.ts
/* eslint-disable no-restricted-globals */
export interface WorkerRequest {
  imgUrl: string
  dotCount: number
  radius: number
}

export interface WorkerResponse {
  positions: Float32Array // length = n*3
  sinArr: Float32Array // length = n
  cosArr: Float32Array // length = n
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
const TWO_PI = Math.PI * 2
const RAD2DEG = 180 / Math.PI

/**
 * Build a boolean raster (360 × 180) from the mask image.
 * land[y * 360 + x] == 1  means "this lat/lon is land".
 */
async function buildRaster(imgUrl: string): Promise<Uint8Array | null> {
  const blob = await fetch(imgUrl).then((r) => r.blob())
  const bmp = await createImageBitmap(blob)
  let off
  try {
    off = new OffscreenCanvas(bmp.width, bmp.height)
  } catch (e) {
    return null
  }
  const ctx = off.getContext("2d")!
  ctx.drawImage(bmp, 0, 0)
  const { data, width, height } = ctx.getImageData(0, 0, bmp.width, bmp.height)

  const raster = new Uint8Array(360 * 180) // 64 kB
  for (let y = 0; y < 180; y++) {
    for (let x = 0; x < 360; x++) {
      // Map each 2°×2° cell to one pixel in source image
      const sx = Math.floor((x / 360) * width)
      const sy = Math.floor((y / 180) * height)
      const idx = (sy * width + sx) << 2 // RGBA stride
      const r = data[idx] // land ≈ dark pixel
      raster[y * 360 + x] = r < 80 ? 1 : 0
    }
  }
  return raster
}

function buildDots(raster: Uint8Array, dotCount: number, radius: number) {
  const positions = new Float32Array(dotCount * 3)
  const sinArr = new Float32Array(dotCount)
  const cosArr = new Float32Array(dotCount)

  let n = 0
  for (let i = 0; i < dotCount; i++) {
    const y = 1 - (i / (dotCount - 1)) * 2 // [-1,1]
    const rAt = Math.sqrt(1 - y * y)
    const th = GOLDEN_ANGLE * i

    const lat = Math.asin(y) * RAD2DEG // [-90,90]
    const lon = (th % TWO_PI) * RAD2DEG - 180 // [-180,180]

    //   lat index 0…179  ,  lon index 0…359
    const latIdx = Math.min(179, Math.max(0, Math.round(90 - lat)))
    const lonIdx = Math.min(359, Math.max(0, Math.round(lon + 180)))
    if (!raster[latIdx * 360 + lonIdx]) continue

    const cosT = Math.cos(th)
    const sinT = Math.sin(th)

    positions[n * 3] = -radius * rAt * cosT
    positions[n * 3 + 1] = radius * y
    positions[n * 3 + 2] = radius * rAt * sinT

    const phase = Math.random() * TWO_PI
    sinArr[n] = Math.sin(phase)
    cosArr[n] = Math.cos(phase)
    n++
  }

  // Trim typed arrays to actual size
  return {
    positions: positions.slice(0, n * 3),
    sinArr: sinArr.slice(0, n),
    cosArr: cosArr.slice(0, n),
  }
}

// ---------- worker entry ----------
self.onmessage = async (
  e: MessageEvent<WorkerRequest | { raster: Uint8Array; dotCount: number; radius: number }>,
) => {
  if ("raster" in e.data) {
    const { raster, dotCount, radius } = e.data
    const result = buildDots(raster, dotCount, radius)
    const payload: WorkerResponse = result
    ;(self as any).postMessage(payload, [
      result.positions.buffer,
      result.sinArr.buffer,
      result.cosArr.buffer,
    ])
  } else {
    const { imgUrl, dotCount, radius } = e.data
    const raster = await buildRaster(imgUrl)
    if (!raster) {
      ;(self as any).postMessage({ status: "no_offscreen" })
      return
    }
    const result = buildDots(raster, dotCount, radius)
    const payload: WorkerResponse = result
    ;(self as any).postMessage(payload, [
      result.positions.buffer,
      result.sinArr.buffer,
      result.cosArr.buffer,
    ])
  }
}

export {}
