"use client"
import { useState } from 'react';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from 'next/navigation';

interface NewServiceFormProps {
    vehicleLicensePlate: string;
    onSuccess: () => void;
}

export function NewServiceForm({ vehicleLicensePlate, onSuccess }: NewServiceFormProps) {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [description, setDescription] = useState("")
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        setIsLoading(true);
        setError(null);

        try {
          const formattedDate = date ? format(date, "yyyy-MM-dd HH:mm:ss") : null;
          const response = await apiService.vehicles.addService(vehicleLicensePlate, { started_at: formattedDate, description });
          if (response.status === 201) {
            onSuccess();
          } else {
              setError("Servis eklenirken bir hata oluştu");
          }
        } catch (err: any) {
          console.error("Error adding new service:", err);
          setError(err.response?.data?.message || "Servis eklenirken bir hata oluştu");
        } finally {
          setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 items-center gap-2">
                <Label htmlFor="started_at">Başlangıç Tarihi</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="started_at"
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd MMMM, yyyy") : <span>Tarih Seç</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
            </div>
            <div className="grid grid-cols-1 items-center gap-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea id="description" placeholder="Servis açıklaması" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
        </form>
    )
}