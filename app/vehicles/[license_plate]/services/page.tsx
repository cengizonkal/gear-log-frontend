"use client";
import { apiService } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import React, { useEffect, useState } from "react";

interface ServiceProps {
  id: number;
  started_at: string | null;
  finished_at: string | null;
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

  if (!servicesData || servicesData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Servis Geçmişi</CardTitle>
          <CardDescription>Araç ({license_plate}) için servis geçmişi bulunamadı.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Servis Geçmişi</CardTitle>
          <CardDescription>Araç ({license_plate}) için servis geçmişi</CardDescription>
        </CardHeader>
        <CardContent>
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
                {servicesData.map((service) => (
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
        </CardContent>
      </Card>
    </div>
  );
}
    } catch (error) {
      console.error("Error fetching services:", error);
      return null;
    }
  };
  
  const initialData = await fetchServices();
  
  const servicesData = initialData?.data;
  if(!servicesData){
    return <p className="text-center text-muted-foreground py-4">Hata oluştu. Lütfen tekrar deneyiniz.</p>
  };

  if (!servicesData || servicesData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Servis Geçmişi</CardTitle>
          <CardDescription>Araç ({license_plate}) için servis geçmişi bulunamadı.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Servis Geçmişi</CardTitle>
          <CardDescription>Araç ({license_plate}) için servis geçmişi</CardDescription>
        </CardHeader>
        <CardContent>
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
                {servicesData.map((service: ServiceProps) => (
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
        </CardContent>
      </Card>
    </div>
  );
}