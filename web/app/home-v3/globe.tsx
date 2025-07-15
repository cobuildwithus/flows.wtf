import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { useTheme } from "next-themes"
import gsap from "gsap"

interface Props {
  className?: string
}

const vertex = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  uniform float u_time;
  uniform float u_maxExtrusion;

  void main() {
    vec3 newPosition = position;
    if(u_maxExtrusion > 1.0) newPosition.xyz = newPosition.xyz * u_maxExtrusion + sin(u_time);
    else newPosition.xyz = newPosition.xyz * u_maxExtrusion;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
  }
`

const fragment = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  uniform float u_time;

  vec3 colorA = vec3(0.1, 0.4, 0.9);
  vec3 colorB = vec3(0.05, 0.2, 0.7);

  void main() {
    vec3 color = vec3(0.0);
    float pct = abs(sin(u_time));
    color = mix(colorA, colorB, pct);

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
    containerRef.current.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
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

    // Shader material
    let twinkleTime = 0.03
    const materials: THREE.ShaderMaterial[] = []
    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        u_time: { value: 1.0 },
        u_maxExtrusion: { value: 1.0 },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    })

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

    const createMaterial = (timeValue: number) => {
      const mat = material.clone()
      mat.uniforms.u_time.value = timeValue * Math.sin(Math.random())
      materials.push(mat)
      return mat
    }

    const setDots = () => {
      const dotDensity = 2.5
      const vector = new THREE.Vector3()

      for (let lat = 90, i = 0; lat > -90; lat--, i++) {
        const radius = Math.cos(Math.abs(lat) * (Math.PI / 180)) * dotSphereRadius
        const circumference = radius * Math.PI * 2
        const dotsForLat = circumference * dotDensity

        for (let x = 0; x < dotsForLat; x++) {
          const long = -180 + (x * 360) / dotsForLat

          if (!visibilityForCoordinate(long, lat)) continue

          vector.copy(calcPosFromLatLonRad(long, lat))

          const dotGeometry = new THREE.CircleGeometry(0.1, 5)
          dotGeometry.lookAt(vector)
          dotGeometry.translate(vector.x, vector.y, vector.z)

          const m = createMaterial(i)
          const mesh = new THREE.Mesh(dotGeometry, m)
          scene.add(mesh)
        }
      }
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

    // Event handlers
    const resize = () => {
      sizes.width = containerRef.current!.offsetWidth
      sizes.height = containerRef.current!.offsetHeight

      const distance = sizes.width > 700 ? 100 : 140
      camera.position.set(
        0,
        distance * Math.cos(initialPolarAngle),
        distance * Math.sin(initialPolarAngle),
      )
      camera.aspect = sizes.width / sizes.height
      camera.updateProjectionMatrix()

      renderer.setSize(sizes.width, sizes.height)
    }

    const mousemove = (event: MouseEvent) => {
      isIntersecting = false

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

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

      materials.forEach((el) => {
        gsap.to(el.uniforms.u_maxExtrusion, { value: 1.07 })
      })

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

      materials.forEach((el) => {
        gsap.to(el.uniforms.u_maxExtrusion, { value: 1.0, duration: 0.15 })
      })

      grabbing = false
      document.body.style.cursor = isIntersecting ? "pointer" : "default"
    }

    window.addEventListener("resize", resize)
    window.addEventListener("mousemove", mousemove)
    window.addEventListener("mousedown", mousedown)
    window.addEventListener("mouseup", mouseup)

    // Render loop
    const render = () => {
      materials.forEach((el) => {
        el.uniforms.u_time.value += twinkleTime
      })

      controls.update()
      renderer.render(scene, camera)
      requestAnimationFrame(render)
    }
    render()

    // Cleanup
    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", mousemove)
      window.removeEventListener("mousedown", mousedown)
      window.removeEventListener("mouseup", mouseup)

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }

      renderer.dispose()
      baseSphere.dispose()
      baseMaterial.dispose()
      materials.forEach((mat) => mat.dispose())
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
