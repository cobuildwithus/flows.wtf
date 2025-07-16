import { useEffect, useRef } from "react"
import * as THREE from "three"
import { useTheme } from "next-themes"
import type { WorkerResponse, WorkerRequest } from "./globe.worker"

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
      newPosition = newPosition * u_maxExtrusion + sine;
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
    // Point the camera toward the centre of the scene (where the globe sits)
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(sizes.width, sizes.height)
    const canvas = renderer.domElement
    containerRef.current.appendChild(canvas)

    // Create a group that will hold all globe geometry so we can rotate it each frame
    const globeGroup = new THREE.Group()
    scene.add(globeGroup)

    // Removed dynamic lighting; using flat colour on ocean sphere so no lights needed

    // Mouse interaction removed – no ray-casting or click handling needed

    // Base sphere
    const baseSphere = new THREE.SphereGeometry(19.5, 64, 64) // higher segment count for smoother edges
    const isDark = theme === "dark"
    const baseMaterial = new THREE.MeshBasicMaterial({
      // Darker shades to improve contrast against page background after lighting removal
      color: isDark ? 0x001133 : 0xb8e6ff,
      //   depthWrite: isDark,
    })
    const baseMesh = new THREE.Mesh(baseSphere, baseMaterial)
    globeGroup.add(baseMesh)
    // Apply initial rotation so we start centred roughly on the mid-Atlantic rather than North America
    globeGroup.rotation.y = INITIAL_LONGITUDE_OFFSET

    // Helper util so we avoid duplicating the expression in multiple places
    const getPointScale = () => BASE_POINT_SCALE * window.devicePixelRatio

    // Shader material (single instance for every dot)
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

    // Geometry placeholder
    const geometry = new THREE.BufferGeometry()
    const pointsMesh = new THREE.Points(geometry, material)
    globeGroup.add(pointsMesh)

    /** Pick dot count based on cores + DPR (same logic you had) */
    const chooseDotCount = () => {
      const cores = navigator.hardwareConcurrency || 4
      const dpr = window.devicePixelRatio || 1
      if (cores <= 4) return Math.floor(12000 * Math.min(dpr, 1.5))
      if (cores < 8) return Math.floor(24000 * Math.min(dpr, 2))
      return Math.floor(70000 * Math.min(dpr, 2))
    }

    /* ---------- Web Worker ---------- */
    const worker = new Worker(new URL("./globe.worker.ts", import.meta.url), { type: "module" })

    worker.postMessage({
      imgUrl: "/world_alpha_mini.jpg",
      dotCount: chooseDotCount(),
      radius: 20,
    } satisfies WorkerRequest)

    worker.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
      geometry.setAttribute("position", new THREE.BufferAttribute(data.positions, 3))
      geometry.setAttribute("aSinOffset", new THREE.BufferAttribute(data.sinArr, 1))
      geometry.setAttribute("aCosOffset", new THREE.BufferAttribute(data.cosArr, 1))
      geometry.computeBoundingSphere()
      // Now that geometry exists, start rendering if not already.
      startRendering()
    }

    const updateSize = () => {
      const offsetWidth = containerRef.current!.offsetWidth
      const offsetHeight = containerRef.current!.offsetHeight
      const rect = containerRef.current!.getBoundingClientRect()
      const scaleX = rect.width / offsetWidth
      const scaleY = rect.height / offsetHeight
      const scale = Math.min(scaleX, scaleY) // Use min to avoid distortion if non-isotropic
      // Cap at 2× to avoid expensive supersampling on very high-DPI screens
      renderer.setPixelRatio(Math.min(window.devicePixelRatio * scale, 2))
      // Update point sprite base size when pixel ratio or screen changes
      material.uniforms.u_pointScale.value = getPointScale()
      // Let Three.js handle canvas sizing properly (including style updates)
      renderer.setSize(offsetWidth, offsetHeight)
      camera.aspect = offsetWidth / offsetHeight
      camera.updateProjectionMatrix()
    }

    updateSize()
    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(containerRef.current)

    // -------------------------------
    // P4 PERFORMANCE FIXES
    // -------------------------------

    // 1. Pause the render loop when the globe is off-screen or the tab is hidden
    let animationFrameId: number | null = null
    let isInViewport = true

    const render = () => {
      const currentTime = performance.now() * 0.001 // seconds
      material.uniforms.u_timeSin.value = Math.sin(currentTime)
      material.uniforms.u_timeCos.value = Math.cos(currentTime)
      globeGroup.rotation.y += 0.002 // simple auto-rotation
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

    // Start immediately (component is initially on-screen)
    // startRendering() // This line is removed as per the edit hint.

    // Handle tab visibility change
    const visibilityHandler = () => {
      if (document.visibilityState === "hidden") {
        stopRendering()
      } else if (isInViewport) {
        startRendering()
      }
    }
    document.addEventListener("visibilitychange", visibilityHandler)

    // Observe when the globe scrolls into / out of view
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

    // Mouse interaction removed – no event listeners attached

    // Render loop
    // The render function is now managed by the P4 performance fixes

    // Cleanup
    return () => {
      // Mouse listeners were never attached, nothing to remove
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
      if (pointsMesh) {
        pointsMesh.geometry.dispose()
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
