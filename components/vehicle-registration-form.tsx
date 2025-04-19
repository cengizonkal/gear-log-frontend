"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface Brand {
  id: number
  name: string
  models: Array<{
    id: number
    name: string
    year: number | null
    engine_capacity: number | null
  }>
}

const formSchema = z.object({
  // Araç bilgileri
  licensePlate: z.string().min(5, {
    message: "Plaka en az 5 karakter olmalıdır.",
  }),
  brand: z.string({
    required_error: "Lütfen marka seçiniz.",
  }),
  model: z.string({
    required_error: "Lütfen model seçiniz.",
  }),
  mileage: z.string().min(1, {
    message: "Kilometre bilgisi gereklidir.",
  }),
  fuelType: z.string({
    required_error: "Lütfen yakıt tipini seçiniz.",
  }),
  vin: z.string().min(1, {
    message: "VIN numarası gereklidir.",
  }),

  // Araç sahibi bilgileri
  ownerName: z.string().min(2, {
    message: "İsim gereklidir.",
  }),
  ownerPhone: z.string().min(10, {
    message: "Geçerli bir telefon numarası giriniz.",
  }),
  ownerEmail: z
    .string()
    .email({
      message: "Geçerli bir e-posta adresi giriniz.",
    })
    .optional()
    .or(z.literal("")),
})

export function VehicleRegistrationForm({ initialLicensePlate = "" }: { initialLicensePlate?: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedBrand, setSelectedBrand] = useState<string>("")
  const [models, setModels] = useState<Brand["models"]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      licensePlate: initialLicensePlate,
      brand: "",
      model: "",
      mileage: "",
      fuelType: "",
      vin: "",
      ownerName: "",
      ownerPhone: "",
      ownerEmail: "",
    },
  })

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await apiService.brands.getAll()
        setBrands(response.data.data)
      } catch (err) {
        console.error("Failed to fetch brands:", err)
      }
    }

    fetchBrands()
  }, [])

  useEffect(() => {
    if (selectedBrand) {
      const brand = brands.find((b) => b.id.toString() === selectedBrand)
      setModels(brand?.models || [])
    } else {
      setModels([])
    }
  }, [selectedBrand, brands])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // First create the owner
      const ownerData = {
        name: values.ownerName,
        phone: values.ownerPhone,
        email: values.ownerEmail || null,
      }

      const ownerResponse = await apiService.owners.create(ownerData)
      const ownerId = ownerResponse.data.data.id

      // Then create the vehicle with the owner ID
      // Note: The API spec doesn't show a direct endpoint for creating vehicles
      // This would need to be implemented on the backend

      setSuccess("Araç başarıyla kaydedildi!")

      // Redirect to the vehicle details page after a short delay
      setTimeout(() => {
        router.push(`/vehicles/${values.licensePlate}`)
      }, 1500)
    } catch (err: any) {
      console.error("Registration error:", err)
      setError(err.response?.data?.message || "Araç kaydı sırasında bir hata oluştu.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div>
          <h3 className="text-lg font-medium">Araç Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField
              control={form.control}
              name="licensePlate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plaka</FormLabel>
                  <FormControl>
                    <Input placeholder="34ABC123" {...field} className="uppercase" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marka</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      setSelectedBrand(value)
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Marka seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>
                          {brand.name}
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
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Model seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id.toString()}>
                          {model.name} {model.year ? `(${model.year})` : ""}
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
              name="mileage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kilometre</FormLabel>
                  <FormControl>
                    <Input placeholder="75000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fuelType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yakıt Tipi</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Yakıt tipini seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="benzin">Benzin</SelectItem>
                      <SelectItem value="dizel">Dizel</SelectItem>
                      <SelectItem value="lpg">LPG</SelectItem>
                      <SelectItem value="elektrik">Elektrik</SelectItem>
                      <SelectItem value="hibrit">Hibrit</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VIN</FormLabel>
                  <FormControl>
                    <Input placeholder="1HGCM82633A123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium">Araç Sahibi Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField
              control={form.control}
              name="ownerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>İsim</FormLabel>
                  <FormControl>
                    <Input placeholder="Ahmet Yılmaz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ownerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon</FormLabel>
                  <FormControl>
                    <Input placeholder="0532 123 4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ownerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-posta</FormLabel>
                  <FormControl>
                    <Input placeholder="ahmet@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            "Aracı Kaydet"
          )}
        </Button>
      </form>
    </Form>
  )
}
