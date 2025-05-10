"use client"
import { useState, useEffect } from 'react';
import React from "react";
import { apiService } from '@/lib/api';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Plus, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { NewServiceForm } from "@/components/new-service-form";
import Link from 'next/link';
import { OwnerDetails } from '@/components/owner-details';
import { VehicleDetails } from '@/components/vehicle-details';
import {statusMap} from "@/lib/status-map";

interface ServiceProps {
  id: number;
  started_at: string | null;
  finished_at: string | null;
  status: {
    name: string;
    color: string;
  }
}

interface OwnerProps {
  id: number;
  name: string;
  email: string | null;
  phone: string;
}

interface VehicleProps {
  id: number;
  license_plate: string;
  fuel_type: string;
  vehicle_model: string;
  brand: string;
  owner: OwnerProps;
  vin: string | null;
  mileage: number | null;
  services: ServiceProps[];
  year: number | null;
  engine_capacity: number | null;
  weight: number | null;
}

interface Props {
  params: { license_plate: string };
}

export default function VehicleDetailPage({ params }: Props) {
  const { license_plate } = React.use(params);
  const [vehicle, setVehicle] = useState<VehicleProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicle = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.vehicles.getById(license_plate);
      setVehicle(response.data.data);
    } catch (err: any) {
      console.error('Error fetching vehicle:', err);
      setError(err?.response?.data?.message || 'Failed to fetch vehicle');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (license_plate) {
      fetchVehicle();
    }
  }, [license_plate]);

  const handleNewServiceSuccess = () => {
    setVehicle(null)
    setError(null)
    fetchVehicle();
  }

  if (loading) {
    return (
        <div className="flex-1 flex items-center justify-center p-4 md:p-8 pt-6">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Araç detayları yükleniyor...</p>
          </div>
        </div>
      )
    
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Araç Detayı</CardTitle>
          <CardDescription>Araç ({license_plate}) detayları yüklenirken bir hata oluştu: {error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!vehicle) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Araç Detayı</CardTitle>
          <CardDescription>Araç ({license_plate}) bulunamadı.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Araç Bilgileri</CardTitle>
          <CardDescription>Plaka: {vehicle.license_plate}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <VehicleDetails 
              vehicle={vehicle} 
              onVehicleUpdate={updatedVehicle => setVehicle((prev) => ({ ...prev, ...updatedVehicle }))} 
            />
            <OwnerDetails 
              owner={vehicle.owner} 
              onOwnerUpdate={updatedOwner => setVehicle((prev) => ({ ...prev, owner: updatedOwner }))} 
            />
          </div>
        </CardContent>
      </Card>
      {vehicle.services && (
        <Card>
          <CardHeader>
            <CardTitle>Son 5 Servis Kaydı</CardTitle>
            <CardDescription>Araç için yapılan son 5 servis kaydı</CardDescription>
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
                    {vehicle.services.slice(-5).map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">#{service.id}</TableCell>
                        <TableCell>{formatDate(service.started_at)}</TableCell>
                        <TableCell className="hidden md:table-cell">{formatDate(service.finished_at)}</TableCell>
                        <TableCell>
                          <Badge className={statusMap[service.status.name]?.color || "bg-gray-100 text-gray-700"}>
                            {statusMap[service.status.name]?.icon && (
                                React.createElement(statusMap[service.status.name].icon, {
                                  className: "w-4 h-4 inline-block mr-1",
                                })
                            )}
                            {service.status.name}
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
        </Card>
      )}
      <div className="flex items-center gap-4 justify-end">
        <Button asChild>
          <Link href={`/vehicles/${vehicle.license_plate}/services`}>
            Tümünü Görüntüle
          </Link>
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Yeni Servis Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <NewServiceForm vehicleLicensePlate={vehicle.license_plate} onSuccess={handleNewServiceSuccess} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}