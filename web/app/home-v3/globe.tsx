import { useEffect, useRef } from "react"
import * as THREE from "three"
import { useTheme } from "next-themes"

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
      const DOT_COUNT = 70000 // Adjust for desired resolution
      const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)) // ~2.39996323

      const vector = new THREE.Vector3()

      // Arrays to store per-dot data
      // Pre-allocate typed arrays to avoid repeated reallocations
      const positionsArray: number[] = []
      const sinOffsets: number[] = []
      const cosOffsets: number[] = []

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

        positionsArray.push(vector.x, vector.y, vector.z)
        const randPhase = Math.random() * 6.28318530718 // 0-2π
        sinOffsets.push(Math.sin(randPhase))
        cosOffsets.push(Math.cos(randPhase))
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positionsArray, 3))
      geometry.setAttribute("aSinOffset", new THREE.Float32BufferAttribute(sinOffsets, 1))
      geometry.setAttribute("aCosOffset", new THREE.Float32BufferAttribute(cosOffsets, 1))

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
      // Update point sprite base size when pixel ratio or screen changes
      material.uniforms.u_pointScale.value = getPointScale()
      // The third parameter 'false' prevents renderer.setSize from updating the canvas style
      // which is what we want since the canvas already scales via CSS
      renderer.setSize(offsetWidth, offsetHeight, false)
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
