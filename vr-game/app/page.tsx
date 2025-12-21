"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { Loader } from "@/components/loader"

// Dynamically import the 3D game component to avoid SSR issues
const VRGame = dynamic(() => import("@/components/vr-game"), {
  ssr: false,
  loading: () => <Loader />,
})

export default function HomePage() {
  return (
    <main className="relative w-full h-screen overflow-hidden">
      <Suspense fallback={<Loader />}>
        <VRGame />
      </Suspense>
      <div className="absolute bottom-4 left-4 z-10 bg-black/70 text-white p-3 rounded-lg max-w-xs">
        <h2 className="text-lg font-bold mb-2">3D控制说明:</h2>
        <ul className="text-sm space-y-1">
          <li>• 使用鼠标左键点击物体进行交互</li>
          <li>• 按住鼠标左键并拖动来旋转视角</li>
          <li>• 使用鼠标滚轮可以缩放场景</li>
          <li>• 按住鼠标右键并拖动可以平移场景</li>
        </ul>
      </div>
    </main>
  )
}
