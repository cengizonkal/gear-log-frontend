import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, Plus } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

interface VehicleWithDetailsProps {
  id: number
  license_plate: string
  fuel_type: string
  vehicle_model: string
  brand: string
  owner: {
    id: number
    name: string
    email: string | null
    phone: string
  }
  vin: string | null
  mileage: number | null
  services: Array<{
    id: number
    started_at: string | null
    finished_at: string | null
    created_at: string | null
    updated_at: string | null
  }>
}

export function SearchResults({ vehicle }: { vehicle: VehicleWithDetailsProps }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Araç Bilgileri</CardTitle>
          <CardDescription>Plaka: {vehicle.license_plate}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium">Araç Detayları</h3>
              <div className="mt-2 space-y-2">
                <div className="grid grid-cols-2">
                  <span className="text-sm text-muted-foreground">Marka/Model:</span>
                  <span className="text-sm">
                    {vehicle.brand} {vehicle.vehicle_model}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-sm text-muted-foreground">Kilometre:</span>
                  <span className="text-sm">{vehicle.mileage ? `${vehicle.mileage} km` : "-"}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-sm text-muted-foreground">Yakıt Tipi:</span>
                  <span className="text-sm">{vehicle.fuel_type}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-sm text-muted-foreground">VIN:</span>
                  <span className="text-sm">{vehicle.vin || "-"}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium">Araç Sahibi</h3>
              <div className="mt-2 space-y-2">
                <div className="grid grid-cols-2">
                  <span className="text-sm text-muted-foreground">İsim:</span>
                  <span className="text-sm">{vehicle.owner.name}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-sm text-muted-foreground">Telefon:</span>
                  <span className="text-sm">{vehicle.owner.phone}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-sm text-muted-foreground">E-posta:</span>
                  <span className="text-sm">{vehicle.owner.email || "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 justify-between">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href={`/vehicles/${vehicle.license_plate}`}>
              <Eye className="mr-2 h-4 w-4" />
              Detayları Görüntüle
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/services/new?vehicle=${vehicle.license_plate}`}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Servis Ekle
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Servis Geçmişi</CardTitle>
          <CardDescription>Araç için yapılan önceki servisler</CardDescription>
        </CardHeader>
        <CardContent>
          {vehicle.services && vehicle.services.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Servis No</TableHead>
                    <TableHead>Başlangıç</TableHead>
                    <TableHead className="hidden md:table-cell">Bitiş</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicle.services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">#{service.id}</TableCell>
                      <TableCell>{formatDate(service.started_at)}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(service.finished_at)}</TableCell>
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
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Bu araç için servis kaydı bulunmamaktadır.</p>
          )}
        </CardContent>
        <Button asChild className="w-full sm:w-auto ml-4 mb-4">
            <Link href={`/vehicles/${vehicle.license_plate}/services`}>
              Tümünü Görüntüle
            </Link>
          </Button>
      </Card>
    </div>
  )
}
