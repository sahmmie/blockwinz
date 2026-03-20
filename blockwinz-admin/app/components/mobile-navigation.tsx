"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  Menu,
  Users,
  Gamepad2,
  Gift,
  CreditCard,
  UserCheck,
  Wallet,
  History,
  Mail,
  Settings,
  LogOut,
  Home,
} from "lucide-react"

interface MobileNavigationProps {
  activeSection: string
  setActiveSection: (section: string) => void
  currentAdmin: any
  onLogout: () => void
}

export default function MobileNavigation({
  activeSection,
  setActiveSection,
  currentAdmin,
  onLogout,
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "admin", label: "Admin Management", icon: Users },
    { id: "user", label: "User Management", icon: UserCheck },
    { id: "game", label: "Game Management", icon: Gamepad2 },
    { id: "bonus", label: "Bonus Management", icon: Gift },
    { id: "transaction", label: "Transactions", icon: CreditCard },
    { id: "referral", label: "Referral System", icon: Users },
    { id: "wallet", label: "Wallet Management", icon: Wallet },
    { id: "bet-history", label: "Bet History", icon: History },
    { id: "email", label: "Email Management", icon: Mail },
  ]

  const handleNavigation = (sectionId: string) => {
    setActiveSection(sectionId)
    setIsOpen(false)
  }

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="fixed top-4 left-4 z-50">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{currentAdmin.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h3 className="font-medium">{currentAdmin.name}</h3>
                  <p className="text-sm text-gray-500">{currentAdmin.email}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {currentAdmin.role.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="space-y-1 px-3">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.id

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors ${
                        isActive ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-gray-500"}`} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Footer Actions */}
            <div className="border-t p-4 space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => handleNavigation("settings")}>
                <Settings className="mr-3 h-4 w-4" />
                Settings
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={onLogout}
              >
                <LogOut className="mr-3 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
