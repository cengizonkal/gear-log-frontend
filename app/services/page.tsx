"use client"

import React, {useState, useEffect} from "react"
import {Button} from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {Badge} from "@/components/ui/badge"
import {CheckCircle, Clock, Eye, Loader2, Plus, RotateCw, Search, Settings, User, X} from "lucide-react"
import Link from "next/link"
import {Alert, AlertDescription} from "@/components/ui/alert"
import {AddServiceForm} from "@/components/add-service-form"
import {formatDate} from "@/lib/utils"
import {apiService} from "@/lib/api"



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
    status: {
        name: string
        color: string
    }
}

interface StatusProps {
    id: number
    name: string
    color: string
}

const statusMap = {
    "Beklemede": { color: "bg-amber-500 text-white", icon: Clock },
    "Devam Ediyor": { color: "bg-blue-500 text-white", icon: RotateCw },
    "Tamamlandı": { color: "bg-green-500 text-white", icon: CheckCircle },
    "Parça Bekleniyor": { color: "bg-orange-500 text-white", icon: Clock },
    "Dış Servis": { color: "bg-gray-500 text-white", icon: Settings },
    "Onay Bekleniyor": { color: "bg-purple-500 text-white", icon: User },
    "İptal Edildi": { color: "bg-red-500 text-white", icon: X },
} ;

export default function ServicesPage() {
    const [services, setServices] = useState<ServiceProps[]>([])
    const [statuses, setStatuses] = useState<StatusProps[]>([])
    const [filteredServices, setFilteredServices] = useState<ServiceProps[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)

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

    useEffect(() => {


        const fetchStatuses = async () => {
            try {
                setIsLoading(true)
                const response = await apiService.servicesStatuses.getAll()
                setStatuses(response.data.data)
            } catch (err) {
                console.error("Failed to fetch statuses:", err)
                setError("Durumları yüklerken bir hata oluştu.")
            }
        }

        fetchServices()
        fetchStatuses()
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
                    service.status.name.toString().includes(query) ||
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
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary"/>
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
                            <Plus className="mr-2 h-4 w-4"/>
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
                            onClose={() => setIsDialogOpen(false)}
                            onSuccess={() => {
                                setIsDialogOpen(false);
                                fetchServices(); // Refresh the table
                            }}
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
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
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
                                    <TableHead className="">Araç</TableHead>
                                    <TableHead className="">Makinist</TableHead>
                                    <TableHead className="">Tarih</TableHead>
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
                                            <TableCell>{service.vehicle.license_plate.toUpperCase()}</TableCell>
                                            <TableCell className="">
                                                {service.vehicle.brand} {service.vehicle.vehicle_model}
                                            </TableCell>
                                            <TableCell className="">{service.user.name}</TableCell>
                                            <TableCell className="">
                                                {formatDate(service.started_at)}
                                            </TableCell>
                                            <TableCell className="">
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
                                                        <Eye className="h-4 w-4"/>
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
