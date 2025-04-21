import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { apiService } from "@/lib/api"

const customerFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  phone: z.string().min(10, {
    message: "Phone must be at least 10 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  address: z.string().optional(),
})

type CustomerFormValues = z.infer<typeof customerFormSchema>

interface AddOwnerFormProps {
  defaultValues?: Partial<CustomerFormValues>
}

export function AddOwnerForm({ defaultValues }: AddOwnerFormProps) {
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: defaultValues || {
      name: "",
      phone: "",
      email: "",
      address: "",
    },
  })

  async function onSubmit(data: CustomerFormValues) {
    try {
      // Assuming you have a method to create a customer in your API service
      await apiService.owners.create(data) 
      toast({
        title: "Success",
        description: "Customer created successfully!",
      })
      router.push("/customers") // Redirect to the customers list page
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create customer. Please try again.",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Ad" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="Telefon" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Müşteri oluştur</Button>
      </form>
    </Form>
  )
}