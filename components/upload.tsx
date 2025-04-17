"use client"

import type React from "react"

import { useState, useRef } from "react"
import { UploadIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export function Upload() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      handleFile(droppedFile)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      handleFile(selectedFile)
    }
  }

  const handleFile = (selectedFile: File) => {
    // Check if file is an image
    if (!selectedFile.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    setFile(selectedFile)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreview(e.target.result as string)
      }
    }
    reader.readAsDataURL(selectedFile)
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const processImage = async () => {
    if (!file) return

    setIsLoading(true)

    try {
      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append("file", file)

      // Send the file to your local API
      const response = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to process image")
      }

      // Get the results
      const results = await response.json()

      // Store results in sessionStorage
      sessionStorage.setItem("analysisResults", JSON.stringify(results))

      // Navigate to results page
      setIsLoading(false)
      router.push("/results")
    } catch (error) {
      console.error("Error processing image:", error)
      setIsLoading(false)
      alert("Error processing image. Please make sure the local API server is running.")
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card
        className={`border-2 border-dashed p-8 ${isDragging ? "border-teal-500 bg-teal-50" : "border-slate-300"} transition-colors`}
      >
        {!preview ? (
          <div
            className="flex flex-col items-center justify-center py-12"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <UploadIcon className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">Upload X-ray Image</h3>
            <p className="text-slate-500 text-center mb-6">
              Drag and drop your dental X-ray image here, or click to browse
            </p>
            <Button onClick={() => fileInputRef.current?.click()} className="bg-teal-600 hover:bg-teal-700">
              Select File
            </Button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileInput} />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-md mb-4">
              <Button
                variant="outline"
                size="icon"
                className="absolute -right-2 -top-2 z-10 rounded-full bg-white"
                onClick={clearFile}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="bg-black rounded-lg overflow-hidden">
                <img
                  src={preview || "/placeholder.svg"}
                  alt="X-ray preview"
                  className="w-full h-auto object-contain max-h-[300px]"
                />
              </div>
            </div>
            <div className="text-center">
              <p className="text-slate-800 font-medium mb-1">{file?.name}</p>
              <p className="text-slate-500 text-sm mb-4">
                {file?.size ? (file.size / 1024 / 1024).toFixed(2) : "0"} MB
              </p>
              <Button onClick={processImage} className="bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
                {isLoading ? "Processing..." : "Analyze X-ray"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
