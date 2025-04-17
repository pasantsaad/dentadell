"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, Info } from "lucide-react"
import { SegmentationViewer } from "@/components/segmentation-viewer"

export default function ResultsPage() {
  const [results, setResults] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Get the analysis results from sessionStorage
    const storedResults = sessionStorage.getItem("analysisResults")
    if (!storedResults) {
      router.push("/")
      return
    }

    try {
      const parsedResults = JSON.parse(storedResults)
      setResults(parsedResults)
    } catch (error) {
      console.error("Error parsing results:", error)
      router.push("/")
    }
  }, [router])

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  const handleExport = () => {
    // Create a simple HTML report
    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Dental X-ray Analysis Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          h1, h2, h3 { color: #333; }
          .container { max-width: 800px; margin: 0 auto; }
          .image-container { text-align: center; margin: 20px 0; }
          img { max-width: 100%; }
          .detection { margin-bottom: 15px; padding: 10px; border: 1px solid #eee; border-radius: 5px; }
          .header { display: flex; align-items: center; }
          .color-box { width: 15px; height: 15px; margin-right: 10px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Dental X-ray Analysis Report</h1>
          <p>Generated on ${new Date().toLocaleString()}</p>
          
          <div class="image-container">
            <h2>Original X-ray</h2>
            <img src="${results.original}" alt="Original X-ray">
          </div>
          
          <div class="image-container">
            <h2>Detection Results</h2>
            <img src="${results.detection}" alt="Detection Results">
          </div>
          
          <h2>Detected Features</h2>
          ${results.masks
            .map(
              (mask) => `
            <div class="detection">
              <div class="header">
                <div class="color-box" style="background-color: ${mask.color}"></div>
                <h3>${mask.class}</h3>
              </div>
              <p>Confidence: ${(mask.confidence * 100).toFixed(1)}%</p>
              <p>Area: ${mask.percentage.toFixed(1)}% of image</p>
            </div>
          `,
            )
            .join("")}
        </div>
      </body>
      </html>
    `

    // Create a blob and download
    const blob = new Blob([reportHtml], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "dental-xray-report.html"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Button variant="ghost" className="mr-4" onClick={() => router.push("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-slate-800">Analysis Results</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="segmentation" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="segmentation">Segmentation</TabsTrigger>
              <TabsTrigger value="report">Report</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export Results
              </Button>
            </div>
          </div>

          <TabsContent value="segmentation" className="mt-0">
            <SegmentationViewer results={results} />
          </TabsContent>

          <TabsContent value="report" className="mt-0">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Dental X-ray Analysis Report</h2>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Summary</h3>
                <p className="text-slate-700 mb-4">
                  The analysis detected {results.masks.length} areas of interest in the dental X-ray.
                </p>

                <div className="flex items-center p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <Info className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-amber-700">
                    This is an AI-assisted analysis and should be verified by a dental professional.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Detected Issues</h3>

                <div className="space-y-4">
                  {results.masks.map((mask, index) => (
                    <div key={index} className="p-4 border rounded-md">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: mask.color }}></div>
                        <h4 className="font-medium">{mask.class}</h4>
                      </div>
                      <p className="text-sm text-slate-600 mb-1">Confidence: {(mask.confidence * 100).toFixed(1)}%</p>
                      <p className="text-sm text-slate-600">Area: {mask.percentage.toFixed(1)}% of image</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
                <ul className="list-disc pl-5 space-y-2 text-slate-700">
                  <li>Further examination of potential issues identified by the AI</li>
                  <li>Consider follow-up diagnostics for high-confidence detections</li>
                  <li>Review the interactive segmentation for detailed analysis</li>
                </ul>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
