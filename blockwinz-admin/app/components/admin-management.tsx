"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Eye, Search } from "lucide-react"

interface AdminManagementProps {
  currentAdmin: any
}

type AdminView = "list" | "add" | "edit" | "view"

const mockAdmins = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "super_admin",
    status: "active",
    lastLogin: "2024-01-15",
  },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "admin", status: "active", lastLogin: "2024-01-14" },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "moderator",
    status: "inactive",
    lastLogin: "2024-01-10",
  },
  {
    id: "4",
    name: "Alice Brown",
    email: "alice@example.com",
    role: "admin",
    status: "active",
    lastLogin: "2024-01-13",
  },
]

export default function AdminManagement({ currentAdmin }: AdminManagementProps) {
  const [view, setView] = useState<AdminView>("list")
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null)
  const [admins, setAdmins] = useState(mockAdmins)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "admin",
  })

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddAdmin = () => {
    const newAdmin = {
      id: Date.now().toString(),
      ...formData,
      status: "active",
      lastLogin: new Date().toISOString().split("T")[0],
    }
    setAdmins([...admins, newAdmin])
    setFormData({ name: "", email: "", role: "admin" })
    setView("list")
  }

  const handleEditAdmin = () => {
    setAdmins(admins.map((admin) => (admin.id === selectedAdmin.id ? { ...admin, ...formData } : admin)))
    setView("list")
    setSelectedAdmin(null)
  }

  const handleDeleteAdmin = (adminId: string) => {
    setAdmins(admins.filter((admin) => admin.id !== adminId))
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-red-100 text-red-800"
      case "admin":
        return "bg-blue-100 text-blue-800"
      case "moderator":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (view === "add" || view === "edit") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">{view === "add" ? "Add Admin" : "Edit Admin"}</h2>
          <Button variant="outline" onClick={() => setView("list")}>
            Back to List
          </Button>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{view === "add" ? "Add New Admin" : "Edit Admin"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-4">
              <Button onClick={view === "add" ? handleAddAdmin : handleEditAdmin}>
                {view === "add" ? "Add Admin" : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setView("list")}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (view === "view" && selectedAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Admin Details</h2>
          <Button variant="outline" onClick={() => setView("list")}>
            Back to List
          </Button>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Admin Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                <p className="text-lg">{selectedAdmin.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <p className="text-lg">{selectedAdmin.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Role</Label>
                <Badge className={getRoleBadgeColor(selectedAdmin.role)}>{selectedAdmin.role.replace("_", " ")}</Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Status</Label>
                <Badge variant={selectedAdmin.status === "active" ? "default" : "secondary"}>
                  {selectedAdmin.status}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Last Login</Label>
                <p className="text-lg">{selectedAdmin.lastLogin}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Admin ID</Label>
                <p className="text-lg font-mono">{selectedAdmin.id}</p>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                onClick={() => {
                  setFormData({
                    name: selectedAdmin.name,
                    email: selectedAdmin.email,
                    role: selectedAdmin.role,
                  })
                  setView("edit")
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Admin
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteAdmin(selectedAdmin.id)
                  setView("list")
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Admin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Admin Management</h2>
        <Button onClick={() => setView("add")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Admin
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 max-w-full sm:max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search admins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(admin.role)}>{admin.role.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={admin.status === "active" ? "default" : "secondary"}>{admin.status}</Badge>
                    </TableCell>
                    <TableCell>{admin.lastLogin}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAdmin(admin)
                            setView("view")
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAdmin(admin)
                            setFormData({
                              name: admin.name,
                              email: admin.email,
                              role: admin.role,
                            })
                            setView("edit")
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteAdmin(admin.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-3">
            {filteredAdmins.map((admin) => (
              <Card key={admin.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{admin.name}</h3>
                    <p className="text-sm text-gray-500">{admin.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getRoleBadgeColor(admin.role)}>{admin.role.replace("_", " ")}</Badge>
                      <Badge variant={admin.status === "active" ? "default" : "secondary"}>{admin.status}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Last login: {admin.lastLogin}</p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAdmin(admin)
                        setView("view")
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAdmin(admin)
                        setFormData({
                          name: admin.name,
                          email: admin.email,
                          role: admin.role,
                        })
                        setView("edit")
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteAdmin(admin.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
