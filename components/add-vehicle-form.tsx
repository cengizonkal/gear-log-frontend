import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  license_plate: z.string().min(5, {
    message: "Plaka en az 5 karakter olmalıdır.",
  }),
  brand: z.string().min(2, {
    message: "Marka en az 2 karakter olmalıdır.",
  }),
  model: z.string().min(2, {
    message: "Model en az 2 karakter olmalıdır.",
  }),
  owner_id: z.string().min(1, {
    message: "Lütfen bir araç sahibi seçin.",
  }),
});

interface VehicleFormProps {
  initialData?: {
    id: number;
    license_plate: string;
    brand: string;
    model: string;
    owner_id: number;
  } | null;
  onSuccess?: (data: any) => void;
}

export function AddVehicleForm({ initialData, onSuccess }: VehicleFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [owners, setOwners] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await apiService.owners.getAll();
        setOwners(response.data.data.map((owner: any) => ({ id: owner.id, name: owner.name })));
      } catch (err) {
        console.error("Failed to fetch owners:", err);
        setError("Müşteri bilgileri yüklenirken bir hata oluştu.");
      }
    };

    fetchOwners();
  }, []);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      license_plate: initialData?.license_plate || "",
      brand: initialData?.brand || "",
      model: initialData?.model || "",
      owner_id: initialData?.owner_id ? String(initialData.owner_id) : "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user?.company?.id) {
      setError("Şirket bilgisi bulunamadı.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const vehicleData = {
        company_id: user.company.id,
        license_plate: values.license_plate,
        brand: values.brand,
        model: values.model,
        owner_id: Number.parseInt(values.owner_id),
      };

      let response;

      if (initialData) {
        // Update existing vehicle
        response = await apiService.vehicles.update(initialData.id, vehicleData);
      } else {
        // Create new vehicle
        response = await apiService.vehicles.create(vehicleData);
      }

      if (onSuccess) {
        onSuccess(response.data.data);
      }
    } catch (err: any) {
      console.error("Form submission error:", err);
      setError(err.response?.data?.message || "Araç kaydedilirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}

        <FormField
          control={form.control}
          name="license_plate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plaka</FormLabel>
              <FormControl>
                <Input placeholder="34 ABC 123" {...field} />
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
              <FormControl>
                <Input placeholder="Audi" {...field} />
              </FormControl>
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
              <FormControl>
                <Input placeholder="A3" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="owner_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sahibi</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sahip seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {owners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id.toString()}>
                      {owner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
  );
}