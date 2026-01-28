'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Float } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

interface Background3DProps {
  theme: 'dark' | 'light' | 'neon' | 'green'
}

function RotatingBox({ theme }: { theme: string }) {
  const ref = useRef<THREE.Mesh>(null!)

  useFrame(() => {
    ref.current.rotation.x += 0.003
    ref.current.rotation.y += 0.004
  })

  const colors =
    theme === 'green'
      ? { c: '#059669', e: '#10b981' }
      : { c: '#8b5cf6', e: '#6d28d9' }

  return (
    <mesh ref={ref}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial
        color={colors.c}
        emissive={colors.e}
        emissiveIntensity={0.25}
        metalness={0.7}
        roughness={0.2}
      />
    </mesh>
  )
}

function Particles({ theme }: { theme: string }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(800 * 3)
    for (let i = 0; i < arr.length; i++) {
      arr[i] = (Math.random() - 0.5) * 25
    }
    return arr
  }, [])

  const color = theme === 'green' ? '#10b981' : '#8b5cf6'

  return (
    <points>
      <bufferGeometry
        attributes={{
          position: new THREE.BufferAttribute(positions, 3),
        }}
      />
      <pointsMaterial size={0.08} color={color} />
    </points>
  )
}

function Starfield() {
  const stars = useMemo(() => {
    const arr = new Float32Array(1000 * 3)
    for (let i = 0; i < arr.length; i++) {
      arr[i] = (Math.random() - 0.5) * 100
    }
    return arr
  }, [])

  return (
    <points position={[0, 0, -50]}>
      <bufferGeometry
        attributes={{
          position: new THREE.BufferAttribute(stars, 3),
        }}
      />
      <pointsMaterial size={0.1} color="#ffffff" />
    </points>
  )
}

export default function Background3D({ theme }: Background3DProps) {
  const bg =
    theme === 'light'
      ? '#f5f5f5'
      : theme === 'neon'
      ? '#0a0e27'
      : theme === 'green'
      ? '#0a1f1a'
      : '#0f0a1a'

  const env = theme === 'light' ? 'studio' : 'night'

  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
      <color attach="background" args={[bg]} />

      <Environment preset={env} />
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, 5]} intensity={0.4} />

      <Starfield />
      <RotatingBox theme={theme} />
      <Particles theme={theme} />

      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
    </Canvas>
  )
}
