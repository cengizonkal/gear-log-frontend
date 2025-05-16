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
import { useToast } from "@/components/ui/use-toast"

interface Brand {
  id: number
  name: string
}

interface Model {
  id: number
  name: string
  year: number | null
  engine_capacity: number | null
  brand_id: number
}

interface FuelType {
  id: number
  name: string
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
  
  fuelType: z.string({
    required_error: "Lütfen yakıt tipini seçiniz.",
  }),
  
  vin: z.string().optional().or(z.literal("")),
  year: z.string().optional().or(z.literal("")),
  engineCapacity: z.string().optional().or(z.literal("")),
  weight: z.string().optional().or(z.literal("")),
  mileage: z.string().optional().or(z.literal("")),

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
  const [models, setModels] = useState<Model[]>([])
  const [filteredModels, setFilteredModels] = useState<Model[]>([])
  const [fuelTypes, setFuelTypes] = useState<FuelType[]>([])
  const [selectedBrand, setSelectedBrand] = useState<string>("")
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      licensePlate: initialLicensePlate,
      brand: "",
      model: "",
      mileage: "",
      fuelType: "",
      vin: "",
      year: "",
      engineCapacity: "",
      weight: "",
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
    const fetchModels = async () => {
      try {
        const response = await apiService.models.getAll()
        setModels(response.data.data)
      } catch (err) {
        console.error("Failed to fetch models:", err)
      }
    }
    fetchModels()
  }, [])

  useEffect(() => {
    const fuelTypes = async () => {
      try {
        const response = await apiService.fuelTypes.getAll()
        setFuelTypes(response.data.data)
      } catch (err) {
        console.error("Failed to fetch fuel types:", err)
      }
    }
    fuelTypes()
  }, [])

  useEffect(() => {
    if (selectedBrand) {
      setFilteredModels(models.filter((m) => m.brand_id.toString() === selectedBrand))
    } else {
      setFilteredModels([])
    }
  }, [selectedBrand, models])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Prepare the payload for the backend
      const payload = {
        owner: {
          name: values.ownerName,
          phone: values.ownerPhone,
          email: values.ownerEmail || null,
        },
        vehicle: {
          license_plate: values.licensePlate,
          mileage: values.mileage ? parseInt(values.mileage, 10) : null,
          fuel_type_id: values.fuelType, // should be ID, ensure Select uses ID
          vin: values.vin,
          vehicle_model_id: values.model, // should be ID
          year: values.year ? parseInt(values.year, 10) : undefined,
          engine_capacity: values.engineCapacity ? parseInt(values.engineCapacity, 10) : undefined,
          weight: values.weight ? parseInt(values.weight, 10) : undefined,
        },
      }

      const response = await apiService.vehiclesWithOwner.create(payload)
      const message = response.data?.message || "Araç ve sahibi başarıyla kaydedildi!"
      toast({ description: message, variant: "default" })
      setSuccess(message)

      // Redirect to the vehicle details page after a short delay
      setTimeout(() => {
        router.push(`/vehicles/${values.licensePlate}`)
      }, 1500)
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Araç kaydı sırasında bir hata oluştu."
      toast({ description: errorMsg, variant: "destructive" })
      setError(errorMsg)
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
                      {filteredModels.map((model) => (
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
                      {fuelTypes.map((fuelType) => (
                        <SelectItem key={fuelType.id} value={fuelType.id.toString()}>
                          {fuelType.name}
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
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yıl</FormLabel>
                  <FormControl>
                    <Input placeholder="2020" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="engineCapacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motor Hacmi (cc)</FormLabel>
                  <FormControl>
                    <Input placeholder="1600" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ağırlık (kg)</FormLabel>
                  <FormControl>
                    <Input placeholder="1200" {...field} />
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
