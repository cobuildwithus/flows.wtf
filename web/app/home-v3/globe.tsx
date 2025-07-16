import { useEffect, useRef } from "react"
import * as THREE from "three"
import { useTheme } from "next-themes"
import type { WorkerResponse, WorkerRequest } from "./globe.worker"
import { Clock } from "three"

interface Props {
  className?: string
}

// Vertex shader – variable point size & pre-computed sin(time)
const vertex = `
  precision mediump float;

  // Pre-computed per-instance values so we avoid sin()/cos() every frame
  attribute float aSinOffset;
  attribute float aCosOffset;

  uniform float u_timeSin;
  uniform float u_timeCos;
  uniform float u_maxExtrusion;
  uniform float u_pointScale;

  varying float vPct;

  void main() {
    // sin(x + y) = sinx * cosy + cosx * siny
    float sine = u_timeSin * aCosOffset + u_timeCos * aSinOffset;

    vPct = abs(sine);

    vec3 newPosition = position;
    if (u_maxExtrusion > 1.0) {
      newPosition = newPosition * u_maxExtrusion;
      vec3 direction = normalize(newPosition);
      newPosition += direction * sine;
    } else {
      newPosition = newPosition * u_maxExtrusion;
    }

    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    // Point size scales with distance and device pixel ratio (passed via u_pointScale)
    gl_PointSize = u_pointScale * (1.0 / -mvPosition.z);
  }
`

const fragment = `
  precision mediump float;

  uniform float u_isDark;
  varying float vPct;

  void main() {
    vec3 colorA, colorB;
    
    if (u_isDark > 0.5) {
      // Dark mode colors (unchanged)
      colorA = vec3(0.1, 0.4, 0.9);
      colorB = vec3(0.05, 0.2, 0.7);
    } else {
      // Light mode colors (lighter blue)
      colorA = vec3(0.4, 0.7, 1.0);
      colorB = vec3(0.3, 0.6, 0.95);
    }
    
    vec3 color = mix(colorA, colorB, vPct);

    // Make points round instead of square
    if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;

    gl_FragColor = vec4(color, 1.0);
  }
`

// Base pixel size for point sprites (will be multiplied by devicePixelRatio)
const BASE_POINT_SCALE = 125.0

// Positive values rotate the globe eastward (degrees converted to radians)
const INITIAL_LONGITUDE_OFFSET = -Math.PI / 3

export default function Globe({ className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme: theme } = useTheme()

  useEffect(() => {
    if (!containerRef.current) return

    const sizes = {
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight,
    }

    const scene = new THREE.Scene()

    const initialPolarAngle = Math.PI / 2 - 0.5 // Tilt towards north by ~29 degrees

    const camera = new THREE.PerspectiveCamera(30, sizes.width / sizes.height, 1, 1000)
    const distance = sizes.width > 700 ? 100 : 140
    camera.position.set(
      0,
      distance * Math.cos(initialPolarAngle),
      distance * Math.sin(initialPolarAngle),
    )
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(sizes.width, sizes.height)
    const canvas = renderer.domElement
    containerRef.current.appendChild(canvas)

    const globeGroup = new THREE.Group()
    scene.add(globeGroup)

    const baseSphere = new THREE.SphereGeometry(19.5, 64, 64)
    const isDark = theme === "dark"
    const baseMaterial = new THREE.MeshBasicMaterial({
      color: isDark ? 0x001133 : 0xb8e6ff,
    })
    const baseMesh = new THREE.Mesh(baseSphere, baseMaterial)
    globeGroup.add(baseMesh)
    globeGroup.rotation.y = INITIAL_LONGITUDE_OFFSET

    const getPointScale = () => BASE_POINT_SCALE * window.devicePixelRatio

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        u_timeSin: { value: 0.0 },
        u_timeCos: { value: 1.0 },
        u_maxExtrusion: { value: 1.0 },
        u_pointScale: { value: getPointScale() },
        u_isDark: { value: isDark ? 1.0 : 0.0 },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    })

    const geometry = new THREE.BufferGeometry()
    const pointsMesh = new THREE.Points(geometry, material)
    globeGroup.add(pointsMesh)

    const chooseDotCount = () => {
      const dpr = window.devicePixelRatio || 1
      const base = window.innerWidth < 768 ? 24000 : 70000
      return Math.floor(base * Math.min(dpr, 2))
    }

    const worker = new Worker(new URL("./globe.worker.ts", import.meta.url), { type: "module" })

    const imgUrl = window.location.origin + "/world_alpha_mini.jpg"
    const dotCount = chooseDotCount()
    const radius = 20
    worker.postMessage({ imgUrl, dotCount, radius } satisfies WorkerRequest)

    const buildRasterMain = async (imgUrl: string): Promise<Uint8Array | null> => {
      const blob = await fetch(imgUrl).then((r) => r.blob())
      const bmp = await createImageBitmap(blob)
      const off = document.createElement("canvas")
      off.width = bmp.width
      off.height = bmp.height
      const ctx = off.getContext("2d")
      if (!ctx) return null
      ctx.drawImage(bmp, 0, 0)
      const { data, width, height } = ctx.getImageData(0, 0, bmp.width, bmp.height)

      const raster = new Uint8Array(360 * 180)
      for (let y = 0; y < 180; y++) {
        for (let x = 0; x < 360; x++) {
          const sx = Math.floor((x / 360) * width)
          const sy = Math.floor((y / 180) * height)
          const idx = (sy * width + sx) << 2
          const r = data[idx]
          raster[y * 360 + x] = r < 80 ? 1 : 0
        }
      }
      return raster
    }

    worker.onmessage = ({ data }: MessageEvent<WorkerResponse | { status: string }>) => {
      if ("status" in data) {
        if (data.status === "no_offscreen") {
          buildRasterMain(imgUrl).then((raster) => {
            if (raster) {
              worker.postMessage({ raster, dotCount, radius })
            } else {
              console.error("Failed to build raster in main thread")
            }
          })
        } else {
          console.error("Unknown status from worker:", data.status)
        }
      } else {
        geometry.setAttribute("position", new THREE.BufferAttribute(data.positions, 3))
        geometry.setAttribute("aSinOffset", new THREE.BufferAttribute(data.sinArr, 1))
        geometry.setAttribute("aCosOffset", new THREE.BufferAttribute(data.cosArr, 1))
        geometry.computeBoundingSphere()
        startRendering()
      }
    }

    const updateSize = () => {
      const offsetWidth = containerRef.current!.offsetWidth
      const offsetHeight = containerRef.current!.offsetHeight
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      material.uniforms.u_pointScale.value = getPointScale()
      renderer.setSize(offsetWidth, offsetHeight)
      camera.aspect = offsetWidth / offsetHeight
      camera.updateProjectionMatrix()
    }

    updateSize()
    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(containerRef.current)

    let animationFrameId: number | null = null
    let isInViewport = true

    const clock = new Clock()
    let elapsed = 0

    const render = () => {
      const delta = clock.getDelta()
      elapsed += delta
      material.uniforms.u_timeSin.value = Math.sin(elapsed)
      material.uniforms.u_timeCos.value = Math.cos(elapsed)
      globeGroup.rotation.y += 0.0012
      renderer.render(scene, camera)
      animationFrameId = requestAnimationFrame(render)
    }

    const startRendering = () => {
      if (animationFrameId === null) animationFrameId = requestAnimationFrame(render)
    }

    const stopRendering = () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
    }

    const visibilityHandler = () => {
      if (document.visibilityState === "hidden") {
        stopRendering()
      } else if (isInViewport) {
        clock.start()
        elapsed = 0
        startRendering()
      }
    }
    document.addEventListener("visibilitychange", visibilityHandler)

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === containerRef.current) {
            isInViewport = entry.isIntersecting
            if (isInViewport && document.visibilityState === "visible") {
              startRendering()
            } else {
              stopRendering()
            }
          }
        })
      },
      { threshold: 0.1 },
    )
    intersectionObserver.observe(containerRef.current)

    return () => {
      document.removeEventListener("visibilitychange", visibilityHandler)
      intersectionObserver.disconnect()
      stopRendering()
      resizeObserver.disconnect()
      worker.terminate()

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }

      renderer.dispose()
      baseSphere.dispose()
      baseMaterial.dispose()
      material.dispose()
      globeGroup.remove(pointsMesh)
      if (geometry) {
        geometry.dispose()
      }
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          if (object.material instanceof THREE.Material) object.material.dispose()
        }
      })
    }
  }, [theme])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  )
}
