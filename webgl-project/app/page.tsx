"use client"

import { Suspense, useRef, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { PerspectiveCamera, Environment, useGLTF, Stars, Html } from "@react-three/drei"
import type { Mesh, Group } from "three"
import { Button } from "@/components/ui/button"
import { useKeyboardControls } from "@/hooks/use-keyboard-controls"

// 游戏状态
export type GameState = "ready" | "playing" | "gameover"

export default function Home() {
  const [gameState, setGameState] = useState<GameState>("ready")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)

  // 开始游戏
  const startGame = () => {
    setGameState("playing")
    setScore(0)
    setTimeLeft(60)
  }

  // 游戏结束
  const endGame = () => {
    setGameState("gameover")
  }

  // 计时器
  useEffect(() => {
    if (gameState !== "playing") return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  return (
    <div className="w-full h-screen bg-black relative">
      {/* 游戏UI */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center">
        <div className="text-white text-xl font-bold">得分: {score}</div>
        <div className="text-white text-xl font-bold">时间: {timeLeft}秒</div>
      </div>

      {/* 游戏开始界面 */}
      {gameState === "ready" && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="bg-black/80 p-8 rounded-lg border border-white/20 text-center max-w-md">
            <h1 className="text-3xl font-bold text-white mb-4">鸭子冒险</h1>
            <p className="text-white mb-6">控制鸭子收集星星，避开障碍物。在时间结束前尽可能获得高分！</p>
            <p className="text-white mb-6">使用 W, A, S, D 或方向键移动鸭子</p>
            <Button onClick={startGame} className="w-full">
              开始游戏
            </Button>
          </div>
        </div>
      )}

      {/* 游戏结束界面 */}
      {gameState === "gameover" && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="bg-black/80 p-8 rounded-lg border border-white/20 text-center max-w-md">
            <h1 className="text-3xl font-bold text-white mb-4">游戏结束</h1>
            <p className="text-white mb-2">你的得分: {score}</p>
            <Button onClick={startGame} className="w-full mt-4">
              再玩一次
            </Button>
          </div>
        </div>
      )}

      {/* 3D场景 */}
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 15, 20]} />
          <Environment preset="night" />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} />

          {gameState === "playing" && (
            <GameScene onCollectStar={() => setScore((prev) => prev + 10)} onHitObstacle={endGame} />
          )}

          {/* 地面 */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial color="#111" />
          </mesh>

          {/* 光照 */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 10]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

function GameScene({ onCollectStar, onHitObstacle }) {
  const playerRef = useRef<Group>(null)

  // Initialize stars and obstacles directly instead of in useEffect
  const [stars, setStars] = useState(() =>
    Array(10)
      .fill(0)
      .map(() => ({
        position: [Math.random() * 40 - 20, 0.5, Math.random() * 40 - 20],
        visible: true,
        id: Math.random().toString(),
      })),
  )

  const [obstacles, setObstacles] = useState(() =>
    Array(5)
      .fill(0)
      .map(() => ({
        position: [Math.random() * 40 - 20, 1, Math.random() * 40 - 20],
        id: Math.random().toString(),
      })),
  )

  // 键盘控制
  const { moveForward, moveBackward, moveLeft, moveRight } = useKeyboardControls()

  // 游戏循环
  useFrame((state, delta) => {
    if (!playerRef.current) return

    // 移动玩家
    const speed = 10 * delta
    const player = playerRef.current

    if (moveForward) player.position.z -= speed
    if (moveBackward) player.position.z += speed
    if (moveLeft) player.position.x -= speed
    if (moveRight) player.position.x += speed

    // 限制玩家在场景范围内
    player.position.x = Math.max(-20, Math.min(20, player.position.x))
    player.position.z = Math.max(-20, Math.min(20, player.position.z))

    // 检测与星星的碰撞
    stars.forEach((star, index) => {
      if (!star.visible) return

      const starPos = {
        x: star.position[0],
        y: star.position[1],
        z: star.position[2],
      }

      const distance = Math.sqrt(
        Math.pow(player.position.x - starPos.x, 2) + Math.pow(player.position.z - starPos.z, 2),
      )

      if (distance < 1.5) {
        // Update star visibility
        setStars((prev) => prev.map((s, i) => (i === index ? { ...s, visible: false } : s)))

        onCollectStar()

        // 3秒后重新生成星星
        setTimeout(() => {
          setStars((prev) =>
            prev.map((s, i) =>
              i === index
                ? {
                    ...s,
                    visible: true,
                    position: [Math.random() * 40 - 20, 0.5, Math.random() * 40 - 20],
                  }
                : s,
            ),
          )
        }, 3000)
      }
    })

    // 检测与障碍物的碰撞
    obstacles.forEach((obstacle) => {
      const obstaclePos = {
        x: obstacle.position[0],
        y: obstacle.position[1],
        z: obstacle.position[2],
      }

      const distance = Math.sqrt(
        Math.pow(player.position.x - obstaclePos.x, 2) + Math.pow(player.position.z - obstaclePos.z, 2),
      )

      if (distance < 1.5) {
        onHitObstacle()
      }
    })

    // 相机跟随玩家
    state.camera.position.x = player.position.x
    state.camera.position.z = player.position.z + 15
    state.camera.lookAt(player.position)
  })

  // 加载鸭子模型
  const { scene } = useGLTF("/assets/3d/duck.glb")

  return (
    <>
      {/* 玩家 */}
      <group ref={playerRef} position={[0, 0, 0]}>
        {scene && <primitive object={scene.clone()} scale={[0.8, 0.8, 0.8]} rotation={[0, Math.PI, 0]} castShadow />}
      </group>

      {/* 星星 */}
      {stars.map((star) => star.visible && <Star key={star.id} position={star.position} />)}

      {/* 障碍物 */}
      {obstacles.map((obstacle) => (
        <Obstacle key={obstacle.id} position={obstacle.position} />
      ))}

      {/* 游戏说明 */}
      <Html position={[0, 10, -15]}>
        <div className="bg-black/70 p-2 rounded text-white text-center w-64">
          <p>使用 W, A, S, D 或方向键移动鸭子</p>
          <p>收集星星 ⭐ 获得分数</p>
          <p>避开红色障碍物 🔴</p>
        </div>
      </Html>
    </>
  )
}

// 星星组件
function Star({ position }) {
  const ref = useRef<Mesh>(null)

  useFrame((state, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2
  })

  return (
    <mesh ref={ref} position={[position[0], position[1], position[2]]} castShadow>
      <tetrahedronGeometry args={[0.5, 1]} />
      <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
    </mesh>
  )
}

// 障碍物组件
function Obstacle({ position }) {
  const ref = useRef<Mesh>(null)

  useFrame((state, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * 2
  })

  return (
    <mesh ref={ref} position={[position[0], position[1], position[2]]} castShadow>
      <boxGeometry args={[1.5, 2, 1.5]} />
      <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={0.3} />
    </mesh>
  )
}
