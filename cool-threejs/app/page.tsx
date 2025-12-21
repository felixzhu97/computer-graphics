"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { Loader } from "@/components/loader"

// Import the 3D scene component dynamically to avoid SSR issues
const ThreeScene = dynamic(() => import("@/components/three-scene"), {
  ssr: false,
  loading: () => <Loader />,
})

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full h-screen">
        <Suspense fallback={<Loader />}>
          <ThreeScene />
        </Suspense>
      </div>
    </main>
  )
}
