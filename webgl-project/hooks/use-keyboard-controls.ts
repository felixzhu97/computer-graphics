"use client"

import { useState, useEffect } from "react"

export function useKeyboardControls() {
  const [keys, setKeys] = useState({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 阻止方向键滚动页面
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault()
      }

      switch (e.key) {
        case "w":
        case "W":
        case "ArrowUp":
          setKeys((keys) => ({ ...keys, moveForward: true }))
          break
        case "s":
        case "S":
        case "ArrowDown":
          setKeys((keys) => ({ ...keys, moveBackward: true }))
          break
        case "a":
        case "A":
        case "ArrowLeft":
          setKeys((keys) => ({ ...keys, moveLeft: true }))
          break
        case "d":
        case "D":
        case "ArrowRight":
          setKeys((keys) => ({ ...keys, moveRight: true }))
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case "w":
        case "W":
        case "ArrowUp":
          setKeys((keys) => ({ ...keys, moveForward: false }))
          break
        case "s":
        case "S":
        case "ArrowDown":
          setKeys((keys) => ({ ...keys, moveBackward: false }))
          break
        case "a":
        case "A":
        case "ArrowLeft":
          setKeys((keys) => ({ ...keys, moveLeft: false }))
          break
        case "d":
        case "D":
        case "ArrowRight":
          setKeys((keys) => ({ ...keys, moveRight: false }))
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  return keys
}
