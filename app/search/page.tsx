"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VehicleRegistrationForm } from "@/components/vehicle-registration-form"
import { SearchResults } from "@/components/search-results"
import { apiService } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function SearchPage() {
  const [licensePlate, setLicensePlate] = useState("")
  const [searchResults, setSearchResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("results")

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
      setSearchResults(response.data.data)
      setActiveTab("results")
    } catch (err: any) {
      console.error("Search error:", err)
      if (err.response?.status === 404) {
        setError("Araç bulunamadı. Yeni kayıt oluşturabilirsiniz.")
        setActiveTab("register")
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="results" className="flex-1 sm:flex-initial">
            Sonuçlar
          </TabsTrigger>
          <TabsTrigger value="register" className="flex-1 sm:flex-initial">
            Yeni Araç Kaydı
          </TabsTrigger>
        </TabsList>
        <TabsContent value="results" className="space-y-4">
          {searchResults ? (
            <SearchResults vehicle={searchResults} />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Araç sorgulamak için yukarıdaki formu kullanın</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="register" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yeni Araç Kaydı</CardTitle>
              <CardDescription>Sisteme yeni bir araç ve sahibi kaydedin</CardDescription>
            </CardHeader>
            <CardContent>
              <VehicleRegistrationForm initialLicensePlate={licensePlate} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
