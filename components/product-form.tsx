"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { apiService } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Ürün/hizmet adı en az 2 karakter olmalıdır.",
  }),
  description: z.string().optional(),
  price: z.string().min(1, {
    message: "Fiyat gereklidir.",
  }),
  type: z.string({
    required_error: "Lütfen tür seçiniz.",
  }),
})

interface ProductFormProps {
  initialData?: {
    id: number
    name: string
    description: string | null
    price: string
    default_price: string
  } | null
  onSuccess?: (data: any) => void
}

export function ProductForm({ initialData, onSuccess }: ProductFormProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.default_price ? String(initialData.default_price) : "",
      type: initialData?.description?.includes("Hizmet") ? "service" : "product",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user?.company?.id) {
      setError("Şirket bilgisi bulunamadı.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const itemData = {
        company_id: user.company.id,
        name: values.name,
        description: values.description || null,
        price: Number.parseFloat(values.price),
      }

      let response

      if (initialData) {
        // Update existing item
        response = await apiService.companies.updateItem(user.company.id, initialData.id, itemData)
      } else {
        // Create new item
        response = await apiService.companies.createItem(user.company.id, itemData)
      }

      if (onSuccess) {
        onSuccess(response.data.data)
      }
    } catch (err: any) {
      console.error("Form submission error:", err)
      setError(err.response?.data?.message || "Ürün/hizmet kaydedilirken bir hata oluştu.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ürün/Hizmet Adı</FormLabel>
              <FormControl>
                <Input placeholder="Motor Yağı" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Açıklama</FormLabel>
              <FormControl>
                <Textarea placeholder="Ürün veya hizmet açıklaması" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tür</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Tür seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="product">Ürün</SelectItem>
                  <SelectItem value="service">Hizmet</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fiyat (₺)</FormLabel>
              <FormControl>
                <Input placeholder="450" type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialData ? "Güncelleniyor..." : "Ekleniyor..."}
            </>
          ) : initialData ? (
            "Güncelle"
          ) : (
            "Ekle"
          )}
        </Button>
      </form>
    </Form>
  )
}
