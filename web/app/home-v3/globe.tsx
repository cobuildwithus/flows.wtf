import { useEffect, useRef } from "react"
import * as THREE from "three"
import { useTheme } from "next-themes"

interface Props {
  className?: string
}

const vertex = `
  precision mediump float;

  // Per-instance random offset so each dot twinkles at a different phase
  attribute float aOffset;

  uniform float u_time;
  uniform float u_maxExtrusion;

  varying float vPct;

  void main() {
    // Compute per-dot twinkle percentage and forward to fragment shader
    vPct = abs(sin(u_time + aOffset));

    vec3 newPosition = position;
    if (u_maxExtrusion > 1.0) {
      newPosition = newPosition * u_maxExtrusion + sin(u_time + aOffset);
    } else {
      newPosition = newPosition * u_maxExtrusion;
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    // Size of each point sprite (in screen pixels)
    gl_PointSize = 5.0;
  }
`

const fragment = `
  precision mediump float;

  varying float vPct;

  void main() {
    vec3 colorA = vec3(0.1, 0.4, 0.9);
    vec3 colorB = vec3(0.05, 0.2, 0.7);
    vec3 color = mix(colorA, colorB, vPct);

    // Make points round instead of square
    if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;

    gl_FragColor = vec4(color, 1.0);
  }
`

export default function Globe({ className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

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
    const baseSphere = new THREE.SphereGeometry(19.5, 35, 35)
    const baseMaterial = new THREE.MeshBasicMaterial({
      // Darker shades to improve contrast against page background after lighting removal
      color: theme === "dark" ? 0x001133 : 0x183064,
    })
    const baseMesh = new THREE.Mesh(baseSphere, baseMaterial)
    globeGroup.add(baseMesh)

    // Shader material (single instance for every dot)
    let twinkleTime = 0.03
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        u_time: { value: 0.0 },
        u_maxExtrusion: { value: 1.0 },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    })

    // Will hold the Points object so we can dispose it later
    let pointsMesh: THREE.Points | null = null

    // Map setup
    let activeLatLon: { [key: number]: number[] } = {}
    const dotSphereRadius = 20

    const readImageData = (imageData: Uint8ClampedArray) => {
      for (let i = 0, lon = -180, lat = 90; i < imageData.length; i += 4, lon++) {
        if (!activeLatLon[lat]) activeLatLon[lat] = []

        const red = imageData[i]
        const green = imageData[i + 1]
        const blue = imageData[i + 2]

        if (red < 80 && green < 80 && blue < 80) activeLatLon[lat].push(lon)

        if (lon === 180) {
          lon = -180
          lat--
        }
      }
    }

    const visibilityForCoordinate = (lon: number, lat: number) => {
      let visible = false
      if (!activeLatLon[lat] || !activeLatLon[lat].length) return visible

      const closest = activeLatLon[lat].reduce((prev, curr) => {
        return Math.abs(curr - lon) < Math.abs(prev - lon) ? curr : prev
      })

      if (Math.abs(lon - closest) < 0.5) visible = true
      return visible
    }

    const setDots = () => {
      // Sunflower (phyllotaxis) distribution for uniform point spacing
      const DOT_COUNT = 35000 // Adjust for desired resolution
      const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)) // ~2.39996323

      const vector = new THREE.Vector3()

      // Arrays to store per-dot data
      const positions: number[] = []
      const offsets: number[] = []

      for (let i = 0; i < DOT_COUNT; i++) {
        // Phyllotaxis spherical coordinates
        const y = 1 - (i / (DOT_COUNT - 1)) * 2 // y ∈ [1,-1]
        const radiusAtY = Math.sqrt(1 - y * y)
        const theta = GOLDEN_ANGLE * i

        // Convert to degrees for land-mask lookup
        const phi = Math.acos(y) // polar angle [0,π]
        const latDeg = 90 - (phi * 180) / Math.PI

        // Ensure longitude in [-180,180]
        const lonRad = theta % (2 * Math.PI)
        const lonDeg = (lonRad * 180) / Math.PI - 180

        // Skip ocean points early for fewer vertices
        if (!visibilityForCoordinate(lonDeg, Math.round(latDeg))) continue

        // Convert to Cartesian coordinates on sphere surface
        vector.set(
          -(dotSphereRadius * radiusAtY * Math.cos(theta)),
          dotSphereRadius * y,
          dotSphereRadius * radiusAtY * Math.sin(theta),
        )

        positions.push(vector.x, vector.y, vector.z)
        offsets.push(Math.random() * 6.28318530718) // 0-2π random phase
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
      geometry.setAttribute("aOffset", new THREE.Float32BufferAttribute(offsets, 1))

      pointsMesh = new THREE.Points(geometry, material)
      globeGroup.add(pointsMesh)
    }

    const image = new Image()
    image.src = "/world_alpha_mini.jpg"
    image.onload = () => {
      const imageCanvas = document.createElement("canvas")
      imageCanvas.width = image.width
      imageCanvas.height = image.height

      const context = imageCanvas.getContext("2d")
      if (!context) return
      context.drawImage(image, 0, 0)

      const imageData = context.getImageData(0, 0, imageCanvas.width, imageCanvas.height)
      readImageData(imageData.data)

      setDots()
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
      renderer.setSize(offsetWidth, offsetHeight, false)
      canvas.style.width = `${offsetWidth}px`
      canvas.style.height = `${offsetHeight}px`
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
      material.uniforms.u_time.value += twinkleTime
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
    startRendering()

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
