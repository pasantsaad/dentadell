"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Layers } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useMobile } from "@/hooks/use-mobile"

interface MaskData {
  id: number
  class: string
  confidence: number
  box: number[]
  color: string
  base64: string
  area: number
  percentage: number
}

interface SegmentationViewerProps {
  results: any
}

export function SegmentationViewer({ results }: SegmentationViewerProps) {
  const [activeView, setActiveView] = useState<"original" | "detection">("original")
  const [activeMask, setActiveMask] = useState<number | null>(null)
  const [showAllMasks, setShowAllMasks] = useState(false)
  const [currentImage, setCurrentImage] = useState<string>(results.original)
  const [masks, setMasks] = useState<MaskData[]>(results.masks || [])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isMobile = useMobile()

  // Update the image when view changes
  useEffect(() => {
    setCurrentImage(activeView === "original" ? results.original : results.detection)
  }, [activeView, results])

  // Draw masks on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = currentImage

    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width
      canvas.height = img.height

      // Draw the current image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Draw masks if needed
      if (showAllMasks) {
        // Draw all masks with transparency
        masks.forEach((mask) => {
          const maskImg = new Image()
          maskImg.crossOrigin = "anonymous"
          maskImg.src = mask.base64

          maskImg.onload = () => {
            ctx.globalAlpha = 0.5
            ctx.drawImage(maskImg, 0, 0, canvas.width, canvas.height)
            ctx.globalAlpha = 1.0
          }
        })
      } else if (activeMask !== null) {
        // Draw only the active mask
        const activeMaskData = masks.find((m) => m.id === activeMask)
        if (activeMaskData) {
          const maskImg = new Image()
          maskImg.crossOrigin = "anonymous"
          maskImg.src = activeMaskData.base64

          maskImg.onload = () => {
            ctx.globalAlpha = 0.7
            ctx.drawImage(maskImg, 0, 0, canvas.width, canvas.height)
            ctx.globalAlpha = 1.0
          }
        }
      }
    }
  }, [currentImage, activeMask, showAllMasks, masks])

  const toggleMask = (id: number) => {
    if (activeMask === id) {
      setActiveMask(null)
    } else {
      setActiveMask(id)
      setShowAllMasks(false)
    }
  }

  const toggleAllMasks = () => {
    setShowAllMasks(!showAllMasks)
    setActiveMask(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
      <div className="bg-slate-900 rounded-lg p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <Button
              variant={activeView === "original" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveView("original")}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Original
            </Button>
            <Button
              variant={activeView === "detection" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveView("detection")}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Detection
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="show-all" checked={showAllMasks} onCheckedChange={toggleAllMasks} />
            <Label htmlFor="show-all" className="text-white text-sm">
              Show All
            </Label>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <canvas ref={canvasRef} className="max-w-full max-h-[70vh] object-contain" />
        </div>
      </div>

      <div className="order-first lg:order-last">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Layers className="h-5 w-5 mr-2 text-teal-600" />
            Detected Features
          </h3>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {masks.map((mask) => (
              <div
                key={mask.id}
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  activeMask === mask.id ? "bg-slate-100 border-teal-500" : "hover:bg-slate-50"
                }`}
                onClick={() => toggleMask(mask.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: mask.color }} />
                    <h4 className="font-medium">{mask.class}</h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleMask(mask.id)
                    }}
                  >
                    {activeMask === mask.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="text-sm text-slate-600">
                  <p>Confidence: {(mask.confidence * 100).toFixed(1)}%</p>
                  <p>Area: {mask.percentage.toFixed(1)}% of image</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
