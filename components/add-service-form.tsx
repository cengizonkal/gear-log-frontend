"use client"

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
import { CalendarIcon } from "lucide-react"
import { apiService } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { RefreshCw, CheckCircle, RotateCw, Clock, X } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const FormSchema = z.object({
    vehicleId: z.string({ required_error: "Araç seçimi zorunludur." }),
    userId: z.string({ required_error: "Kullanıcı seçimi zorunludur." }),
    startedAt: z.date({ required_error: "Başlangıç tarihi zorunludur." }),
    finishedAt: z.date().optional(),
    status: z.string().optional(),
})

type AddServiceFormValues = z.infer<typeof FormSchema>

export function AddServiceForm() {
    const router = useRouter()
    const { toast } = useToast()
    const [vehicles, setVehicles] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])

    const form = useForm<AddServiceFormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            vehicleId: "",
            userId: "",
            startedAt: new Date(),
            status: "pending",
        },
    })

    const handleCreateService = async (values: AddServiceFormValues) => {
        try {
            await apiService.services.create({
                vehicle_id: Number(values.vehicleId),
                user_id: Number(values.userId),
                started_at: formatDate(values.startedAt, "YYYY-MM-DD HH:mm"),
                finished_at: values.finishedAt ? formatDate(values.finishedAt, "YYYY-MM-DD HH:mm") : undefined,
                status: values.status,
            })
            toast({
                title: "Başarılı",
                description: "Servis kaydı başarıyla eklendi.",
            })
            router.refresh()
            form.reset()
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Hata!",
                description: "Servis kaydı oluşturulurken bir hata oluştu.",
            })
        }
    }

    useEffect(() => {
        const fetchVehicles = async () => {
            const response = await apiService.vehicles.getAll()
            setVehicles(response.data.data)
        }
        const fetchUsers = async () => {
            const response = await apiService.users.getAll()
            setUsers(response.data.data)
        }
        fetchVehicles()
        fetchUsers()
    }, [])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateService)} className="space-y-6  max-w-3xl">
                <FormField
                    control={form.control}
                    name="vehicleId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Araç</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Araç seçiniz" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {vehicles.map((vehicle) => (
                                        <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                                            {vehicle.brand} {vehicle.vehicle_model} - {vehicle.license_plate}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Kullanıcı</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Kullanıcı seçiniz" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id.toString()}>
                                            {user.name} - {user.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex flex-col md:flex-row gap-4 justify-center">
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
                                                className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
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
                                                className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
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
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        type="multiple"
                                        className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2"
                                    >
                                        <ToggleGroupItem
                                            value="pending"
                                            className="flex flex-col sm:flex-row items-center justify-center gap-1 p-3 data-[state=on]:bg-amber-100 data-[state=on]:text-amber-700 data-[state=on]:border-amber-300"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            <span className="text-xs sm:text-sm">Beklemede</span>
                                        </ToggleGroupItem>
                                        <ToggleGroupItem
                                            value="completed"
                                            className="flex flex-col sm:flex-row items-center justify-center gap-1 p-3 data-[state=on]:bg-green-100 data-[state=on]:text-green-700 data-[state=on]:border-green-300"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            <span className="text-xs sm:text-sm">Tamamlandı</span>
                                        </ToggleGroupItem>
                                        <ToggleGroupItem
                                            value="returned"
                                            className="flex flex-col sm:flex-row items-center justify-center gap-1 p-3 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700 data-[state=on]:border-blue-300"
                                        >
                                            <RotateCw className="w-4 h-4" />
                                            <span className="text-xs sm:text-sm">İade Edildi</span>
                                        </ToggleGroupItem>
                                        <ToggleGroupItem
                                            value="waiting-for-approval"
                                            className="flex flex-col sm:flex-row items-center justify-center gap-1 p-3 data-[state=on]:bg-purple-100 data-[state=on]:text-purple-700 data-[state=on]:border-purple-300"
                                        >
                                            <Clock className="w-4 h-4" />
                                            <span className="text-xs sm:text-sm">Onay Bekliyor</span>
                                        </ToggleGroupItem>
                                        <ToggleGroupItem
                                            value="cancelled"
                                            className="flex flex-col sm:flex-row items-center justify-center gap-1 p-3 data-[state=on]:bg-red-100 data-[state=on]:text-red-700 data-[state=on]:border-red-300"
                                        >
                                            <X className="w-4 h-4" />
                                            <span className="text-xs sm:text-sm">İptal Edildi</span>
                                        </ToggleGroupItem>
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
