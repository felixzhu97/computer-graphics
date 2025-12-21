"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  Text,
  Float,
  Sparkles,
} from "@react-three/drei";
import { Vector3, MathUtils } from "three";
import { useSpring, animated, config } from "@react-spring/three";
import { GameUI } from "./game-ui";

// Target cube that player needs to click
function Target({
  position,
  color,
  index,
  count,
  onHit,
  difficulty,
  isGameActive,
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [hit, setHit] = useState(false);

  // Calculate a unique animation offset based on index
  const offset = useMemo(
    () =>
      new Vector3(
        Math.sin((index / count) * Math.PI * 2) * 3,
        Math.cos((index / count) * Math.PI * 2) * 3,
        Math.sin((index / count) * Math.PI * 4) * 2
      ),
    [index, count]
  );

  // Spring animation for hover and hit effects
  const { scale, rotation, positionZ } = useSpring({
    scale: hit ? 0.001 : hovered ? 1.4 : 1,
    rotation: hit ? [0, Math.PI * 4, 0] : [0, 0, 0],
    positionZ: hit ? offset.z - 5 : offset.z,
    config: hit ? config.wobbly : config.gentle,
  });

  // Animation loop
  useFrame((state, delta) => {
    if (!meshRef.current || !isGameActive || hit) return;

    // Rotate the target
    meshRef.current.rotation.x += delta * 0.2 * difficulty;
    meshRef.current.rotation.y += delta * 0.3 * difficulty;

    // Make it move in a more complex pattern based on difficulty
    const time = state.clock.getElapsedTime();
    const speedFactor = 0.5 + difficulty * 0.2;

    const targetX = offset.x + Math.sin(time * speedFactor + index) * 2;
    const targetY = offset.y + Math.cos(time * speedFactor + index * 0.5) * 2;

    meshRef.current.position.x = MathUtils.lerp(
      meshRef.current.position.x,
      targetX,
      0.05 * difficulty
    );
    meshRef.current.position.y = MathUtils.lerp(
      meshRef.current.position.y,
      targetY,
      0.05 * difficulty
    );
  });

  const handleClick = () => {
    if (!hit && isGameActive) {
      setHit(true);
      onHit(10 * difficulty); // Higher score for higher difficulty

      // Add hit effect at the current position
      const position = new Vector3(
        meshRef.current.position.x,
        meshRef.current.position.y,
        meshRef.current.position.z
      );
    }
  };

  // If hit, don't render the mesh
  if (hit) return null;

  return (
    <animated.mesh
      ref={meshRef}
      position={position}
      scale={scale}
      rotation={rotation}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={hovered ? "#ff9500" : color}
        metalness={0.8}
        roughness={0.2}
        emissive={hovered ? "#ff4000" : "#000000"}
        emissiveIntensity={hovered ? 0.5 : 0}
      />
    </animated.mesh>
  );
}

// Explosion effect when target is hit
function HitEffect({ position, color }) {
  const particles = useRef();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useFrame((state, delta) => {
    if (particles.current) {
      particles.current.rotation.x += delta * 0.5;
      particles.current.rotation.y += delta * 0.5;
    }
  });

  if (!visible) return null;

  return (
    <group position={position}>
      <Sparkles count={20} scale={[3, 3, 3]} size={2} speed={1} color={color} />
    </group>
  );
}

// Game title floating in the background
function GameTitle() {
  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={1}
      position={[0, 4, -5]}
    >
      <Text fontSize={1.5} color="#ffffff" anchorX="center" anchorY="middle">
        TARGET SHOOTER
      </Text>
    </Float>
  );
}

export default function ThreeScene() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState("notStarted"); // notStarted, playing, gameOver
  const [difficulty, setDifficulty] = useState(1);
  const [hitEffects, setHitEffects] = useState([]);

  const targetCount = 10;
  const colors = useMemo(() => {
    return Array.from(
      { length: targetCount },
      () => `hsl(${Math.random() * 360}, 80%, 60%)`
    );
  }, [targetCount]);

  // Handle game timer
  useEffect(() => {
    let timer;
    if (gameState === "playing") {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameState("gameOver");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState]);

  // Increase difficulty over time
  useEffect(() => {
    if (gameState === "playing" && timeLeft % 15 === 0 && timeLeft < 60) {
      setDifficulty((prev) => Math.min(prev + 0.5, 3));
    }
  }, [timeLeft, gameState]);

  const handleTargetHit = (points) => {
    setScore((prev) => prev + points);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setDifficulty(1);
    setGameState("playing");
    setHitEffects([]);
  };

  return (
    <div className="w-full h-full relative">
      <GameUI
        score={score}
        timeLeft={timeLeft}
        gameState={gameState}
        startGame={startGame}
      />

      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={60} />
        <color attach="background" args={["#050505"]} />

        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        {/* Game targets */}
        {Array.from({ length: targetCount }).map((_, i) => (
          <Target
            key={i}
            position={[0, 0, 0]}
            color={colors[i]}
            index={i}
            count={targetCount}
            onHit={handleTargetHit}
            difficulty={difficulty}
            isGameActive={gameState === "playing"}
          />
        ))}

        {/* Hit effects */}
        {hitEffects.map((effect, i) => (
          <HitEffect key={i} position={effect.position} color={effect.color} />
        ))}

        {/* Game title */}
        <GameTitle />

        {/* Background particles */}
        <Sparkles count={200} scale={15} size={2} speed={0.3} color="#ffffff" />

        <Environment preset="night" />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={gameState !== "playing"}
          autoRotateSpeed={0.5}
          minDistance={10}
          maxDistance={20}
          enableRotate={gameState !== "playing"}
        />
      </Canvas>
    </div>
  );
}
