"use client";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {cn} from "@/lib/utils";
import {format} from "date-fns";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import React, {useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Plus} from "lucide-react";
import {AddOwnerForm} from "@/components/add-owner-form";

const reportFormSchema = z.object({
    startDate: z.date({
        required_error: "Başlangıç Tarihi zorunludur.",
    }),
    endDate: z.date({
        required_error: "Bitiş Tarihi zorunludur.",
    }),
    reportType: z.string({
        required_error: "Rapor Türü zorunludur.",
    }),
});

const data = [
    {name: "Oca", Gelir: 4000},
    {name: "Şub", Gelir: 3000},
    {name: "Mar", Gelir: 2000},
    {name: "Nis", Gelir: 2780},
    {name: "May", Gelir: 1890},
    {name: "Haz", Gelir: 2390},
    {name: "Tem", Gelir: 3490},
    {name: "Ağu", Gelir: 3490},
    {name: "Eyl", Gelir: 3490},
    {name: "Eki", Gelir: 3490},
    {name: "Kas", Gelir: 3490},
    {name: "Ara", Gelir: 3490},
];

export default function ReportsPage() {
    const [selectedTab, setSelectedTab] = useState("rapor-olusturma");
    const form = useForm<z.infer<typeof reportFormSchema>>({
        resolver: zodResolver(reportFormSchema),
        defaultValues: {
            startDate: new Date(),
            endDate: new Date(),
            reportType: "",
        },
    });

    function onSubmit(values: z.infer<typeof reportFormSchema>) {
        console.log(values);
    }

    return (
        <div className="w-full max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Rapor</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filtreleme</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Başlangıç Tarihi */}
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Başlangıç Tarihi</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                                            {field.value ? format(field.value, "dd/MM/yyyy") : "Tarih Seçin"}
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Bitiş Tarihi */}
                                <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bitiş Tarihi</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                                            {field.value ? format(field.value, "dd/MM/yyyy") : "Tarih Seçin"}
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Rapor Türü */}
                                <FormField
                                    control={form.control}
                                    name="reportType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rapor Türü</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Rapor Türü Seçin" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="gelir">Gelir Raporu</SelectItem>
                                                    <SelectItem value="genel">Genel Rapor</SelectItem>
                                                    <SelectItem value="servis">Servis Raporu</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit">
                                    Raporu Oluştur
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Rapor Kartları */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Tamamlanan Servisler</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">150</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Tüm Servisler</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">200</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Servislerin Toplam Ücreti</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₺50,000</div>
                    </CardContent>
                </Card>
            </div>

            {/* Grafik */}
            <Card>
                <CardHeader>
                    <CardTitle>Gelir Grafiği</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full overflow-x-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => `${value}₺`} />
                                <Tooltip formatter={(value) => [`${value}₺`, "Gelir"]} />
                                <Legend />
                                <Bar dataKey="Gelir" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* PDF Butonu */}
            <div className="flex justify-end">
                <Button variant="outline">
                    PDF İndir
                </Button>
            </div>
        </div>

    );
}