"use client"

import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Volume2, VolumeX } from "lucide-react"

interface GameControlsProps {
  soundEnabled: boolean
  toggleSound: () => void
}

export default function GameControls({ soundEnabled, toggleSound }: GameControlsProps) {
  return (
    <div className="mt-6 text-white">
      <h2 className="text-xl font-semibold mb-2 text-center">游戏控制</h2>
      <div className="flex flex-col items-center gap-2">
        <p className="mb-2">使用方向键或WASD键移动蓝色方块收集黄色宝石</p>

        <div className="grid grid-cols-3 gap-2 mt-2">
          <div></div>
          <div className="flex flex-col items-center">
            <Button variant="outline" className="aspect-square p-2 flex items-center justify-center">
              <ArrowUp className="h-6 w-6" />
            </Button>
            <span className="text-xs mt-1">↑ / W</span>
          </div>
          <div></div>

          <div className="flex flex-col items-center">
            <Button variant="outline" className="aspect-square p-2 flex items-center justify-center">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <span className="text-xs mt-1">← / A</span>
          </div>
          <div className="flex flex-col items-center">
            <Button variant="outline" className="aspect-square p-2 flex items-center justify-center">
              <ArrowDown className="h-6 w-6" />
            </Button>
            <span className="text-xs mt-1">↓ / S</span>
          </div>
          <div className="flex flex-col items-center">
            <Button variant="outline" className="aspect-square p-2 flex items-center justify-center">
              <ArrowRight className="h-6 w-6" />
            </Button>
            <span className="text-xs mt-1">→ / D</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={toggleSound}>
            {soundEnabled ? (
              <>
                <Volume2 className="h-4 w-4" />
                <span>音效开启</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4" />
                <span>音效关闭</span>
              </>
            )}
          </Button>
        </div>

        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          <h3 className="font-medium mb-1">游戏特性：</h3>
          <ul className="list-disc list-inside text-sm">
            <li>使用方向键或WASD键移动</li>
            <li>收集宝石时会显示粒子特效</li>
            <li>三个难度递增的关卡</li>
            <li>可开关音效</li>
          </ul>
        </div>

        <div className="mt-2 p-3 bg-gray-800 rounded-lg">
          <h3 className="font-medium mb-1">关卡说明：</h3>
          <ul className="list-none text-sm space-y-1">
            <li>• 关卡 1: 5个宝石，基础速度</li>
            <li>• 关卡 2: 8个宝石，速度提升</li>
            <li>• 关卡 3: 12个宝石，高速移动</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
