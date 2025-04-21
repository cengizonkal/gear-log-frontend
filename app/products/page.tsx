"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Loader2, Plus, Search, Trash } from "lucide-react"
import { ProductForm } from "@/components/product-form"
import { apiService } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatCurrency } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ItemProps {
  id: number
  name: string
  description: string | null
  default_price: string


}

export default function ProductsPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<ItemProps[]>([])
  const [filteredItems, setFilteredItems] = useState<ItemProps[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItem, setSelectedItem] = useState<ItemProps | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchItems = async () => {
      if (!user?.company?.id) return

      try {
        setIsLoading(true)
        const response = await apiService.companies.getItems(user.company.id)
        setItems(response.data.data)
        setFilteredItems(response.data.data)
      } catch (err) {
        console.error("Failed to fetch items:", err)
        setError("Ürün ve hizmetleri yüklerken bir hata oluştu.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchItems()
  }, [user])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredItems(items)
    } else {
      const filtered = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setFilteredItems(filtered)
    }
  }, [searchQuery, items])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleAddItem = (newItem: ItemProps) => {
    setItems((prevItems) => [...prevItems, newItem])
    setIsDialogOpen(false)
  }

  const handleEditItem = (item: ItemProps) => {
    setSelectedItem(item)
    setIsDialogOpen(true)
  }

  const handleUpdateItem = (updatedItem: ItemProps) => {
    setItems((prevItems) => prevItems.map((item) => (item.id === updatedItem.id ? updatedItem : item)))
    setSelectedItem(null)
    setIsDialogOpen(false)
  }

  const handleDeleteItem = async (itemId: number) => {
    if (!user?.company?.id) return

    if (window.confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
      try {
        await apiService.companies.deleteItem(user.company.id, itemId)
        setItems((prevItems) => prevItems.filter((item) => item.id !== itemId))
      } catch (err) {
        console.error("Failed to delete item:", err)
        setError("Ürün silinirken bir hata oluştu.")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 pt-6">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Ürün ve hizmetler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Ürünler ve Hizmetler</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="self-start sm:self-auto">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Yeni Ürün/Hizmet Ekle</span>
              <span className="sm:hidden">Yeni Ekle</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedItem ? "Ürün/Hizmet Düzenle" : "Yeni Ürün/Hizmet Ekle"}</DialogTitle>
              <DialogDescription>
                {selectedItem ? "Ürün veya hizmet bilgilerini güncelleyin." : "Yeni bir ürün veya hizmet ekleyin."}
              </DialogDescription>
            </DialogHeader>
            <ProductForm initialData={selectedItem} onSuccess={selectedItem ? handleUpdateItem : handleAddItem} />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Ürün/Hizmet Listesi</CardTitle>
          <CardDescription>Sistemdeki tüm ürün ve hizmetler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Ürün/Hizmet Ara"
              className="pl-9"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kod</TableHead>
                  <TableHead>Ürün/Hizmet</TableHead>
                  <TableHead className="hidden md:table-cell">Açıklama</TableHead>
                  <TableHead>Fiyat</TableHead>
                  <TableHead className="text-right">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      {searchQuery ? "Arama sonucu bulunamadı." : "Henüz ürün veya hizmet bulunmamaktadır."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">#{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{item.description || "-"}</TableCell>
                      <TableCell>{formatCurrency(Number.parseFloat(item.default_price))}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Düzenle</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Sil</span>
                          </Button>
                        </div>
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
