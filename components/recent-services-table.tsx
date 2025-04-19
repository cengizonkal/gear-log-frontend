import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Button } from "./ui/button"
import { Eye } from "lucide-react"

interface ServiceProps {
  id: number
  vehicle: {
    license_plate: string
    vehicle_model: string
    brand: string
  }
  started_at: string | null
  finished_at: string | null
  created_at: string | null
  updated_at: string | null
}

export function RecentServicesTable({ services }: { services: ServiceProps[] }) {
  if (!services || services.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">Henüz servis kaydı bulunmamaktadır.</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Servis No</TableHead>
            <TableHead>Plaka</TableHead>
            <TableHead className="hidden md:table-cell">Araç</TableHead>
            <TableHead className="hidden md:table-cell">Tarih</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead className="text-right">İşlem</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell className="font-medium">#{service.id}</TableCell>
              <TableCell>{service.vehicle.license_plate}</TableCell>
              <TableCell className="hidden md:table-cell">
                {service.vehicle.brand} {service.vehicle.vehicle_model}
              </TableCell>
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
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
