"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wrench } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { ApiDebug } from "@/components/api-debug"

const formSchema = z.object({
  email: z.string().email({
    message: "Geçerli bir e-posta adresi giriniz.",
  }),
  password: z.string().min(6, {
    message: "Şifre en az 6 karakter olmalıdır.",
  }),
})

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoginLoading(true)
    setError(null)

    try {
      await login(values.email, values.password)
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Login error:", err)

      // More detailed error handling
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 401) {
          setError("Geçersiz e-posta veya şifre.")
        } else if (err.response.status === 404) {
          setError("API endpoint bulunamadı. Lütfen sistem yöneticinize başvurun.")
        } else if (err.response.data?.message) {
          setError(err.response.data.message)
        } else {
          setError(`Sunucu hatası: ${err.response.status}`)
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError("Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.")
      } else {
        // Something happened in setting up the request that triggered an Error
        setError("Giriş başarısız. Lütfen daha sonra tekrar deneyin.")
      }
    } finally {
      setLoginLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <Wrench className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Makinistim</CardTitle>
          <CardDescription className="text-center">
            Hesabınıza giriş yaparak servis takip sistemini kullanmaya başlayın
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input placeholder="ornek@makinistim.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-sm text-muted-foreground text-center">Makinistim Servis Takip Sistemi v1.0</div>
        </CardFooter>
      </Card>
      <ApiDebug />
    </div>
  )
}
