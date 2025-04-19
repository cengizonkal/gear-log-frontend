"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { setCookie, deleteCookie } from "cookies-next"

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if token exists in localStorage on initial load
    const storedToken = localStorage.getItem("auth_token")
    if (storedToken) {
      setToken(storedToken)
      fetchUserData(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  // Update the fetchUserData function to use the correct endpoint
  const fetchUserData = async (authToken: string) => {
    try {
      const response = await api.get("/user", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      setUser(response.data)
    } catch (error) {
      console.error("Failed to fetch user data:", error)
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  // Update the login function to use the correct endpoint path
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Make sure we're using the correct endpoint path
      const response = await api.post("/login", { email, password })
      const { access_token, token_type, expires_in } = response.data

      setToken(access_token)

      // Fetch user data with the token
      await fetchUserData(access_token)

      // Store token in localStorage for persistence across page refreshes
      localStorage.setItem("auth_token", access_token)

      // Also set in cookie for middleware
      setCookie("auth_token", access_token, {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })

      return response.data
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Clear user data and token
    setUser(null)
    setToken(null)
    localStorage.removeItem("auth_token")
    deleteCookie("auth_token")

    // Redirect to login page
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
