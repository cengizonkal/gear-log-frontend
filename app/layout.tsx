import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AuthProvider } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/toaster"
import { SidebarTrigger } from "@/components/ui/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
    title: "Makinistim - Servis Takip Sistemi",
    description: "Araç servis ve bakım takibi için tamirhane yönetim sistemi",
    generator: 'v0.dev'
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="tr" suppressHydrationWarning>
        <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <AuthProvider>
                <SidebarProvider>
                    <div className="flex min-h-screen">
                        <AppSidebar />
                        <main className="flex-1 overflow-x-hidden w-full md:ml-64 transition-all duration-300">
                            <div className="container mx-auto py-4 px-4 md:px-6 lg:px-8">
                                <div className="md:hidden mb-4">
                                    <SidebarTrigger />
                                </div>
                                <Toaster />
                                {children}
                            </div>
                        </main>
                    </div>
                </SidebarProvider>
            </AuthProvider>
        </ThemeProvider>
        </body>
        </html>
    )
}
