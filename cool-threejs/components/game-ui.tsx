"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trophy, Clock, Star, Award } from "lucide-react"

export function GameUI({ score, timeLeft, gameState, startGame }) {
  const [highScore, setHighScore] = useState(0)
  const [showInstructions, setShowInstructions] = useState(true)

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem("targetShooterHighScore")
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore))
    }
  }, [])

  // Update high score if current score is higher
  useEffect(() => {
    if (gameState === "gameOver" && score > highScore) {
      setHighScore(score)
      localStorage.setItem("targetShooterHighScore", score.toString())
    }
  }, [gameState, score, highScore])

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-4 z-10">
      {/* Top HUD - Score and Timer */}
      {gameState === "playing" && (
        <div className="w-full flex justify-between items-center">
          <Card className="bg-black/50 backdrop-blur-sm text-white p-3 flex items-center gap-2">
            <Trophy className="text-yellow-400" />
            <span className="text-xl font-bold">{score}</span>
          </Card>

          <Card
            className={`bg-black/50 backdrop-blur-sm text-white p-3 flex items-center gap-2 ${timeLeft <= 10 ? "animate-pulse text-red-500" : ""}`}
          >
            <Clock className={timeLeft <= 10 ? "text-red-500" : "text-blue-400"} />
            <span className="text-xl font-bold">{formatTime(timeLeft)}</span>
          </Card>
        </div>
      )}

      {/* Game start screen */}
      {gameState === "notStarted" && (
        <Card className="bg-black/70 backdrop-blur-md text-white p-6 max-w-md mx-auto my-auto pointer-events-auto">
          <h1 className="text-3xl font-bold text-center mb-4">TARGET SHOOTER</h1>

          {showInstructions ? (
            <>
              <div className="mb-6 space-y-4">
                <p className="text-center">Click on the colorful cubes to score points before time runs out!</p>
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-400" />
                  <p>Faster moving targets = more points</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="text-blue-400" />
                  <p>You have 60 seconds to get the highest score</p>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="text-purple-400" />
                  <p>Difficulty increases every 15 seconds</p>
                </div>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={() => setShowInstructions(false)}
              >
                Continue
              </Button>
            </>
          ) : (
            <>
              {highScore > 0 && (
                <div className="mb-4 text-center">
                  <p className="text-sm text-gray-300">High Score</p>
                  <p className="text-2xl font-bold text-yellow-400">{highScore}</p>
                </div>
              )}
              <Button
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-lg py-6"
                onClick={startGame}
              >
                Start Game
              </Button>
            </>
          )}
        </Card>
      )}

      {/* Game over screen */}
      {gameState === "gameOver" && (
        <Card className="bg-black/70 backdrop-blur-md text-white p-6 max-w-md mx-auto my-auto pointer-events-auto">
          <h1 className="text-3xl font-bold text-center mb-2">GAME OVER</h1>

          <div className="flex justify-center items-center gap-8 my-6">
            <div className="text-center">
              <p className="text-sm text-gray-300">Your Score</p>
              <p className="text-3xl font-bold text-white">{score}</p>
            </div>

            {score >= highScore && (
              <div className="text-center animate-pulse">
                <p className="text-sm text-yellow-300">New High Score!</p>
                <p className="text-3xl font-bold text-yellow-400">{score}</p>
              </div>
            )}

            {score < highScore && (
              <div className="text-center">
                <p className="text-sm text-gray-300">High Score</p>
                <p className="text-3xl font-bold text-yellow-400">{highScore}</p>
              </div>
            )}
          </div>

          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            onClick={startGame}
          >
            Play Again
          </Button>
        </Card>
      )}
    </div>
  )
}
