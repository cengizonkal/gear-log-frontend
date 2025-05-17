"use client"

import { Car, Home, LogOut, Package, Search, FileText, Settings, PenToolIcon as Tool, User, Wrench } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout, isAuthenticated } = useAuth()

  // Don't render sidebar on login page
  if (pathname === "/login") {
    return null
  }

  const isActive = (route: string) => pathname?.startsWith(route);


  return (
    <Sidebar>
      <SidebarHeader className="flex items-center px-4 py-2">
        <div className="flex items-center gap-2">
          <Wrench className="h-6 w-6" />
          <span className="text-lg font-bold">Makinistim</span>
        </div>
        <SidebarTrigger className="ml-auto md:hidden" />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
              <Link href="/dashboard">
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/search")}>
              <Link href="/search">
                <Search className="h-5 w-5" />
                <span>Araç Sorgula</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/services")}>
              <Link href="/services">
                <Tool className="h-5 w-5" />
                <span>Servisler</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/products")}>
              <Link href="/products">
                <Package className="h-5 w-5" />
                <span>Ürünler</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/reports")}>
              <Link href="/reports">
                <FileText className="h-5 w-5" />
                <span>Rapor</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          
          {isAuthenticated && (
            <SidebarMenuItem>
              <SidebarMenuButton onClick={logout}>
                <LogOut className="h-5 w-5" />
                <span>Çıkış Yap</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
        {isAuthenticated && user && (
          <div className="px-3 py-2 mt-2">
            <div className="text-sm font-medium">{user.name}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
