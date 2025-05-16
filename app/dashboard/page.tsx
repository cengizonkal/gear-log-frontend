"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {CalendarDays, Car, CircleDollarSign, Loader2, Plus, Wrench} from "lucide-react"
import { RecentServicesTable } from "@/components/recent-services-table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiService } from "@/lib/api"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {AddServiceForm} from "@/components/add-service-form";

interface DashboardData {
  totalServices: number
  totalOpenServices: number
  totalFinishedServices: number
  last3Services: any[]
}

interface ServiceProps {
  id: number
  vehicle: {
    license_plate: string
    vehicle_model: string
    brand: string
  }
  user: {
    name: string
  }
  started_at: string | null
  finished_at: string | null
  status: {
    name: string
    color: string
  }
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [services, setServices] = useState<ServiceProps[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filteredServices, setFilteredServices] = useState<ServiceProps[]>([])

  const fetchDashboardData = async () => {
    try {
      const response = await apiService.dashboard.getStats()
      setDashboardData(response.data)
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err)
      setError("Dashboard verilerini yüklerken bir hata oluştu.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 pt-6">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Dashboard verileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="self-start sm:self-auto">
              <Plus className="mr-2 h-4 w-4"/>
              <span className="hidden sm:inline">Yeni Servis</span>
              <span className="sm:hidden">Yeni</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Yeni Servis</DialogTitle>
              <DialogDescription>Yeni bir servis kaydı oluşturun.</DialogDescription>
            </DialogHeader>
            <AddServiceForm
                onClose={() => setIsDialogOpen(false)}
                onSuccess={() => {
                  setIsDialogOpen(false);
                  fetchDashboardData(); // Refresh the table
                }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 w-full">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Servis</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalServices || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Açık Servisler</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalOpenServices || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalFinishedServices || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlananlar</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData
                ? Math.round((dashboardData.totalFinishedServices / dashboardData.totalServices) * 100)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Son Servisler</CardTitle>
          <CardDescription>Son 3 servis kaydı</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentServicesTable services={dashboardData?.last3Services || []} />
        </CardContent>
      </Card>
    </div>
  )
}
