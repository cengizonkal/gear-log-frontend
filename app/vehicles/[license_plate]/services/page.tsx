"use client"
import { apiService } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import React, { useEffect, useState, use } from "react";
import { statusMap } from "@/lib/status-map";


interface ServiceProps {
  id: number;
  started_at: string | null;
  finished_at: string | null;
  description?: string | null;
  status: {
    name: string
    color: string
  }
}

interface Props {
  params: Promise<{ license_plate: string }>
}

const ALL_SERVICES = 1000; // Assuming 1000 services is sufficient to fetch all

export default function VehicleServicesPage({ params }: Props) {
  const { license_plate } = use(params);
  const [servicesData, setServicesData] = useState<ServiceProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async (license_plate: string) => {
    setIsLoading(true);
    setError(null);
    try {
        const response = await apiService.vehicles.getServices(license_plate, 1, ALL_SERVICES);
        setServicesData(response.data.data);
      } catch (error) {
        console.error("Error fetching services:", error);
        setError("Hata oluştu. Lütfen tekrar deneyiniz.");
      } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
      fetchServices(license_plate);
  }, [license_plate]);

  if (isLoading) {
    return <p className="text-center text-muted-foreground py-4">Yükleniyor...</p>;
  }

  if (error) {
    return <p className="text-center text-muted-foreground py-4">{error}</p>;
  }

  console.log(servicesData)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" asChild className="rounded-xl hover:bg-muted" title="Geri Dön">
              <Link href={`/vehicles/${license_plate}`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold text-primary text-center flex-1">
              <Link href={`/vehicles/${license_plate}`} className="hover:underline">
                {license_plate.toUpperCase()}
              </Link>
            </h1>
          </div>
          <CardTitle className="text-xl pt-2">Servis Geçmişi ({servicesData.length})</CardTitle>
          <CardDescription className="text-muted-foreground">
            Araç ({license_plate.toUpperCase()}) için yapılan servislerin listesi
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table className="text-sm">
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead>Servis No</TableHead>
                  <TableHead>Başlangıç</TableHead>
                  <TableHead className="hidden md:table-cell">Bitiş</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servicesData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground italic">
                        Bu araç için henüz servis kaydı bulunmamaktadır.
                      </TableCell>
                    </TableRow>
                ) : (
                    servicesData.map((service, i) => (
                        <TableRow
                            key={service.id}
                            className={`hover:bg-muted/60 transition-all ${
                                i % 2 === 0 ? "bg-background" : "bg-muted/10"
                            }`}
                        >
                          <TableCell className="font-semibold">#{service.id}</TableCell>
                          <TableCell>{formatDate(service.started_at)}</TableCell>
                          <TableCell className="hidden md:table-cell">{formatDate(service.finished_at)}</TableCell>
                          <TableCell className="max-w-[300px] truncate line-clamp-2">
                            {service.description || <span className="text-muted-foreground italic">Açıklama yok</span>}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusMap[service.status.name as keyof typeof statusMap]?.color || "bg-gray-100 text-gray-700"}>
                              {statusMap[service.status.name as keyof typeof statusMap]?.icon && (
                                  React.createElement(statusMap[service.status.name as keyof typeof statusMap].icon, {
                                    className: "w-4 h-4 inline-block mr-1",
                                  })
                              )}
                              {service.status.name}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" asChild title="Servis Detayını Görüntüle">
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
  );
}
