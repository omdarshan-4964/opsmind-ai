import { useEffect, useRef } from 'react'
import * as THREE from 'three'

type Theme = 'dark' | 'light' | 'green' | 'neon'

export default function DimensionalSection({ theme }: { theme: Theme }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight || 400 // SAFETY

    /* ---------- Scene ---------- */
    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100)
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace

    container.appendChild(renderer.domElement)

    /* ---------- Theme ---------- */
    const themeColor =
      theme === 'green'
        ? '#10b981'
        : theme === 'light'
        ? '#60a5fa'
        : theme === 'neon'
        ? '#ff00ff'
        : '#8b5cf6'

    /* ---------- Cubes ---------- */
    const cubes: THREE.Mesh[] = []
    const positions = [
      [-2, 0],
      [0, 0],
      [2, 0],
      [-1, 1.5],
      [1, 1.5],
    ]

    positions.forEach(([x, y]) => {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.6, 0.6),
        new THREE.MeshStandardMaterial({
          color: themeColor,
          emissive: themeColor,
          emissiveIntensity: 0.35,
          metalness: 0.7,
          roughness: 0.2,
        })
      )

      cube.position.set(x, y, Math.random() - 0.5)

      cube.userData = {
        vx: (Math.random() - 0.5) * 0.015,
        vy: (Math.random() - 0.5) * 0.015,
        vz: (Math.random() - 0.5) * 0.015,
        rx: Math.random() * 0.01,
        ry: Math.random() * 0.01,
      }

      scene.add(cube)
      cubes.push(cube)
    })

    /* ---------- Lights ---------- */
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))

    const keyLight = new THREE.PointLight(themeColor, 1)
    keyLight.position.set(5, 5, 5)
    scene.add(keyLight)

    const fillLight = new THREE.PointLight(0x00ffff, 0.6)
    fillLight.position.set(-5, -5, 5)
    scene.add(fillLight)

    /* ---------- Animation ---------- */
    let running = true

    const animate = () => {
      if (!running) return
      requestAnimationFrame(animate)

      cubes.forEach((cube) => {
        cube.position.x += cube.userData.vx
        cube.position.y += cube.userData.vy
        cube.position.z += cube.userData.vz

        cube.rotation.x += cube.userData.rx
        cube.rotation.y += cube.userData.ry

        if (Math.abs(cube.position.x) > 2.5) cube.userData.vx *= -1
        if (Math.abs(cube.position.y) > 2) cube.userData.vy *= -1
        if (Math.abs(cube.position.z) > 2) cube.userData.vz *= -1
      })

      renderer.render(scene, camera)
    }

    animate()

    /* ---------- Resize ---------- */
    const onResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight || 400
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', onResize)

    /* ---------- Cleanup ---------- */
    return () => {
      running = false
      window.removeEventListener('resize', onResize)

      cubes.forEach((cube) => {
        cube.geometry.dispose()
        ;(cube.material as THREE.Material).dispose()
        scene.remove(cube)
      })

      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [theme])

  return (
    <div className="dimensional-section">
      <div className="dimensional-label">Explore Dimensions</div>
      <div ref={containerRef} className="dimensional-canvas" />
    </div>
  )
}
