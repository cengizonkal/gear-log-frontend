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
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Ürün/hizmet adı en az 2 karakter olmalıdır.",
  }),
  description: z.string().optional(),

  type: z.string({
    required_error: "Lütfen tür seçiniz.",
  }),
})

interface ProductFormProps {
  initialData?: {
    id: number
    name: string
    description: string | null
    
  } | null
  onSuccess?: (data: any) => void
}

export function ProductForm({ initialData, onSuccess }: ProductFormProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      
      type: initialData?.description?.includes("Hizmet") ? "service" : "product",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user?.company_id) {
      setError("Şirket bilgisi bulunamadı.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const itemData = {
        company_id: user.company_id,
        name: values.name,
        description: values.description || null,
      }

      let response

      if (initialData) {
        // Update existing item
        response = await apiService.companies.updateItem(user.company_id, initialData.id, itemData)
      } else {
        // Create new item
        response = await apiService.companies.createItem(user.company_id, itemData)
      }

      // Use server message if available
      const serverMsg = response.data?.message || (initialData ? "Ürün/Hizmet güncellendi" : "Ürün/Hizmet eklendi")
      toast({
        title: serverMsg,
        description: `“${values.name}” başarıyla ${initialData ? "güncellendi" : "eklendi"}.`,
      })

      if (onSuccess) {
        onSuccess(response.data.item)
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
