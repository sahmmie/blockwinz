"use client"

import { useState } from "react"
import LoginScreen from "./components/login-screen"
import AdminDashboard from "./components/admin-dashboard"

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentAdmin, setCurrentAdmin] = useState<any>(null)

  const handleLogin = (adminData: any) => {
    setIsAuthenticated(true)
    setCurrentAdmin(adminData)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentAdmin(null)
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return <AdminDashboard currentAdmin={currentAdmin} onLogout={handleLogout} />
}
