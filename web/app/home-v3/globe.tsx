import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { useTheme } from "next-themes"
import gsap from "gsap"

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
    gl_PointSize = 7.0;
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

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(sizes.width, sizes.height)
    const canvas = renderer.domElement
    containerRef.current.appendChild(canvas)

    const controls = new OrbitControls(camera, canvas)
    controls.autoRotate = true
    controls.autoRotateSpeed = -1.2
    controls.enableDamping = true
    controls.enableRotate = true
    controls.enablePan = false
    controls.enableZoom = false
    controls.minPolarAngle = Math.PI / 2 - 0.5
    controls.maxPolarAngle = Math.PI / 2 + 0.5

    const pointLight = new THREE.PointLight(0x1a4d80, 20, 200)
    pointLight.position.set(-50, 0, 60)
    scene.add(pointLight)
    scene.add(new THREE.HemisphereLight(0x87ceeb, 0x0066cc, 2))

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    let isIntersecting = false
    let mouseDown = false
    let minMouseDownFlag = false
    let grabbing = false

    // Base sphere
    const baseSphere = new THREE.SphereGeometry(19.5, 35, 35)
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: theme === "dark" ? 0x001a33 : 0x2e5c8a,
    })
    const baseMesh = new THREE.Mesh(baseSphere, baseMaterial)
    scene.add(baseMesh)

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

    const calcPosFromLatLonRad = (lon: number, lat: number) => {
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lon + 180) * (Math.PI / 180)

      const x = -(dotSphereRadius * Math.sin(phi) * Math.cos(theta))
      const z = dotSphereRadius * Math.sin(phi) * Math.sin(theta)
      const y = dotSphereRadius * Math.cos(phi)

      return new THREE.Vector3(x, y, z)
    }

    const setDots = () => {
      const dotDensity = 2.5
      const vector = new THREE.Vector3()

      // Arrays to store per-dot data
      const positions: number[] = []
      const offsets: number[] = []

      for (let lat = 90; lat > -90; lat--) {
        const radius = Math.cos(Math.abs(lat) * (Math.PI / 180)) * dotSphereRadius
        const circumference = radius * Math.PI * 2
        const dotsForLat = circumference * dotDensity

        for (let x = 0; x < dotsForLat; x++) {
          const lon = -180 + (x * 360) / dotsForLat
          if (!visibilityForCoordinate(lon, lat)) continue

          vector.copy(calcPosFromLatLonRad(lon, lat))
          positions.push(vector.x, vector.y, vector.z)
          offsets.push(Math.random() * 6.28318530718) // 0-2π random phase
        }
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
      geometry.setAttribute("aOffset", new THREE.Float32BufferAttribute(offsets, 1))

      pointsMesh = new THREE.Points(geometry, material)
      scene.add(pointsMesh)
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
      renderer.setPixelRatio(Math.min(window.devicePixelRatio * scale, 4))
      renderer.setSize(offsetWidth, offsetHeight, false)
      canvas.style.width = `${offsetWidth}px`
      canvas.style.height = `${offsetHeight}px`
      camera.aspect = offsetWidth / offsetHeight
      camera.updateProjectionMatrix()
    }
    updateSize()
    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(containerRef.current)

    // Event handlers
    const mousemove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      isIntersecting = false

      raycaster.setFromCamera(mouse, camera)

      const intersects = raycaster.intersectObject(baseMesh)
      if (intersects[0]) {
        isIntersecting = true
        if (!grabbing) document.body.style.cursor = "pointer"
      } else {
        if (!grabbing) document.body.style.cursor = "default"
      }
    }

    const mousedown = () => {
      if (!isIntersecting) return

      gsap.to(material.uniforms.u_maxExtrusion, { value: 1.07 })

      mouseDown = true
      minMouseDownFlag = false

      setTimeout(() => {
        minMouseDownFlag = true
        if (!mouseDown) mouseup()
      }, 500)

      document.body.style.cursor = "grabbing"
      grabbing = true
    }

    const mouseup = () => {
      mouseDown = false
      if (!minMouseDownFlag) return

      gsap.to(material.uniforms.u_maxExtrusion, { value: 1.0, duration: 0.15 })

      grabbing = false
      document.body.style.cursor = isIntersecting ? "pointer" : "default"
    }

    const mouseleave = () => {
      document.body.style.cursor = "default"
      grabbing = false
    }

    canvas.addEventListener("mousemove", mousemove)
    canvas.addEventListener("mousedown", mousedown)
    canvas.addEventListener("mouseup", mouseup)
    canvas.addEventListener("mouseleave", mouseleave)

    // Render loop
    const render = () => {
      material.uniforms.u_time.value += twinkleTime

      controls.update()
      renderer.render(scene, camera)
      requestAnimationFrame(render)
    }
    render()

    // Cleanup
    return () => {
      canvas.removeEventListener("mousemove", mousemove)
      canvas.removeEventListener("mousedown", mousedown)
      canvas.removeEventListener("mouseup", mouseup)
      canvas.removeEventListener("mouseleave", mouseleave)
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
