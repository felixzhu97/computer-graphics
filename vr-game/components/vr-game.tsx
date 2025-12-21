"use client"

import { useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, OrbitControls, Text, Float, Sparkles } from "@react-three/drei"

export default function VRGame() {
  return (
    <Canvas shadows camera={{ position: [0, 2, 8], fov: 60 }}>
      <Environment preset="sunset" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow shadow-mapSize={[2048, 2048]} />
      <GameScene />
      <OrbitControls enableZoom={true} />
    </Canvas>
  )
}

function GameScene() {
  return (
    <group position={[0, 0, 0]}>
      <Sparkles count={200} scale={10} size={2} speed={0.5} />
      <Floor />
      <WelcomeText />
      <InteractiveObjects />
      <SkyIsland position={[0, 15, -30]} scale={3} />
      <SkyIsland position={[-20, 10, -15]} scale={2} />
      <SkyIsland position={[20, 12, -20]} scale={2.5} />
    </group>
  )
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="#3a7e8c" roughness={1} />
    </mesh>
  )
}

function WelcomeText() {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1} position={[0, 2, -5]}>
      <Text fontSize={1} color="#ffffff" anchorX="center" anchorY="middle">
        欢迎来到3D世界
      </Text>
    </Float>
  )
}

function InteractiveObjects() {
  return (
    <group>
      <InteractiveSphere position={[-3, 1, -3]} color="#ff5252" />
      <InteractiveSphere position={[0, 1, -3]} color="#4caf50" />
      <InteractiveSphere position={[3, 1, -3]} color="#2196f3" />
      <InteractiveCube position={[-3, 1, 0]} color="#ff9800" />
      <InteractiveCube position={[3, 1, 0]} color="#9c27b0" />
    </group>
  )
}

function InteractiveSphere({ position, color }) {
  const [active, setActive] = useState(false)
  const ref = useRef()

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x += 0.01
      ref.current.rotation.y += 0.01

      if (active) {
        const time = state.clock.getElapsedTime()
        ref.current.position.y = position[1] + Math.sin(time * 2) * 0.5
      }
    }
  })

  return (
    <mesh
      ref={ref}
      position={position}
      castShadow
      onClick={() => setActive(!active)}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = "pointer"
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto"
      }}
    >
      <sphereGeometry args={[0.7, 32, 32]} />
      <meshStandardMaterial
        color={active ? "#ffffff" : color}
        emissive={active ? color : "black"}
        emissiveIntensity={active ? 0.5 : 0}
        roughness={0.3}
        metalness={0.8}
      />
    </mesh>
  )
}

function InteractiveCube({ position, color }) {
  const [active, setActive] = useState(false)
  const ref = useRef()

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x += 0.01
      ref.current.rotation.y += 0.01

      if (active) {
        const time = state.clock.getElapsedTime()
        ref.current.scale.x = 1 + Math.sin(time * 3) * 0.2
        ref.current.scale.y = 1 + Math.sin(time * 3) * 0.2
        ref.current.scale.z = 1 + Math.sin(time * 3) * 0.2
      }
    }
  })

  return (
    <mesh
      ref={ref}
      position={position}
      castShadow
      onClick={() => setActive(!active)}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = "pointer"
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto"
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={active ? "#ffffff" : color}
        emissive={active ? color : "black"}
        emissiveIntensity={active ? 0.5 : 0}
        roughness={0.3}
        metalness={0.8}
      />
    </mesh>
  )
}

function SkyIsland({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[2, 3, 1, 16]} />
        <meshStandardMaterial color="#8d6e63" roughness={1} />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3, 3.5, 0.2, 16]} />
        <meshStandardMaterial color="#4caf50" roughness={1} />
      </mesh>
      <Tree position={[0, 1, 0]} scale={0.8} />
      <Tree position={[1, 1, 1]} scale={0.6} />
      <Tree position={[-1, 1, -0.5]} scale={0.7} />
    </group>
  )
}

function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 1, 0]}>
        <cylinderGeometry args={[0.1, 0.2, 1, 8]} />
        <meshStandardMaterial color="#5d4037" roughness={1} />
      </mesh>
      <mesh castShadow position={[0, 2, 0]}>
        <coneGeometry args={[0.8, 2, 8]} />
        <meshStandardMaterial color="#2e7d32" roughness={1} />
      </mesh>
    </group>
  )
}
