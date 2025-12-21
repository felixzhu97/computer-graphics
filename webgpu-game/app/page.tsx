"use client"

import { useEffect, useRef, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Volume2, VolumeX } from "lucide-react"
import GameControls from "./game-controls"
import { Button } from "@/components/ui/button"

// 游戏状态类型
type GameStateType = "playing" | "levelComplete" | "gameComplete" | "levelStarting"

export default function WebGPUGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameInstanceRef = useRef<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [isSupported, setIsSupported] = useState<boolean | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [totalLevels] = useState(3)
  const [gameState, setGameState] = useState<GameStateType>("levelStarting")
  const [collectiblesRemaining, setCollectiblesRemaining] = useState(0)
  const [debugInfo, setDebugInfo] = useState("")

  // 重置游戏实例
  const resetGameInstance = () => {
    if (gameInstanceRef.current) {
      if (gameInstanceRef.current.cleanup) {
        gameInstanceRef.current.cleanup()
      }
      gameInstanceRef.current = null
    }
  }

  // 当关卡变化时重置游戏
  useEffect(() => {
    resetGameInstance()
    setGameState("levelStarting")

    // 记录调试信息
    setDebugInfo(`Level changed to ${currentLevel}, state: levelStarting`)

    // 延迟一帧以确保状态更新
    requestAnimationFrame(() => {
      initWebGPU()
    })

    // 组件卸载时清理
    return () => {
      resetGameInstance()
    }
  }, [currentLevel])

  // 音效状态变化时更新游戏实例
  useEffect(() => {
    if (gameInstanceRef.current) {
      gameInstanceRef.current.soundEnabled = soundEnabled
    }
  }, [soundEnabled])

  const initWebGPU = async () => {
    try {
      // 检查WebGPU支持
      if (!navigator.gpu) {
        setIsSupported(false)
        setError("WebGPU is not supported in your browser. Try using Chrome 113+ or Edge 113+.")
        return
      }
      setIsSupported(true)

      const canvas = canvasRef.current
      if (!canvas) return

      // 获取WebGPU适配器
      const adapter = await navigator.gpu.requestAdapter()
      if (!adapter) {
        throw new Error("No appropriate GPUAdapter found.")
      }

      // 获取WebGPU设备
      const device = await adapter.requestDevice()

      // 配置画布
      const context = canvas.getContext("webgpu") as GPUCanvasContext
      const canvasFormat = navigator.gpu.getPreferredCanvasFormat()
      context.configure({
        device: device,
        format: canvasFormat,
        alphaMode: "premultiplied",
      })

      // 创建着色器
      const shaderModule = device.createShaderModule({
        code: `
          struct VertexOutput {
            @builtin(position) position: vec4f,
            @location(0) color: vec4f,
          }

          @vertex
          fn vertexMain(@location(0) position: vec2f,
                        @location(1) color: vec4f) -> VertexOutput {
            var output: VertexOutput;
            output.position = vec4f(position, 0.0, 1.0);
            output.color = color;
            return output;
          }

          @fragment
          fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
            return input.color;
          }
        `,
      })

      // 创建渲染管线
      const pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: {
          module: shaderModule,
          entryPoint: "vertexMain",
          buffers: [
            {
              // Position (x, y)
              arrayStride: 2 * 4, // 2 floats, 4 bytes each
              attributes: [
                {
                  shaderLocation: 0,
                  offset: 0,
                  format: "float32x2",
                },
              ],
            },
            {
              // Color (r, g, b, a)
              arrayStride: 4 * 4, // 4 floats, 4 bytes each
              attributes: [
                {
                  shaderLocation: 1,
                  offset: 0,
                  format: "float32x4",
                },
              ],
            },
          ],
        },
        fragment: {
          module: shaderModule,
          entryPoint: "fragmentMain",
          targets: [
            {
              format: canvasFormat,
            },
          ],
        },
        primitive: {
          topology: "triangle-list",
        },
      })

      // 游戏状态
      let playerX = 0
      let playerY = 0
      const playerSize = 0.1
      let playerSpeed = 0.01

      // 关卡配置
      const levelConfig = [
        { collectibles: 5, speed: 0.01 }, // Level 1
        { collectibles: 8, speed: 0.012 }, // Level 2
        { collectibles: 12, speed: 0.015 }, // Level 3
      ]

      // 根据当前关卡创建收集物
      const createCollectiblesForLevel = (level: number) => {
        const config = levelConfig[level - 1]
        const collectibles: { x: number; y: number; collected: boolean }[] = []

        for (let i = 0; i < config.collectibles; i++) {
          collectibles.push({
            x: Math.random() * 1.8 - 0.9,
            y: Math.random() * 1.8 - 0.9,
            collected: false,
          })
        }

        playerSpeed = config.speed
        setCollectiblesRemaining(config.collectibles)

        // 记录调试信息
        setDebugInfo((prev) => `${prev}\nCreated ${config.collectibles} collectibles for level ${level}`)

        return collectibles
      }

      // 初始化当前关卡的收集物
      const collectibles = createCollectiblesForLevel(currentLevel)
      let isLevelComplete = false
      let isGameComplete = false

      // 音频设置
      let audioContext: AudioContext | null = null
      let collectSound: AudioBuffer | null = null

      const setupAudio = async () => {
        try {
          audioContext = new AudioContext()

          // 创建一个简单的"收集"音效
          const collectBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate)
          const collectChannel = collectBuffer.getChannelData(0)

          // 生成一个简单的下降音调
          for (let i = 0; i < collectChannel.length; i++) {
            // 创建一个快速衰减的音调
            collectChannel[i] = Math.sin(i * 0.1) * Math.exp((-4 * i) / collectChannel.length)
          }

          collectSound = collectBuffer
          console.log("Audio setup completed successfully")
        } catch (err) {
          console.error("Error setting up audio:", err)
          // 即使音频设置失败，也允许游戏继续运行
          audioContext = null
          collectSound = null
        }
      }

      setupAudio()

      // 播放收集音效的函数
      const playCollectSound = () => {
        if (!audioContext || !collectSound || !soundEnabled) return

        try {
          const source = audioContext.createBufferSource()
          source.buffer = collectSound
          source.connect(audioContext.destination)
          source.start()
        } catch (err) {
          console.error("Error playing collect sound:", err)
        }
      }

      // 粒子系统
      interface Particle {
        x: number
        y: number
        vx: number
        vy: number
        life: number
        maxLife: number
        color: [number, number, number, number]
      }

      const particles: Particle[] = []

      const createParticles = (x: number, y: number, count: number) => {
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2
          const speed = 0.01 + Math.random() * 0.02
          particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            maxLife: 1.0,
            color: [1.0, 1.0, 0.0, 1.0], // Yellow
          })
        }
      }

      const updateParticles = () => {
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]
          p.x += p.vx
          p.y += p.vy
          p.life -= 0.02

          if (p.life <= 0) {
            particles.splice(i, 1)
          }
        }
      }

      // 键盘输入处理
      const keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        w: false,
        a: false,
        s: false,
        d: false,
        W: false,
        A: false,
        S: false,
        D: false,
        Enter: false,
      }

      const keydownHandler = (e: KeyboardEvent) => {
        if (e.key in keys) {
          keys[e.key as keyof typeof keys] = true
        }
      }

      const keyupHandler = (e: KeyboardEvent) => {
        if (e.key in keys) {
          keys[e.key as keyof typeof keys] = false
        }
      }

      window.addEventListener("keydown", keydownHandler)
      window.addEventListener("keyup", keyupHandler)

      // 设置游戏状态为正在游戏
      setGameState("playing")

      // 记录调试信息
      setDebugInfo((prev) => `${prev}\nGame started, state: playing`)

      // 游戏循环
      function gameLoop() {
        // 如果游戏实例已被清理，则停止循环
        if (!gameInstanceRef.current) {
          return
        }

        // 处理关卡完成和游戏完成
        if (isLevelComplete) {
          requestAnimationFrame(gameLoop)
          return
        } else if (isGameComplete) {
          requestAnimationFrame(gameLoop)
          return
        }

        // 更新玩家位置
        if (keys.ArrowUp || keys.w || keys.W) playerY = Math.min(playerY + playerSpeed, 1 - playerSize)
        if (keys.ArrowDown || keys.s || keys.S) playerY = Math.max(playerY - playerSpeed, -1 + playerSize)
        if (keys.ArrowLeft || keys.a || keys.A) playerX = Math.max(playerX - playerSpeed, -1 + playerSize)
        if (keys.ArrowRight || keys.d || keys.D) playerX = Math.min(playerX + playerSpeed, 1 - playerSize)

        // 检查与收集物的碰撞
        let currentScore = 0
        let remainingCollectibles = 0

        for (const collectible of collectibles) {
          if (!collectible.collected) {
            remainingCollectibles++
            const dx = Math.abs(playerX - collectible.x)
            const dy = Math.abs(playerY - collectible.y)
            if (dx < playerSize && dy < playerSize) {
              collectible.collected = true
              currentScore++

              // 播放收集音效
              playCollectSound()

              // 在收集物位置创建粒子
              createParticles(collectible.x, collectible.y, 20)
              remainingCollectibles--
            }
          }
        }

        if (currentScore > 0) {
          setScore((prevScore) => prevScore + currentScore)
          setCollectiblesRemaining((prev) => Math.max(0, prev - currentScore))
        }

        // 检查关卡是否完成
        if (remainingCollectibles === 0 && collectibles.length > 0) {
          // 记录调试信息
          setDebugInfo(
            (prev) =>
              `${prev}\nLevel ${currentLevel} completed, remaining: ${remainingCollectibles}, total: ${collectibles.length}`,
          )

          if (currentLevel < totalLevels) {
            isLevelComplete = true
            setGameState("levelComplete")
          } else {
            isGameComplete = true
            setGameState("gameComplete")
          }
        }

        // 更新粒子
        updateParticles()

        // 渲染场景
        render()
        requestAnimationFrame(gameLoop)
      }

      function render() {
        // 创建玩家顶点数据
        const playerVertices = new Float32Array([
          playerX - playerSize,
          playerY - playerSize,
          playerX + playerSize,
          playerY - playerSize,
          playerX + playerSize,
          playerY + playerSize,
          playerX - playerSize,
          playerY - playerSize,
          playerX + playerSize,
          playerY + playerSize,
          playerX - playerSize,
          playerY + playerSize,
        ])

        const playerColors = new Float32Array(6 * 4).fill(0)
        // 设置玩家颜色为蓝色 (RGBA)
        for (let i = 0; i < 6; i++) {
          playerColors[i * 4 + 2] = 1.0 // Blue
          playerColors[i * 4 + 3] = 1.0 // Alpha
        }

        // 创建收集物顶点数据
        const collectibleVertices: number[] = []
        const collectibleColors: number[] = []
        const collectibleSize = 0.05

        for (const collectible of collectibles) {
          if (!collectible.collected) {
            // 添加方形顶点 (2个三角形)
            collectibleVertices.push(
              collectible.x - collectibleSize,
              collectible.y - collectibleSize,
              collectible.x + collectibleSize,
              collectible.y - collectibleSize,
              collectible.x + collectibleSize,
              collectible.y + collectibleSize,
              collectible.x - collectibleSize,
              collectible.y - collectibleSize,
              collectible.x + collectibleSize,
              collectible.y + collectibleSize,
              collectible.x - collectibleSize,
              collectible.y + collectibleSize,
            )

            // 添加黄色 (RGBA)
            for (let i = 0; i < 6; i++) {
              collectibleColors.push(1.0, 1.0, 0.0, 1.0) // Yellow
            }
          }
        }

        // 创建粒子顶点数据
        const particleVertices: number[] = []
        const particleColors: number[] = []
        const particleSize = 0.02

        for (const particle of particles) {
          // 添加方形顶点 (2个三角形)
          particleVertices.push(
            particle.x - particleSize,
            particle.y - particleSize,
            particle.x + particleSize,
            particle.y - particleSize,
            particle.x + particleSize,
            particle.y + particleSize,
            particle.x - particleSize,
            particle.y - particleSize,
            particle.x + particleSize,
            particle.y + particleSize,
            particle.x - particleSize,
            particle.y + particleSize,
          )

          // 添加颜色，基于生命值渐变
          for (let i = 0; i < 6; i++) {
            particleColors.push(
              particle.color[0],
              particle.color[1],
              particle.color[2],
              particle.color[3] * (particle.life / particle.maxLife),
            )
          }
        }

        // 创建缓冲区
        const playerVertexBuffer = device.createBuffer({
          size: playerVertices.byteLength,
          usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        })
        device.queue.writeBuffer(playerVertexBuffer, 0, playerVertices)

        const playerColorBuffer = device.createBuffer({
          size: playerColors.byteLength,
          usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        })
        device.queue.writeBuffer(playerColorBuffer, 0, playerColors)

        let collectibleVertexBuffer = null
        let collectibleColorBuffer = null

        if (collectibleVertices.length > 0) {
          const collectibleVerticesTyped = new Float32Array(collectibleVertices)
          const collectibleColorsTyped = new Float32Array(collectibleColors)

          collectibleVertexBuffer = device.createBuffer({
            size: collectibleVerticesTyped.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
          })
          device.queue.writeBuffer(collectibleVertexBuffer, 0, collectibleVerticesTyped)

          collectibleColorBuffer = device.createBuffer({
            size: collectibleColorsTyped.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
          })
          device.queue.writeBuffer(collectibleColorBuffer, 0, collectibleColorsTyped)
        }

        let particleVertexBuffer = null
        let particleColorBuffer = null

        if (particleVertices.length > 0) {
          const particleVerticesTyped = new Float32Array(particleVertices)
          const particleColorsTyped = new Float32Array(particleColors)

          particleVertexBuffer = device.createBuffer({
            size: particleVerticesTyped.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
          })
          device.queue.writeBuffer(particleVertexBuffer, 0, particleVerticesTyped)

          particleColorBuffer = device.createBuffer({
            size: particleColorsTyped.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
          })
          device.queue.writeBuffer(particleColorBuffer, 0, particleColorsTyped)
        }

        // 创建命令编码器
        const commandEncoder = device.createCommandEncoder()
        const textureView = context.getCurrentTexture().createView()

        const renderPass = commandEncoder.beginRenderPass({
          colorAttachments: [
            {
              view: textureView,
              clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 },
              loadOp: "clear",
              storeOp: "store",
            },
          ],
        })

        renderPass.setPipeline(pipeline)

        // 绘制玩家
        renderPass.setVertexBuffer(0, playerVertexBuffer)
        renderPass.setVertexBuffer(1, playerColorBuffer)
        renderPass.draw(6) // 6个顶点，2个三角形

        // 绘制收集物
        if (collectibleVertexBuffer && collectibleColorBuffer) {
          renderPass.setVertexBuffer(0, collectibleVertexBuffer)
          renderPass.setVertexBuffer(1, collectibleColorBuffer)
          renderPass.draw(collectibleVertices.length / 2) // 每个收集物6个顶点
        }

        // 绘制粒子
        if (particleVertexBuffer && particleColorBuffer) {
          renderPass.setVertexBuffer(0, particleVertexBuffer)
          renderPass.setVertexBuffer(1, particleColorBuffer)
          renderPass.draw(particleVertices.length / 2)
        }

        renderPass.end()
        device.queue.submit([commandEncoder.finish()])
      }

      // 清理函数
      const cleanup = () => {
        window.removeEventListener("keydown", keydownHandler)
        window.removeEventListener("keyup", keyupHandler)
        if (audioContext) {
          audioContext.close()
        }
      }

      // 保存游戏实例引用
      gameInstanceRef.current = {
        collectibles,
        soundEnabled,
        cleanup,
      }

      // 开始游戏循环
      requestAnimationFrame(gameLoop)
    } catch (err) {
      console.error(err)
      setError(`Error initializing WebGPU: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
  }

  const handleNextLevel = () => {
    if (currentLevel < totalLevels) {
      setCurrentLevel(currentLevel + 1)
    }
  }

  const handleRestartGame = () => {
    setCurrentLevel(1)
    setScore(0)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <h1 className="text-3xl font-bold text-white mb-4">WebGPU 收集游戏</h1>

      {error && (
        <Alert variant="destructive" className="mb-4 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isSupported === false && (
        <div className="text-white mb-4 max-w-md text-center">
          <p>请尝试使用 Chrome 113+ 或 Edge 113+ 浏览器来运行此游戏。</p>
        </div>
      )}

      <div className="relative bg-black rounded-lg overflow-hidden shadow-xl">
        <canvas ref={canvasRef} width={800} height={600} className="border border-gray-700 rounded-lg" />

        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full">分数: {score}</div>

        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full">
          关卡: {currentLevel}/{totalLevels}
        </div>

        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full">
          剩余宝石: {collectiblesRemaining}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="absolute bottom-4 right-4 bg-black/70 text-white hover:bg-black/90"
          onClick={toggleSound}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>

        {gameState === "levelStarting" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="bg-gray-800 p-6 rounded-lg text-center">
              <h2 className="text-2xl font-bold text-white mb-2">关卡 {currentLevel}</h2>
              <p className="text-gray-300 mb-4">准备开始！</p>
              <Button onClick={() => setGameState("playing")}>开始游戏</Button>
            </div>
          </div>
        )}

        {gameState === "levelComplete" && currentLevel < totalLevels && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="bg-gray-800 p-6 rounded-lg text-center">
              <h2 className="text-2xl font-bold text-white mb-2">关卡 {currentLevel} 完成!</h2>
              <p className="text-gray-300 mb-4">当前分数: {score}</p>
              <Button onClick={handleNextLevel}>进入下一关</Button>
            </div>
          </div>
        )}

        {gameState === "gameComplete" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="bg-gray-800 p-6 rounded-lg text-center">
              <h2 className="text-2xl font-bold text-white mb-2">恭喜!</h2>
              <p className="text-gray-300 mb-2">你完成了所有关卡!</p>
              <p className="text-gray-300 mb-4">最终分数: {score}</p>
              <Button onClick={handleRestartGame}>重新开始</Button>
            </div>
          </div>
        )}
      </div>

      <GameControls soundEnabled={soundEnabled} toggleSound={toggleSound} />

      {/* 调试信息，可以在生产环境中移除 */}
      {/*
      <div className="mt-4 p-2 bg-gray-800 text-xs text-gray-300 rounded w-full max-w-md overflow-auto max-h-32">
        <pre>{debugInfo}</pre>
      </div>
      */}
    </div>
  )
}
