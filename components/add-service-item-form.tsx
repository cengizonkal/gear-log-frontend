"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  item_id: z.string({
    required_error: "Lütfen bir ürün/hizmet seçin.",
  }),
  quantity: z.string().min(1, {
    message: "Miktar gereklidir.",
  }),
  price: z.string().min(1, {
    message: "Fiyat gereklidir.",
  }),
})

interface AddServiceItemFormProps {
  serviceId: number
  vehicleLicensePlate: string
  onSuccess?: (data: any) => void
}

interface ItemOption {
  id: number
  name: string
  description: string | null
  default_price: string
}

export function AddServiceItemForm({ serviceId, vehicleLicensePlate, onSuccess }: AddServiceItemFormProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<ItemOption[]>([])
  const [selectedItem, setSelectedItem] = useState<ItemOption | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item_id: "",
      quantity: "1",
      price: "",
    },
  })

  useEffect(() => {
    const fetchItems = async () => {
      if (!user?.company?.id) return

      try {
        const response = await apiService.companies.getItems(user.company.id)
        setItems(response.data.data)
      } catch (err) {
        console.error("Failed to fetch items:", err)
        setError("Ürün ve hizmetleri yüklerken bir hata oluştu.")
      }
    }

    fetchItems()
  }, [user])

  // Update price when item is selected
  useEffect(() => {
    if (selectedItem) {
      form.setValue("price", selectedItem.default_price)
    }
  }, [selectedItem, form])

  const handleItemChange = (itemId: string) => {
    const item = items.find((i) => i.id.toString() === itemId)
    setSelectedItem(item || null)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)

    try {
      const itemData = {
        item_id: Number.parseInt(values.item_id),
        quantity: Number.parseInt(values.quantity),
        price: Number.parseFloat(values.price),
      }

      const response = await apiService.services.addItem(vehicleLicensePlate, serviceId, itemData)

      if (onSuccess && selectedItem) {
        // Create a mock response that matches the expected format
        const newItem = {
          id: selectedItem.id,
          name: selectedItem.name,
          description: selectedItem.description,
          quantity: values.quantity,
          price: values.price,
        }
        onSuccess(newItem)
      }

      form.reset()
    } catch (err: any) {
      console.error("Form submission error:", err)
      setError(err.response?.data?.message || "Ürün/hizmet eklenirken bir hata oluştu.")
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
          name="item_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ürün/Hizmet</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value)
                  handleItemChange(value)
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Ürün/Hizmet seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name}
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
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Miktar</FormLabel>
              <FormControl>
                <Input type="number" min="1" step="1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Birim Fiyat (₺)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Ekleniyor...
            </>
          ) : (
            "Ekle"
          )}
        </Button>
      </form>
    </Form>
  )
}
