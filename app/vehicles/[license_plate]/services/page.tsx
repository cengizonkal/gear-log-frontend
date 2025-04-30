"use client"
import { apiService } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import React, { useEffect, useState } from "react";

interface ServiceProps {
  id: number;
  started_at: string | null;
  finished_at: string | null;
  description?: string | null;
}

interface Props {
  params: { license_plate: string }
}

const ALL_SERVICES = 1000; // Assuming 1000 services is sufficient to fetch all

export default function VehicleServicesPage({ params }: Props) {
  const { license_plate } = params;
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="outline" size="icon" asChild className="mr-2" title="Geri Dön">
              <Link href={`/vehicles/${license_plate}`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-3xl font-extrabold text-primary flex-1 text-center">
              <Link href={`/vehicles/${license_plate}`} className="hover:underline">{license_plate}</Link>
            </h1>
          </div>
          <CardTitle>
            Servis Geçmişi ({servicesData.length})
          </CardTitle>
          <CardDescription>Araç ({license_plate}) için yapılan servislerin listesi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
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
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      Bu araç için henüz servis kaydı bulunmamaktadır.
                    </TableCell>
                  </TableRow>
                ) : (
                  servicesData.map((service) => (
                    <TableRow key={service.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">#{service.id}</TableCell>
                      <TableCell>{formatDate(service.started_at)}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(service.finished_at)}</TableCell>
                      <TableCell>{service.description || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={service.finished_at ? "success" : "default"}>
                          {service.finished_at ? "Tamamlandı" : "Devam Ediyor"}
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
