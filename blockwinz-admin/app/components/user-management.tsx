// app/components/user-management.tsx
"use client"

import { useState } from "react"
import { Plus, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Dummy data for demonstration
const users = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    status: "Active",
    kycStatus: "Verified",
    riskLevel: "Low",
    balance: 1000,
    joinDate: "2023-01-15",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    status: "Inactive",
    kycStatus: "Pending",
    riskLevel: "Medium",
    balance: 500,
    joinDate: "2023-02-20",
  },
  {
    id: "3",
    name: "Peter Jones",
    email: "peter.jones@example.com",
    status: "Active",
    kycStatus: "Verified",
    riskLevel: "High",
    balance: 2000,
    joinDate: "2023-03-10",
  },
]

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800"
    case "Inactive":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const UserManagement = () => {
  const [view, setView] = useState<"list" | "add" | "edit">("list")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  const filteredUsers = users.filter((user) => {
    const searchMatch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const statusMatch = statusFilter === "" || user.status === statusFilter
    return searchMatch && statusMatch
  })

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header with responsive button layout */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">User Management</h2>
        <Button onClick={() => setView("add")} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Mobile-responsive filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* Filter inputs with full width on mobile */}
          </div>
        </CardContent>
      </Card>

      {/* Responsive user list */}
      <Card>
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <Table>{/* Existing table structure */}</Table>
          </div>

          {/* Mobile/Tablet Card Layout */}
          <div className="lg:hidden">
            {filteredUsers.map((user) => (
              <div key={user.id} className="border-b last:border-b-0 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium truncate">{user.name}</h3>
                      <Badge className={getStatusBadgeColor(user.status)}>{user.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        KYC: {user.kycStatus}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Risk: {user.riskLevel}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-gray-500">Balance:</span>
                        <span className="font-medium ml-1">${user.balance}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Joined:</span>
                        <span className="font-medium ml-1">{user.joinDate}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      /* view user */
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default UserManagement
