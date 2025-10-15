"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle, ExternalLink, Info } from "lucide-react"
import api from "@/lib/api"

interface ImportInstructions {
  title: string
  description: string
  steps: Array<{
    step: number
    title: string
    description: string
  }>
  requirements: string[]
  notes: string[]
}

interface ImportStats {
  total_transactions: number
  customers_created: number
  customers_updated: number
  invoices_created: number
  invoices_skipped: number
  date_range: {
    earliest: string | null
    latest: string | null
  }
}

export function CsvImport() {
  const [instructions, setInstructions] = useState<ImportInstructions | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    stats?: ImportStats
  } | null>(null)

  useEffect(() => {
    loadInstructions()
  }, [])

  const loadInstructions = async () => {
    try {
      const response = await api.get("/import/instructions")
      if (response.data.success) {
        setInstructions(response.data.data.instructions)
      }
    } catch (error) {
      console.error("Failed to load instructions:", error)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.csv') && !file.type.includes('csv')) {
        alert('Please select a CSV file')
        return
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }

      setSelectedFile(file)
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setProgress(0)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await api.post("/import/shopify-partner-csv", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      clearInterval(progressInterval)
      setProgress(100)

      setResult({
        success: response.data.success,
        message: response.data.message,
        stats: response.data.data?.stats
      })

    } catch (error: any) {
      console.error("Upload error:", error)
      setResult({
        success: false,
        message: error.response?.data?.message || "Upload failed. Please try again."
      })
    } finally {
      setUploading(false)
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setProgress(0)
    setResult(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Historical Data
          </CardTitle>
          <CardDescription>
            Import your historical Shopify Partner revenue data from CSV export
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Instructions */}
      {instructions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Import</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Steps */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Step-by-Step Guide:</h4>
              <div className="grid gap-3">
                {instructions.steps.map((step) => (
                  <div
                    key={step.step}
                    className="flex gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-sm mb-1">{step.title}</h5>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Link */}
              <div className="flex items-start gap-2 p-4 rounded-lg border bg-blue-50 dark:bg-blue-950">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-2">
                    Quick Access to Shopify Partner Dashboard
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => window.open('https://partners.shopify.com', '_blank')}
                  >
                    Open Partner Dashboard
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h4 className="font-semibold text-sm mb-2">Requirements:</h4>
              <ul className="space-y-1">
                {instructions.requirements.map((req, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Notes */}
            <div>
              <h4 className="font-semibold text-sm mb-2">Important Notes:</h4>
              <ul className="space-y-1">
                {instructions.notes.map((note, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload CSV File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedFile && !result && (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Select your Shopify Partner CSV export file
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-file-input"
              />
              <label htmlFor="csv-file-input">
                <Button variant="outline" as Span>
                  Select CSV File
                </Button>
              </label>
            </div>
          )}

          {selectedFile && !result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                {!uploading && (
                  <Button variant="ghost" size="sm" onClick={resetUpload}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {uploading && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-center text-muted-foreground">
                    {progress < 100 ? "Uploading and processing..." : "Finalizing import..."}
                  </p>
                </div>
              )}

              {!uploading && (
                <Button
                  onClick={handleUpload}
                  className="w-full"
                  size="lg"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
              )}
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <Alert
                variant={result.success ? "default" : "destructive"}
                className={result.success ? "border-green-600 bg-green-50 dark:bg-green-950" : ""}
              >
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <p className="font-medium mb-1">{result.message}</p>
                  {result.stats && (
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex justify-between px-2 py-1 rounded bg-background/50">
                          <span>Transactions:</span>
                          <span className="font-semibold">{result.stats.total_transactions}</span>
                        </div>
                        <div className="flex justify-between px-2 py-1 rounded bg-background/50">
                          <span>Invoices Created:</span>
                          <span className="font-semibold">{result.stats.invoices_created}</span>
                        </div>
                        <div className="flex justify-between px-2 py-1 rounded bg-background/50">
                          <span>New Customers:</span>
                          <span className="font-semibold">{result.stats.customers_created}</span>
                        </div>
                        <div className="flex justify-between px-2 py-1 rounded bg-background/50">
                          <span>Duplicates Skipped:</span>
                          <span className="font-semibold">{result.stats.invoices_skipped}</span>
                        </div>
                      </div>
                      {result.stats.date_range.earliest && result.stats.date_range.latest && (
                        <div className="pt-2 border-t">
                          <p className="font-medium">Date Range Imported:</p>
                          <p className="text-muted-foreground">
                            {new Date(result.stats.date_range.earliest).toLocaleDateString()} - {" "}
                            {new Date(result.stats.date_range.latest).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button
                  onClick={resetUpload}
                  variant="outline"
                  className="flex-1"
                >
                  Import Another File
                </Button>
                <Button
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex-1"
                >
                  View Dashboard
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Helper component for Button as label
const Span = ({ children, ...props }: any) => <span {...props}>{children}</span>

