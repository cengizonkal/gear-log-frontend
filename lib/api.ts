import axios from "axios"

// Create an axios instance with default config
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem("auth_token")

    // If token exists, add it to the request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If the error is 401 (Unauthorized) and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Clear token if it's expired or invalid
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token")
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

        // Redirect to login page
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  },
)

// Helper functions for API calls
export const apiService = {
  // Auth related API calls
  auth: {
    login: (credentials: { email: string; password: string }) => api.post("/login", credentials),

    getUser: () => api.get("/user"),
  },

  // Dashboard related API calls
  dashboard: {
    getStats: () => api.get("/dashboard"),
  },

  // Vehicle related API calls
  vehicles: {
    search: (licensePlate: string) => api.get(`/vehicles/${licensePlate}`),

    getById: (licensePlate: string) => api.get(`/vehicles/${licensePlate}`),

    getServices: (licensePlate: string) => api.get(`/vehicles/${licensePlate}/services`),

    getServiceById: (licensePlate: string, serviceId: number) =>
      api.get(`/vehicles/${licensePlate}/services/${serviceId}`),

    addService: (licensePlate: string, serviceData: any) => api.post(`/vehicles/${licensePlate}/services`, serviceData),
  },

  // Owner related API calls
  owners: {
    getAll: () => api.get("/owners"),

    getById: (id: number) => api.get(`/owners/${id}`),

    create: (ownerData: any) => api.post("/owners", ownerData),

    update: (id: number, ownerData: any) => api.put(`/owners/${id}`, ownerData),

    delete: (id: number) => api.delete(`/owners/${id}`),
  },

  // Service related API calls
  services: {
    getAll: () => api.get("/services"),

    getById: (id: number) => api.get(`/services/${id}`),

    create: (serviceData: any) => api.post("/services", serviceData),

    update: (id: number, serviceData: any) => api.put(`/services/${id}`, serviceData),

    delete: (id: number) => api.delete(`/services/${id}`),

    // Service items
    getItems: (vehicleLicensePlate: string, serviceId: number) =>
      api.get(`/vehicles/${vehicleLicensePlate}/services/${serviceId}/items`),

    addItem: (vehicleLicensePlate: string, serviceId: number, itemData: any) =>
      api.post(`/vehicles/${vehicleLicensePlate}/services/${serviceId}/items`, itemData),
  },

  items: {
    getAll: (company:number) => api.get(`/companies/${company}items`),
    getById: (company:number,id: number) => api.get(`/companies/${company}items/${id}`),
    delete: (company:number,id: number) => api.delete(`/companies/${company}items/${id}`),
    create: (company:number,itemData: any) => api.post(`/companies/${company}items`, itemData),
    update: (company:number,id: number, itemData: any) => api.put(`/companies/${company}items/${id}`, itemData),
  },

  // Brand related API calls
  brands: {
    getAll: () => api.get("/brands"),
  },

  // Company related API calls
  companies: {
    getById: (id: number) => api.get(`/companies/${id}`),

    // Company items
    getItems: (companyId: number) => api.get(`/companies/${companyId}/items`),

    createItem: (companyId: number, itemData: any) => api.post(`/companies/${companyId}/items`, itemData),

    getItemById: (companyId: number, itemId: number) => api.get(`/companies/${companyId}/items/${itemId}`),

    updateItem: (companyId: number, itemId: number, itemData: any) =>
      api.put(`/companies/${companyId}/items/${itemId}`, itemData),

    deleteItem: (companyId: number, itemId: number) => api.delete(`/companies/${companyId}/items/${itemId}`),
  },

  // User related API calls
  users: {
    getById: (id: number) => api.get(`/users/${id}`),

    create: (userData: any) => api.post("/users", userData),

    update: (id: number, userData: any) => api.put(`/users/${id}`, userData),

    delete: (id: number) => api.delete(`/users/${id}`),
  },
}
