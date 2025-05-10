"use client"

import { useAuth } from "@/hooks/use-auth"
import React, { useEffect, useState, ChangeEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiService } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Loader2,
  ArrowLeft,
  Plus,
  Car,
  User,
  CalendarIcon,
  CheckCircle,
  Pencil,
  Check,
  Newspaper,
  Clock, RotateCw, Settings, X
} from "lucide-react"
import { formatDateTime, formatCurrency, formatDate } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AddServiceItemForm } from "@/components/add-service-item-form"
import { statusMap } from "@/lib/status-map";



interface ServiceItemProps {
  id: number
  name: string
  description: string | null
  quantity: string
  price: string
}

interface User {
    id: number
    name: string
    email: string
    phone: string | null
    company: {
        id: number
        name: string
    }
}

interface ServiceDetailsProps {
  id: number
  vehicle: {
    id: number
    license_plate: string
    vehicle_model: string
    brand: string
  }
  description: string | null
  user: User
  started_at: string | null
  finished_at: string | null
  status: {
    id: number
    name: string
    color: string
  }
  created_at: string | null
  updated_at: string | null
  items: ServiceItemProps[]
}

interface StatusProps {
  id: number
  name: string
  color: string
}

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [service, setService] = useState<ServiceDetailsProps | null>(null)
  const [status, setStatus] = useState<StatusProps[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedServiceData, setEditedServiceData] = useState<Partial<ServiceDetailsProps>>({});

  const { user } = useAuth()
  const loggedInUserCompanyId = user?.company?.id

    useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setIsLoading(true)
        const serviceId = Number(params.id)
        const response = await apiService.services.getById(serviceId)
        setService(response.data.data)
        setEditedServiceData(response.data.data);
      } catch (err) {
        console.error("Failed to fetch service details:", err)
        setError("Servis detaylarını yüklerken bir hata oluştu.")
      } finally {
        setIsLoading(false)
      }
    }

    const fetchStatuses = async () => {
      try {
        setIsLoading(true)
        const response = await apiService.servicesStatuses.getAll()
        setStatus(response.data.data)
      } catch (err) {
        console.error("Failed to fetch statuses:", err)
        setError("Durumları yüklerken bir hata oluştu.")
      }
    }

    fetchServiceDetails()
    fetchStatuses()
  }, [params.id])

  const handleEditClick = () => {
    if (isEditing) {
      // Save changes
      const serviceId = Number(params.id);
      const updatedServiceData = {
        started_at: editedServiceData.started_at,
        description: editedServiceData.description,
        status: editedServiceData.status?.id || service?.status.id,
      };

      apiService.services.update(serviceId, updatedServiceData)
        .then(response => {
          console.log("Service updated:", response.data);
          // Update the service state with the new data
          const selectedStatus = status.find(
              (s) => s.id === Number(updatedServiceData.status)
          );

          // Servis state'ini güncelle
          setService((prevService) => {
            if (!prevService) return null;
            return {
              ...prevService,
              ...updatedServiceData,
              status: selectedStatus || prevService.status, // status nesnesini güncelle
            };
          });
        })
        .catch(error => {
          console.error("Failed to update service:", error);
          setError("Servis güncellenirken bir hata oluştu.");
        })
        .finally(() => {
          setIsEditing(false);
        });
    } else {
      // Enable editing
      setIsEditing(true);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedServiceData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  const handleAddItem = (newItem: ServiceItemProps) => {
    if (service) {
      setService({
        ...service,
        items: [...service.items, newItem],
      })
    }
    setIsDialogOpen(false)
  }

  const calculateTotal = () => {
    if (!service?.items?.length) return 0

    return service.items.reduce((total, item) => {
      const price = Number.parseFloat(item.price)
      const quantity = Number.parseFloat(item.quantity)
      return total + price * quantity
    }, 0)
  }


  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri Dön
        </Button>
        <div className="flex flex-col items-center justify-center w-full">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Servis detayları yükleniyor</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri Dön
        </Button>
        <Alert variant="destructive">
          <AlertTitle>
            Servis detayları yüklenirken bir hata oluştu
          </AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri Dön
        </Button>
        <Alert>
          <AlertTitle>
            Servis bulunamadı
          </AlertTitle>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Geri Dön</span>
          </Button>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Servis #{service?.id}</h2>
        </div>
          {/* Hide the edit button if the user doesn't own the service. */}
          {service?.user?.company?.id === loggedInUserCompanyId && (
              <Button variant={isEditing ? "default" : "outline"} onClick={handleEditClick}
                      className="w-full sm:w-auto">
                  {isEditing ? (
                      <>
                          <Check className="mr-2 h-4 w-4"/>
                          Kaydet
                      </>
                  ) : (
                      <>
                          <Pencil className="mr-2 h-4 w-4"/>
                          Düzenle
                      </>
                  )}
              </Button>
          )}

        <Badge className={statusMap[service.status.name]?.color || "bg-gray-100 text-gray-700"}>
          {statusMap[service.status.name]?.icon && (
              React.createElement(statusMap[service.status.name].icon, {
                className: "w-4 h-4 inline-block mr-1",
              })
          )}
          {service.status.name}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Araç Bilgileri</CardTitle>
            <CardDescription>Servis yapılan araç detayları</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Car className="h-5 w-5 text-muted-foreground mt-0.5"/>
              <div>
                <p className="font-medium">
                  {service?.vehicle.brand} {service?.vehicle.vehicle_model}
                </p>
                <p className="text-sm text-muted-foreground">Plaka: {service?.vehicle.license_plate}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{service?.user.name}</p>
                <p className="text-sm text-muted-foreground">{service?.user.phone}</p>
                <p className="text-sm text-muted-foreground">{service?.user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Servis Açıklaması</CardTitle>
                <CardDescription>Servis açıklaması</CardDescription>
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <Textarea
                        name="description"
                        value={editedServiceData.description || ""}
                        onChange={handleInputChange}
                        placeholder="Servis açıklaması"
                        className="resize-y"
                    />
                ) : (
                    <p>
                    {service?.description || "-"}
                    </p>
                )}
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Servis Bilgileri</CardTitle>
            <CardDescription>Servis zaman bilgileri</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Side */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <Label htmlFor="started_at" className="font-medium">Başlangıç Tarihi</Label>
                  {isEditing ? (
                      <Input
                          type="date"
                          name="started_at"
                          id="started_at"
                          value={editedServiceData.started_at?.split('T')[0] || ''}
                          onChange={handleInputChange}
                      />
                  ) : (
                      <p className="text-sm text-muted-foreground">{formatDateTime(service?.started_at)}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Bitiş Tarihi</p>
                  {service?.finished_at ? (
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(service.finished_at)}
                      </p>
                  ) : (
                      <p className="text-sm text-muted-foreground">Henüz tamamlanmadı</p>
                  )}

                </div>
              </div>

            </div>

            {/* Right Side */}
            <div className="flex items-start gap-3">
              <Newspaper className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="w-full">
                <p className="font-medium">Durum</p>
                {isEditing ? (
                    <select
                        name="status_id"
                        value={editedServiceData.status_id || service?.status.id}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {status.map((status) => (
                          <option key={status.id} value={status.id}>
                            {status.name}
                          </option>
                      ))}
                    </select>
                ) : (
                    <p className={`text-sm text-${service?.status.color}`}>
                      {service?.status.name}
                    </p>
                )}
              </div>
            </div>
          </CardContent>

        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Servis Kalemleri</CardTitle>
            <CardDescription>Serviste kullanılan ürün ve hizmetler</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Ürün/Hizmet Ekle</span>
                <span className="sm:hidden">Ekle</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[475px]">
              <DialogHeader>
                <DialogTitle>Servis Kalemi Ekle</DialogTitle>
                <DialogDescription>Servise yeni bir ürün veya hizmet ekleyin.</DialogDescription>
              </DialogHeader>
              <AddServiceItemForm
                serviceId={service.id}
                vehicleLicensePlate={service.vehicle.license_plate}
                onSuccess={handleAddItem}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                  <TableHead>Ürün/Hizmet</TableHead>
                  <TableHead className="hidden md:table-cell">Açıklama</TableHead>
                  <TableHead className="text-right">Miktar</TableHead>
                  <TableHead className="text-right">Birim Fiyat</TableHead>
                  <TableHead className="text-right">Toplam</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {service?.items?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    Henüz ürün veya hizmet eklenmemiş.
                  </TableCell>
                </TableRow>
              ) : (
                service?.items?.map((item) => {
                  const itemTotal = Number.parseFloat(item.price) * Number.parseFloat(item.quantity)
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{item.description || "-"}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(Number.parseFloat(item.price))}</TableCell>
                        <TableCell className="text-right">{formatCurrency(itemTotal)}</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div></div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Toplam</p>
            <p className="text-xl font-bold">{formatCurrency(calculateTotal())}</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
