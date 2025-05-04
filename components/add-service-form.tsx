"use client"

import { CommandItem } from "@/components/ui/command"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn, formatDate } from "@/lib/utils"
import { apiService } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
    RefreshCw,
    CheckCircle,
    RotateCw,
    Clock,
    CalendarIcon,
    Settings,
    User,
    X,
    Check,
    ChevronDown,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from "@/components/ui/command"
import dayjs from "dayjs"

const FormSchema = z.object({
    vehicleId: z.string({ required_error: "Araç seçimi zorunludur." }),
    userId: z.string({ required_error: "Kullanıcı seçimi zorunludur." }),
    startedAt: z.date({ required_error: "Başlangıç tarihi zorunludur." }),
    finishedAt: z.date().optional(),
    status: z.string().optional(),
})

interface CustomerProps {
    id: number
    name: string
    phone: string
}

interface VehicleProps {
    id: number
    license_plate: string
}

interface ServiceStatus {
    id: number
    name: string
    color: string
}

type AddServiceFormValues = z.infer<typeof FormSchema>

const colorMap = {
    amber: "bg-amber-100 text-amber-700 border-amber-300",
    green: "bg-green-100 text-green-700 border-green-300",
    blue: "bg-blue-100 text-blue-700 border-blue-300",
    red: "bg-red-100 text-red-700 border-red-300",
    purple: "bg-purple-100 text-purple-700 border-purple-300",
}

export function AddServiceForm({ onClose }: { onClose?: () => void }) {
    const [vehicles, setVehicles] = useState<VehicleProps[]>([])
    const [filteredVehicles, setFilteredVehicles] = useState<VehicleProps[]>([])
    const [customers, setCustomers] = useState<CustomerProps[]>([])
    const [filteredCustomers, setFilteredCustomers] = useState<CustomerProps[]>([])
    const [statuses, setStatuses] = useState<ServiceStatus[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [licensePlate, setLicensePlate] = useState("")
    const { toast } = useToast()
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)

    const handleCreateService = async (values: AddServiceFormValues) => {
        setIsLoading(true)
        try {
            const payload = {
                vehicle_id: Number(values.vehicleId),
                started_at: dayjs(values.startedAt).format("YYYY-MM-DD HH:mm"),
                finished_at: values.finishedAt ? dayjs(values.finishedAt).format("YYYY-MM-DD HH:mm") : null,
                status_id: Number(values.status),
            }

            // get selected vehicle's license plate
            const selectedVehicle = filteredVehicles.find((v) => v.id.toString() === values.vehicleId)
            if (!selectedVehicle) {
                throw new Error("Seçili araç bulunamadı.")
            }

            await apiService.vehicles.addService(selectedVehicle.license_plate, payload)

            toast({
                title: "Başarılı",
                description: "Servis kaydı başarıyla eklendi.",
            })

            if (onClose) {
                onClose()
            }

            router.refresh()
            form.reset()
        } catch (error: any) {
            console.error("Service creation error:", error)
            toast({
                variant: "destructive",
                title: "Hata!",
                description: error.message || "Servis kaydı oluşturulurken bir hata oluştu.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setIsLoading(true)
                const response = await apiService.owners.getAll() // Assuming you have a customers API endpoint
                setCustomers(response.data.data)
                setFilteredCustomers(response.data.data)
            } catch (err) {
                console.error("Failed to fetch customers:", err)
                setError("Müşterileri yüklerken bir hata oluştu.")
            } finally {
                setIsLoading(false)
            }
        }

        const fetchStatuses = async (): Promise<void> => {
            setIsLoading(true)
            try {
                const response = await apiService.servicesStatuses.getAll()
                const statusData = extractStatusData(response)
                setStatuses(statusData.slice(0, 7))
            } catch (error) {
                console.error("Error fetching statuses:", error)
                setDefaultStatuses()
            } finally {
                setIsLoading(false)
            }
        }

        fetchStatuses()
    }, [])

    const extractStatusData = (response: any): ServiceStatus[] => {
        if (response.data && Array.isArray(response.data)) {
            return response.data
        }
        if (response.data?.data && Array.isArray(response.data.data)) {
            return response.data.data
        }
        if (Array.isArray(response)) {
            return response
        }
        return []
    }

    const setDefaultStatuses = (): void => {
        setStatuses([
            { id: "pending", name: "Beklemede", color: "amber" },
            { id: "in-progress", name: "İşlemde", color: "blue" },
            { id: "completed", name: "Tamamlandı", color: "green" },
            { id: "part-waiting", name: "Parça Bekliyor", color: "red" },
            { id: "external-service", name: "Dış Servis", color: "purple" },
            { id: "approval-waiting", name: "Onay Bekliyor", color: "amber" },
            { id: "cancelled", name: "İptal Edildi", color: "red" },
        ])
    }

    // Initialize form
    const form = useForm<AddServiceFormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            vehicleId: "",
            userId: "",
            startedAt: new Date(),
            finishedAt: undefined,
            status: "pending",
        },
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateService)} className="space-y-6  max-w-3xl">
                <FormField
                    control={form.control}
                    name="vehicleId"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Araç</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                        >
                                            {field.value
                                                ? filteredVehicles.find((v) => v.id.toString() === field.value)?.license_plate.toUpperCase()
                                                : "Araç seçiniz"}
                                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput
                                            placeholder="Plaka giriniz. (Min. 3 karakter)"
                                            onValueChange={async (search) => {
                                                if (search.length >= 3) {
                                                    try {
                                                        setIsLoading(true)
                                                        const res = await apiService.vehicles.search(search)
                                                        setFilteredVehicles(res.data.data || [])
                                                    } catch (err) {
                                                        console.error("Arac arama hatası:", err)
                                                        setFilteredVehicles([])
                                                    } finally {
                                                        setIsLoading(false)
                                                    }
                                                } else {
                                                    setFilteredVehicles([])
                                                }
                                            }}
                                        />
                                        <CommandEmpty>Araç bulunamadı.</CommandEmpty>
                                        <CommandGroup>
                                            <CommandList>
                                                {filteredVehicles.map((vehicle) => (
                                                    <CommandItem
                                                        key={vehicle.id}
                                                        value={vehicle.license_plate}
                                                        onSelect={() => {
                                                            form.setValue("vehicleId", vehicle.id.toString())
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                vehicle.id.toString() === field.value ? "opacity-100" : "opacity-0",
                                                            )}
                                                        />
                                                        {vehicle.license_plate.toUpperCase()}
                                                    </CommandItem>
                                                ))}
                                            </CommandList>
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="startedAt"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Başlangıç Tarihi</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                            >
                                                {field.value ? formatDate(field.value, "YYYY-MM-DD HH:mm") : <span>Tarih Seç</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="finishedAt"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Bitiş Tarihi</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                            >
                                                {field.value ? formatDate(field.value, "YYYY-MM-DD HH:mm") : <span>Tarih Seç</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Separator />

                <div className="flex flex-col gap-4">
                    <h2 className="text-lg font-medium">Servis Durumu</h2>
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <ToggleGroup
                                        onValueChange={(value) => {
                                            if (value) field.onChange(value)
                                        }}
                                        value={field.value}
                                        type="single"
                                        className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
                                    >
                                        {isLoading ? (
                                            <div className="col-span-full text-center py-4">
                                                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                                                <span>Durumlar yükleniyor...</span>
                                            </div>
                                        ) : statuses.length > 0 ? (
                                            statuses.map((status) => {
                                                // Determine which icon to show based on status name
                                                let StatusIcon = Clock
                                                if (status.name.toLowerCase().includes("beklemede")) StatusIcon = Clock
                                                else if (status.name.toLowerCase().includes("devam ediyor")) StatusIcon = RotateCw
                                                else if (status.name.toLowerCase().includes("tamamlandı")) StatusIcon = CheckCircle
                                                else if (status.name.toLowerCase().includes("parça bekleniyor")) StatusIcon = Clock
                                                else if (status.name.toLowerCase().includes("dış servis")) StatusIcon = Settings
                                                else if (status.name.toLowerCase().includes("onay bekleniyor")) StatusIcon = User
                                                else if (status.name.toLowerCase().includes("iptal edildi")) StatusIcon = X
                                                else StatusIcon = RefreshCw

                                                const statusId = status.id.toString()
                                                const isSelected = field.value === statusId

                                                return (
                                                    <ToggleGroupItem
                                                        key={statusId}
                                                        value={statusId}
                                                        aria-label={status.name}
                                                        data-state={isSelected ? "on" : "off"}
                                                        className={cn(
                                                            "flex flex-col sm:flex-row items-center justify-center gap-1 p-3 border rounded-md transition-colors",
                                                            isSelected
                                                                ? colorMap[status.color as keyof typeof colorMap] ||
                                                                "bg-gray-100 text-gray-700 border-gray-300"
                                                                : "bg-white hover:bg-gray-50",
                                                        )}
                                                    >
                                                        <StatusIcon className="w-4 h-4" />
                                                        <span className="text-xs sm:text-sm">{status.name}</span>
                                                    </ToggleGroupItem>
                                                )
                                            })
                                        ) : (
                                            <div className="col-span-full text-center py-2">Yükleniyor...</div>
                                        )}
                                    </ToggleGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-center">
                    <Button type="submit">Kaydet</Button>
                </div>
            </form>
        </Form>
    )
}
