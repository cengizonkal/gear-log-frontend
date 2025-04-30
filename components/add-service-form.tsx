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
import { apiService } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { RefreshCw, CheckCircle, RotateCw, Clock, CalendarIcon, Settings, User, X } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ServiceCreatePayload, ServiceStatus, Vehicle } from "@/types"; // Assuming you have these types defined

const FormSchema = z.object({
    vehicleId: z.string({ required_error: "Araç seçimi zorunludur." }),
    userId: z.string({ required_error: "Kullanıcı seçimi zorunludur." }),
    startedAt: z.date({ required_error: "Başlangıç tarihi zorunludur." }),
    finishedAt: z.date().optional(),
    status: z.string().optional(),
})

type AddServiceFormValues = z.infer<typeof FormSchema>

const colorMap = {
    amber: "bg-amber-100 text-amber-700 border-amber-300",
    green: "bg-green-100 text-green-700 border-green-300",
    blue: "bg-blue-100 text-blue-700 border-blue-300",
    red: "bg-red-100 text-red-700 border-red-300",
    purple: "bg-purple-100 text-purple-700 border-purple-300",
}

export function AddServiceForm() {
    const [vehicles, setVehicles] = useState([]);
    const [users, setUsers] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [licensePlate, setLicensePlate] = useState('');
    const { toast } = useToast();
    const router = useRouter();

    const handleCreateService = async (values: AddServiceFormValues) => {
        if (!licensePlate.trim()) {
            toast({
                variant: "destructive",
                title: "Hata!",
                description: "Lütfen bir plaka giriniz",
            });
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                vehicle_id: Number(values.vehicleId),
                user_id: Number(values.userId),
                started_at: formatDate(values.startedAt, "YYYY-MM-DD HH:mm"),
                finished_at: values.finishedAt
                    ? formatDate(values.finishedAt, "YYYY-MM-DD HH:mm")
                    : undefined,
                status: values.status,
            };

            await apiService.services.create(payload);

            toast({
                title: "Başarılı",
                description: "Servis kaydı başarıyla eklendi.",
            });

            router.refresh();
            form.reset();
            await fetchVehicles(licensePlate);
        } catch (error) {
            console.error("Service creation error:", error);
            toast({
                variant: "destructive",
                title: "Hata!",
                description: error.message || "Servis kaydı oluşturulurken bir hata oluştu.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchVehicles = async (plate: string): Promise<void> => {
        try {
            const response = await apiService.vehicles.getById(plate);
            setVehicles(response.data.data as Vehicle[]);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            toast({
                variant: "destructive",
                title: "Hata!",
                description: "Araç bilgileri alınırken bir hata oluştu.",
            });
        }
    };

    const fetchUsers = async (): Promise<void> => {
        try {
            const response = await apiService.users.getAll();
            setUsers(response.data.data as User[]);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast({
                variant: "destructive",
                title: "Hata!",
                description: "Kullanıcı bilgileri alınırken bir hata oluştu.",
            });
        }
    };

    const fetchStatuses = async (): Promise<void> => {
        setIsLoading(true);
        try {
            const response = await apiService.servicesStatuses.getAll();
            const statusData = extractStatusData(response);
            setStatuses(statusData.slice(0, 7));
        } catch (error) {
            console.error("Error fetching statuses:", error);
            setDefaultStatuses();
        } finally {
            setIsLoading(false);
        }
    };

// Helper functions
    const extractStatusData = (response: any): ServiceStatus[] => {
        if (response.data && Array.isArray(response.data)) {
            return response.data;
        }
        if (response.data?.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }
        if (Array.isArray(response)) {
            return response;
        }
        return [];
    };

    const setDefaultStatuses = (): void => {
        setStatuses([
            { id: "pending", name: "Beklemede", color: "amber" },
            { id: "in-progress", name: "İşlemde", color: "blue" },
            { id: "completed", name: "Tamamlandı", color: "green"},
            { id: "part-waiting", name: "Parça Bekliyor", color: "red" },
            { id: "external-service", name: "Dış Servis", color: "purple" },
            { id: "approval-waiting", name: "Onay Bekliyor", color: "amber" },
            { id: "cancelled", name: "İptal Edildi", color: "red" },
        ]);
    };

    // Initialize form
    const form = useForm<AddServiceFormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            vehicleId: "",
            userId: "",
            startedAt: new Date(),
            finishedAt: undefined,
            status: "pending"
        }
    });

// Initial data fetch
    useEffect(() => {
        const initializeData = async () => {
            await Promise.all([
                fetchVehicles(licensePlate),
                fetchUsers(),
                fetchStatuses(),
            ]);
        };
        initializeData();
    }, []);

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
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
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
                                                else if (status.name.toLowerCase().includes("İptal Edildi")) StatusIcon = X
                                                else StatusIcon = RefreshCw

                                                return (
                                                    <ToggleGroupItem
                                                        key={status.id}
                                                        value={status.id.toString()}
                                                        className={`flex flex-col sm:flex-row items-center justify-center gap-1 p-3 data-[state=on]:${
                                                            colorMap[status.color] || "bg-gray-100 text-gray-700 border-gray-300"
                                                        }`}
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
