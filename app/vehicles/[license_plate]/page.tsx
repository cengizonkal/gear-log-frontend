"use client"
import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
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
import { NewServiceForm } from "@/components/new-service-form"

interface ServiceProps {
  id: number;
  started_at: string | null;
  finished_at: string | null;
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
}

interface Props {
  params: { license_plate: string };
}

export default function VehicleDetailPage({ params }: Props) {
  const { license_plate } = params;
  const [vehicle, setVehicle] = useState<VehicleProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);

  useEffect(() => {
    if (vehicle?.owner) {
        setOwnerName(vehicle.owner.name);
        setOwnerPhone(vehicle.owner.phone);
        setOwnerEmail(vehicle.owner.email);
    }
}, [vehicle]);
const handleOwnerUpdate = async () => {
  if (vehicle?.owner) {
    try {
      await apiService.owners.update(vehicle.owner.id, {
        name: ownerName,
        phone: ownerPhone,
        email: ownerEmail,
      });
      // Optionally, refetch the vehicle data to update the UI with the latest data
      setError(null)
      fetchVehicle();
    } catch (error) {
      console.error("Error updating owner:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else if (typeof error === 'string') {
        setError(error);
      } else if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
        setError(error.message)
      } else if (typeof error === 'object' && error !== null && 'response' in error && typeof error.response === 'object' && error.response !== null && 'data' in error.response && typeof error.response.data === 'object' && error.response.data !== null && 'message' in error.response.data && typeof error.response.data.message === 'string') {
        setError(error.response.data.message)
      }

      setError("Failed to update owner information.");
    }
  }
};

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

  const handleNewServiceSuccess = () => {
    setIsModalOpen(false);
    setVehicle(null)
    setError(null)
    fetchVehicle();
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
                  <span className="text-sm">{vehicle.mileage ? `${vehicle.mileage} km` : '-'}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-sm text-muted-foreground">Yakıt Tipi:</span>
                  <span className="text-sm">{vehicle.fuel_type}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-sm text-muted-foreground">VIN:</span>
                  <span className="text-sm">{vehicle.vin || '-'}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium">Araç Sahibi</h3>
              <div className="mt-2 space-y-2">
                <div className="grid grid-cols-2">
                <Label htmlFor="name" className="text-sm text-muted-foreground">İsim:</Label>
                <Input type="text" id="name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2">
                <Label htmlFor="phone" className="text-sm text-muted-foreground">Telefon:</Label>
                <Input type="text" id="phone" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} />
                </div>
                <div className="grid grid-cols-2">
                <Label htmlFor="email" className="text-sm text-muted-foreground">E-posta:</Label>
                <Input type="email" id="email" value={ownerEmail || ''} onChange={(e) => setOwnerEmail(e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <Button onClick={handleOwnerUpdate}>Kaydet</Button>
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
                        <Badge variant={service.finished_at ? 'success' : 'default'}>
                          {service.finished_at ? 'Tamamlandı' : 'Devam Ediyor'}
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
      </Card>)}
      <div className="flex items-center gap-4 justify-end">
          <Button asChild>
            <Link href={`/vehicles/${vehicle.license_plate}/services`}>
              Tümünü Görüntüle
            </Link>
          </Button>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                    Yeni Servis Ekle
                </Button>
              </DialogTrigger>
              <DialogContent>
                  <NewServiceForm vehicleLicensePlate={vehicle.license_plate} onSuccess={handleNewServiceSuccess}/>
              </DialogContent>
            </Dialog>
            <Link href={`/services/new?vehicle=${vehicle.license_plate}`}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Servis Ekle
            </Link>
          </Button>
      </div>
    </div>
  );
}