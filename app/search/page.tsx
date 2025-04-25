"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { VehicleRegistrationForm } from "@/components/vehicle-registration-form"
import { apiService } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function SearchPage() {
  const [licensePlate, setLicensePlate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!licensePlate.trim()) {
      setError("Lütfen bir plaka giriniz")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiService.vehicles.getById(licensePlate)
      window.location.href = `/vehicles/${licensePlate}`;
    } catch (err: any) {
      console.error("Search error:", err)
      if (err.response?.status === 404) {
       window.location.href = `/vehicles/new?license_plate=${licensePlate}`;
         } else {
        setError("Arama sırasında bir hata oluştu. Lütfen tekrar deneyin.")
      }
      setSearchResults(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Araç Sorgula</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plaka ile Sorgula</CardTitle>
          <CardDescription>
            Araç plakasını girerek servis geçmişini görüntüleyin veya yeni araç kaydı oluşturun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex w-full max-w-sm items-center space-x-2" onSubmit={handleSearch}>
            <Input
              type="text"
              placeholder="34ABC123"
              className="uppercase"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Aranıyor</span>
                </>
              ) : (
                <span>Sorgula</span>
              )}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>     
    </div>
  )
}
