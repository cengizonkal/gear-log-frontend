"use client"

import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import { AddVehicleForm } from "@/components/add-vehicle-form"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody, TableCell,
  TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Loader2, Plus, Search, Eye } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VehicleProps {
  id: number
  license_plate: string
  brand: string,
  model: string,
  user: { name: string }
}

export default function VehiclesPage() {  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleProps[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleProps[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setIsLoading(true)
       
        const dummyData = [
          { id: 1, license_plate: "34ABC123", brand: "Toyota", model: "Corolla", user: { name: "John Doe" } },
          { id: 2, license_plate: "06DEF456", brand: "Honda", model: "Civic", user: { name: "Jane Smith" } },
        ];
       
        setVehicles(dummyData as VehicleProps[]);
        setFilteredVehicles(dummyData as VehicleProps[]);
      } catch (err) {
        console.error("Failed to fetch vehicles:", err)
        setError("Araçlar yüklenirken bir hata oluştu.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchVehicles()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredVehicles(vehicles)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = vehicles.filter(
        (vehicle) =>
          vehicle.id.toString().includes(query) ||
          vehicle.license_plate.toLowerCase().includes(query)
      )
      setFilteredVehicles(filtered)
    }
  }, [searchQuery, vehicles])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 pt-6">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Araçlar yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Araçlar</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="self-start sm:self-auto">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Yeni Araç Ekle</span>
              <span className="sm:hidden">Yeni Ekle</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Yeni Araç Ekle</DialogTitle>
              <DialogDescription>Yeni bir araç ekleyin.</DialogDescription>
            </DialogHeader>
            <AddVehicleForm />
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
          <CardTitle>Araç Ara</CardTitle>
          <CardDescription>Araç numarası veya plaka ile arama yapın</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Araç No, Plaka"
              className="pl-9"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tüm Araçlar</CardTitle>
          <CardDescription>Sistemdeki tüm araç kayıtları</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Araç No</TableHead>
                  <TableHead>Plaka</TableHead>
                  <TableHead>Marka</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Müşteri</TableHead>
                  <TableHead className="text-right">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      {searchQuery ? "Arama sonucu bulunamadı." : "Henüz araç kaydı bulunmamaktadır."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">#{vehicle.id}</TableCell>
                      <TableCell>{vehicle.license_plate}</TableCell>
                      <TableCell>{vehicle.brand}</TableCell>
                      <TableCell>{vehicle.model}</TableCell>
                      <TableCell>{vehicle.user.name}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/vehicles/${vehicle.id}`}>
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