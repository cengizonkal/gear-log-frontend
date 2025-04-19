"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"

export function ApiDebug() {
  const [isVisible, setIsVisible] = useState(false)
  const [apiUrl, setApiUrl] = useState("")
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Get the API URL from the environment variable or the default
    setApiUrl(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api")
  }, [])

  const testConnection = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      // Try to make a simple request to check if the API is reachable
      await api.get("/")
      setTestResult({
        success: true,
        message: "API bağlantısı başarılı!",
      })
    } catch (error: any) {
      console.error("API test failed:", error)

      let errorMessage = "API bağlantısı başarısız."

      if (error.response) {
        // The request was made and the server responded with a status code
        errorMessage += ` Durum kodu: ${error.response.status}`
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage += " Sunucudan yanıt alınamadı."
      } else {
        // Something happened in setting up the request
        errorMessage += ` Hata: ${error.message}`
      }

      setTestResult({
        success: false,
        message: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4">
        <Button variant="outline" size="sm" onClick={() => setIsVisible(true)}>
          API Hata Ayıklama
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 z-50">
      <Alert>
        <AlertTitle>API Bağlantı Bilgileri</AlertTitle>
        <AlertDescription>
          <div className="mt-2 space-y-4 text-sm">
            <div>
              <p className="font-medium">API URL:</p>
              <p className="text-muted-foreground break-all">{apiUrl}</p>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={testConnection} disabled={isLoading}>
                {isLoading ? "Test Ediliyor..." : "Bağlantıyı Test Et"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsVisible(false)}>
                Kapat
              </Button>
            </div>

            {testResult && (
              <div
                className={`p-2 rounded ${testResult.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
              >
                {testResult.message}
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
