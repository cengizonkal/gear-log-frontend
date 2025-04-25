"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, Loader2, Plus, Search } from "lucide-react"
import Link from "next/link"
import { apiService } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AddServiceForm } from "@/components/add-service-form"
import { formatDate } from "@/lib/utils"

interface ServiceProps {
  id: number
  vehicle: {
    license_plate: string
    vehicle_model: string
    brand: string
  }
  user: {
    name: string
  }
  started_at: string | null
  finished_at: string | null
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceProps[]>([])
  const [filteredServices, setFilteredServices] = useState<ServiceProps[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true)
        const response = await apiService.services.getAll()
        setServices(response.data.data)
        setFilteredServices(response.data.data)
      } catch (err) {
        console.error("Failed to fetch services:", err)
        setError("Servisleri yüklerken bir hata oluştu.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchServices()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredServices(services)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = services.filter(
          (service) =>
              service.id.toString().includes(query) ||
              service.vehicle.license_plate.toLowerCase().includes(query) ||
              service.vehicle.brand.toLowerCase().includes(query) ||
              service.vehicle.vehicle_model.toLowerCase().includes(query) ||
              service.user.name.toLowerCase().includes(query),
      )
      setFilteredServices(filtered)
    }
  }, [searchQuery, services])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  if (isLoading) {
    return (
        <div className="flex-1 flex items-center justify-center p-4 md:p-8 pt-6">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Servisler yükleniyor...</p>
          </div>
        </div>
    )
  }

  return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Servisler</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="self-start sm:self-auto">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Yeni Servis</span>
                <span className="sm:hidden">Yeni</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Yeni Servis</DialogTitle>
                <DialogDescription>Yeni bir servis kaydı oluşturun.</DialogDescription>
              </DialogHeader>
              <AddServiceForm
                  onSuccess={() => { }}
              />
            </DialogContent>
          </Dialog>

        </div>

        {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Servis Ara</CardTitle>
            <CardDescription>Servis numarası veya plaka ile arama yapın</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                  type="text"
                  placeholder="Servis No, Plaka veya Araç"
                  className="pl-9"
                  value={searchQuery}
                  onChange={handleSearch}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tüm Servisler</CardTitle>
            <CardDescription>Sistemdeki tüm servis kayıtları</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Servis No</TableHead>
                    <TableHead>Plaka</TableHead>
                    <TableHead className="hidden md:table-cell">Araç</TableHead>
                    <TableHead className="hidden md:table-cell">Müşteri</TableHead>
                    <TableHead className="hidden md:table-cell">Tarih</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                          {searchQuery ? "Arama sonucu bulunamadı." : "Henüz servis kaydı bulunmamaktadır."}
                        </TableCell>
                      </TableRow>
                  ) : (
                      filteredServices.map((service) => (
                          <TableRow key={service.id}>
                            <TableCell className="font-medium">#{service.id}</TableCell>
                            <TableCell>{service.vehicle.license_plate}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {service.vehicle.brand} {service.vehicle.vehicle_model}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{service.user.name}</TableCell>
                            <TableCell className="hidden md:table-cell">{formatDate(service.started_at)}</TableCell>
                            <TableCell>
                              <Badge variant={service.finished_at ? "success" : "default"}>
                                {service.finished_at ? "Tamamlandı" : "Devam Ediyor"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={`/services/${service.id}`}>
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">Görüntüle</span>
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
