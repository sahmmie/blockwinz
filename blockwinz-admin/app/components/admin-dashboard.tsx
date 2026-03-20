"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  UserCog,
  LogOut,
  Settings,
  Gamepad2,
  Gift,
  CreditCard,
  Wallet,
  Dice1,
  Mail,
  Menu,
  X,
} from "lucide-react"
import AdminManagement from "./admin-management"
import UserManagement from "./user-management"
import GameManagement from "./game-management"
import BonusManagement from "./bonus-management"
import TransactionManagement from "./transaction-management"
import ReferralManagement from "./referral-management"
import WalletManagement from "./wallet-management"
import BetHistoryManagement from "./bet-history-management"
import EmailManagement from "./email-management"

interface AdminDashboardProps {
  currentAdmin: any
  onLogout: () => void
}

type View =
  | "dashboard"
  | "admins"
  | "users"
  | "games"
  | "bonuses"
  | "transactions"
  | "referrals"
  | "wallets"
  | "bets"
  | "emails"

export default function AdminDashboard({ currentAdmin, onLogout }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderContent = () => {
    switch (currentView) {
      case "admins":
        return <AdminManagement currentAdmin={currentAdmin} />
      case "users":
        return <UserManagement currentAdmin={currentAdmin} />
      case "games":
        return <GameManagement currentAdmin={currentAdmin} />
      case "bonuses":
        return <BonusManagement currentAdmin={currentAdmin} />
      case "transactions":
        return <TransactionManagement currentAdmin={currentAdmin} />
      case "referrals":
        return <ReferralManagement currentAdmin={currentAdmin} />
      case "wallets":
        return <WalletManagement currentAdmin={currentAdmin} />
      case "bets":
        return <BetHistoryManagement currentAdmin={currentAdmin} />
      case "emails":
        return <EmailManagement currentAdmin={currentAdmin} />
      default:
        return (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-sm md:text-base text-muted-foreground">Welcome back, {currentAdmin.name}</p>
              </div>
            </div>

            <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
                  <UserCog className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+2 from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">+180 from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">89</div>
                  <p className="text-xs text-muted-foreground">+12% from last hour</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Games</CardTitle>
                  <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">+3 new this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Bonuses</CardTitle>
                  <Gift className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">18</div>
                  <p className="text-xs text-muted-foreground">+5 new this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">7</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Referrals</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">+23 this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Wallet Balance</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">$2.4M</div>
                  <p className="text-xs text-muted-foreground">Across all cryptocurrencies</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Bets</CardTitle>
                  <Dice1 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">3,247</div>
                  <p className="text-xs text-muted-foreground">+15% from yesterday</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Email Delivery Rate</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">98.5%</div>
                  <p className="text-xs text-muted-foreground">Last 24 hours</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )
    }
  }

  const navigationItems = [
    { key: "dashboard", label: "Dashboard", icon: Settings },
    { key: "admins", label: "Admin Management", icon: UserCog },
    { key: "users", label: "User Management", icon: Users },
    { key: "games", label: "Game Management", icon: Gamepad2 },
    { key: "bonuses", label: "Bonuses & Promotions", icon: Gift },
    { key: "transactions", label: "Transaction Management", icon: CreditCard },
    { key: "referrals", label: "Referral System", icon: Users },
    { key: "wallets", label: "Wallet Management", icon: Wallet },
    { key: "bets", label: "Bet History", icon: Dice1 },
    { key: "emails", label: "Email Management", icon: Mail },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-sm transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="flex items-center justify-between p-4 lg:p-6">
          <h1 className="text-lg lg:text-xl font-bold">Admin Panel</h1>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="mt-4 lg:mt-6 px-3 lg:px-6">
          {/* Maintenance Mode Toggle */}
          <div className="py-2">
            <div className="flex items-center justify-between p-2 rounded-lg border bg-card">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${maintenanceMode ? "bg-red-500" : "bg-green-500"}`} />
                <span className="text-sm font-medium">{maintenanceMode ? "Maintenance" : "Live"}</span>
              </div>
              <Button
                variant={maintenanceMode ? "destructive" : "outline"}
                size="sm"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className="h-6 px-2 text-xs"
              >
                {maintenanceMode ? "Disable" : "Enable"}
              </Button>
            </div>
          </div>

          {/* Navigation Items */}
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.key} className="py-1">
                <Button
                  variant={currentView === item.key ? "default" : "ghost"}
                  className="w-full justify-start text-sm"
                  onClick={() => {
                    setCurrentView(item.key as View)
                    setSidebarOpen(false)
                  }}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span className="truncate">{item.label}</span>
                </Button>
              </div>
            )
          })}
        </nav>

        {/* User Info and Logout */}
        <div className="absolute bottom-0 w-64 p-4 lg:p-6 border-t">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {currentAdmin.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentAdmin.name}</p>
              <Badge variant="secondary" className="text-xs">
                {currentAdmin.role.replace("_", " ")}
              </Badge>
            </div>
          </div>
          <Button variant="outline" className="w-full text-sm" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b p-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">Admin Panel</h1>
          <div className="w-8" /> {/* Spacer for centering */}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8">
            {maintenanceMode && (
              <div className="mb-4 lg:mb-6 p-3 lg:p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <h3 className="text-red-800 font-semibold text-sm lg:text-base">Maintenance Mode Active</h3>
                </div>
                <p className="text-red-700 text-xs lg:text-sm mt-1">
                  The platform is currently in maintenance mode. Users cannot access the system.
                </p>
              </div>
            )}
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
