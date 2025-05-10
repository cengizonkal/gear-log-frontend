"use client"

import { AddOwnerForm } from "@/components/add-owner-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Loader2, Plus, Search } from "lucide-react"
import Link from "next/link"
import { apiService } from "@/lib/api"

interface CustomerProps {
  id: number
  name: string
  phone: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerProps[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerProps[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true)
        const response = await apiService.owners.getAll() // Assuming you have a customers API endpoint
        setCustomers(response.data.data)
        setFilteredCustomers(response.data.data)
      } catch (err) {
        console.error("Failed to fetch customers:", err)
        setError("Müşterileri yüklerken bir hata oluştu.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCustomers(customers)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = customers.filter(
        (customer) =>
          customer.id.toString().includes(query) ||
          customer.name.toLowerCase().includes(query),
      )
      setFilteredCustomers(filtered)
    }
  }, [searchQuery, customers])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  if (isLoading) {
    return (
        <div className="flex-1 flex items-center justify-center p-4 md:p-8 pt-6">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary"/>
            <p className="mt-4 text-muted-foreground">Müşteriler yükleniyor...</p>
          </div>
        </div>
    )
  }

  return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Müşteriler</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Yeni Müşteri Ekle</span>
                <span className="sm:hidden">Yeni Ekle</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
                <DialogDescription>Yeni bir müşteri ekleyin.</DialogDescription>
              </DialogHeader>
              <AddOwnerForm />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Müşteri Ara</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center relative">
              <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
              <Input
                  type="search"
                  placeholder="Müşteri ara..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={handleSearch}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tüm Müşteriler</CardTitle>
            <CardDescription>Sistemdeki müşteri kayıtları</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Müşteri No</TableHead>
                    <TableHead>İsim</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          {searchQuery ? "Arama sonucu bulunamadı." : "Henüz müşteri kaydı yok."}
                        </TableCell>
                      </TableRow>
                  ) : (
                      filteredCustomers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell className="font-medium">#{customer.id}</TableCell>
                            <TableCell>{customer.name}</TableCell>
                            <TableCell>{customer.phone}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={`/customers/${customer.id}`}>
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">Görüntüle</span>
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

  )
}