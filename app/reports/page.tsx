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
import {useState} from "react";

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
        <div className="flex items-center justify-center min-h-screen w-full">
            <div className="w-full max-w-6xl p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8">
                <div className="mt-2">
                    <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold mb-3 xs:mb-4 sm:mb-5 text-center">
                        Rapor Oluştur
                    </h2>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 xs:space-y-4 sm:space-y-5 max-w-2xl mx-auto">
                            <div className="flex flex-col gap-3 xs:gap-4 sm:flex-row sm:gap-5">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({field}) => (
                                        <FormItem className="flex flex-col flex-1">
                                            <FormLabel className="text-xs xs:text-sm sm:text-base">
                                                Başlangıç Tarihi
                                            </FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full h-10 xs:h-9 sm:h-10 pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "dd/MM/yyyy")
                                                            ) : (
                                                                <span className="text-xs xs:text-sm sm:text-base">Tarih Seçin</span>
                                                            )}
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
                                            <FormMessage className="text-xs"/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({field}) => (
                                        <FormItem className="flex flex-col flex-1">
                                            <FormLabel className="text-xs xs:text-sm sm:text-base">
                                                Bitiş Tarihi
                                            </FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full h-10 xs:h-9 sm:h-10 pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "dd/MM/yyyy")
                                                            ) : (
                                                                <span className="text-xs xs:text-sm sm:text-base">Tarih Seçin</span>
                                                            )}
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
                                            <FormMessage className="text-xs"/>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="reportType"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel className="text-xs xs:text-sm sm:text-base">
                                            Rapor Türü
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-10 xs:h-9 sm:h-10">
                                                    <SelectValue
                                                        placeholder="Rapor Türü Seçin"
                                                        className="text-xs xs:text-sm sm:text-base"
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="gelir" className="text-xs xs:text-sm sm:text-base">
                                                    Gelir Raporu
                                                </SelectItem>
                                                <SelectItem value="genel" className="text-xs xs:text-sm sm:text-base">
                                                    Genel Rapor
                                                </SelectItem>
                                                <SelectItem value="servis" className="text-xs xs:text-sm sm:text-base">
                                                    Servis Raporu
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-xs"/>
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-center">
                                <Button
                                    type="submit"
                                    className="w-full sm:w-auto h-10 xs:h-9 sm:h-10 text-xs xs:text-sm sm:text-base"
                                >
                                    Rapor Oluştur
                                </Button>
                            </div>
                        </form>
                    </Form>

                    <div className="mt-4 xs:mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-5 max-w-4xl mx-auto">
                        <Card className="p-3 xs:p-4 sm:p-5">
                            <CardHeader className="p-0 pb-2 xs:pb-3 sm:pb-4">
                                <CardTitle className="text-xs xs:text-sm sm:text-base">
                                    Tamamlanan Servisler
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <p className="text-lg xs:text-xl sm:text-2xl font-bold">150</p>
                            </CardContent>
                        </Card>
                        <Card className="p-3 xs:p-4 sm:p-5">
                            <CardHeader className="p-0 pb-2 xs:pb-3 sm:pb-4">
                                <CardTitle className="text-xs xs:text-sm sm:text-base">
                                    Tüm Servisler
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <p className="text-lg xs:text-xl sm:text-2xl font-bold">200</p>
                            </CardContent>
                        </Card>
                        <Card className="p-3 xs:p-4 sm:p-5">
                            <CardHeader className="p-0 pb-2 xs:pb-3 sm:pb-4">
                                <CardTitle className="text-xs xs:text-sm sm:text-base">
                                    Servislerin Toplam Ücreti
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <p className="text-lg xs:text-xl sm:text-2xl font-bold">₺50,000</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-4 xs:mt-5 sm:mt-6 max-w-5xl mx-auto">
                        <div className="overflow-x-auto">
                            <div className="min-w-[300px] sm:min-w-[400px] md:min-w-[500px] lg:min-w-[600px]">
                                <ResponsiveContainer
                                    width="100%"
                                    height={300}
                                    className="text-xs sm:text-sm"
                                >
                                    <BarChart
                                        data={data}
                                        margin={{
                                            top: 5,
                                            right: 5,
                                            left: 0,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3"/>
                                        <XAxis
                                            dataKey="name"
                                            tick={{fontSize: '0.65rem sm:text-xs md:text-sm'}}
                                        />
                                        <YAxis
                                            tickFormatter={(value) => `${value}₺`}
                                            tick={{fontSize: '0.65rem sm:text-xs md:text-sm'}}
                                        />
                                        <Tooltip
                                            formatter={(value) => [`${value}₺`, "Gelir"]}
                                            contentStyle={{
                                                fontSize: '0.75rem sm:text-xs md:text-sm',
                                                padding: '4px 8px',
                                                borderRadius: '6px'
                                            }}
                                        />
                                        <Legend
                                            wrapperStyle={{
                                                paddingTop: '10px',
                                                fontSize: '0.75rem sm:text-xs md:text-sm'
                                            }}
                                        />
                                        <Bar
                                            dataKey="Gelir"
                                            fill="#82ca9d"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center mt-3 xs:mt-4 sm:mt-5">
                        <Button
                            className="w-full sm:w-auto h-10 xs:h-9 sm:h-10 text-xs xs:text-sm sm:text-base"
                        >
                            PDF İndir
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}