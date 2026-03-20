"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Search, Eye, Edit, Ban, Copy, Users, UserCheck, UserX, TrendingUp } from "lucide-react"

interface ReferralUserManagementProps {
  currentAdmin: any
  onBack: () => void
}

const mockUsers = [
  {
    id: "user_123",
    name: "John Doe",
    email: "john@example.com",
    referralCode: "JOHN123",
    customCode: false,
    referralEnabled: true,
    totalReferrals: 15,
    successfulReferrals: 12,
    totalRewards: 1247,
    joinDate: "2024-01-10",
    lastReferral: "2024-01-15",
    status: "active",
    tier: "gold",
  },
  {
    id: "user_456",
    name: "Jane Smith",
    email: "jane@example.com",
    referralCode: "JANE456",
    customCode: true,
    referralEnabled: true,
    totalReferrals: 8,
    successfulReferrals: 6,
    totalRewards: 567,
    joinDate: "2024-01-08",
    lastReferral: "2024-01-14",
    status: "active",
    tier: "silver",
  },
  {
    id: "user_789",
    name: "Bob Johnson",
    email: "bob@example.com",
    referralCode: "BOB789",
    customCode: false,
    referralEnabled: false,
    totalReferrals: 3,
    successfulReferrals: 1,
    totalRewards: 89,
    joinDate: "2024-01-05",
    lastReferral: "2024-01-12",
    status: "disabled",
    tier: "bronze",
  },
  {
    id: "user_101",
    name: "Alice Brown",
    email: "alice@example.com",
    referralCode: "ALICE101",
    customCode: true,
    referralEnabled: true,
    totalReferrals: 25,
    successfulReferrals: 20,
    totalRewards: 2340,
    joinDate: "2023-12-20",
    lastReferral: "2024-01-15",
    status: "active",
    tier: "platinum",
  },
]

export default function ReferralUserManagement({ currentAdmin, onBack }: ReferralUserManagementProps) {
  const [users, setUsers] = useState(mockUsers)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [tierFilter, setTierFilter] = useState("all")
  const [editData, setEditData] = useState({
    referralCode: "",
    referralEnabled: true,
  })

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.referralCode.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesTier = tierFilter === "all" || user.tier === tierFilter

    return matchesSearch && matchesStatus && matchesTier
  })

  const handleToggleReferralStatus = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              referralEnabled: !user.referralEnabled,
              status: !user.referralEnabled ? "active" : "disabled",
            }
          : user,
      ),
    )
  }

  const handleUpdateUser = () => {
    if (selectedUser) {
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                referralCode: editData.referralCode,
                referralEnabled: editData.referralEnabled,
                status: editData.referralEnabled ? "active" : "disabled",
              }
            : user,
        ),
      )
      setShowEditDialog(false)
      setShowUserDetails(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "disabled":
        return "bg-red-100 text-red-800"
      case "suspended":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case "platinum":
        return "bg-purple-100 text-purple-800"
      case "gold":
        return "bg-yellow-100 text-yellow-800"
      case "silver":
        return "bg-gray-100 text-gray-800"
      case "bronze":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Overview
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Referral User Management</h2>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">With referral codes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Referrers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((u) => u.referralEnabled).length}</div>
            <p className="text-xs text-muted-foreground">Currently enabled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disabled Users</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((u) => !u.referralEnabled).length}</div>
            <p className="text-xs text-muted-foreground">Referrals disabled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.reduce((max, user) => (user.totalRewards > max.totalRewards ? user : max), users[0])?.name}
            </div>
            <p className="text-xs text-muted-foreground">Highest rewards earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Name, email, code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tier</Label>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setTierFilter("all")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Users ({filteredUsers.length} users)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Referral Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Referrals</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Total Rewards</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono">{user.referralCode}</span>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(user.referralCode)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                      {user.customCode && <Badge variant="outline">Custom</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(user.status)}>{user.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTierBadgeColor(user.tier)}>{user.tier}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.totalReferrals}</div>
                      <div className="text-sm text-gray-500">{user.successfulReferrals} successful</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.totalReferrals > 0
                      ? `${((user.successfulReferrals / user.totalReferrals) * 100).toFixed(1)}%`
                      : "0%"}
                  </TableCell>
                  <TableCell>${user.totalRewards.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Switch
                        checked={user.referralEnabled}
                        onCheckedChange={() => handleToggleReferralStatus(user.id)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setShowUserDetails(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setEditData({
                            referralCode: user.referralCode,
                            referralEnabled: user.referralEnabled,
                          })
                          setShowEditDialog(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Referral Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">User Name</Label>
                  <p className="text-lg">{selectedUser.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-lg">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Referral Code</Label>
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-mono">{selectedUser.referralCode}</p>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(selectedUser.referralCode)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Code Type</Label>
                  <Badge variant="outline">{selectedUser.customCode ? "Custom" : "Auto-generated"}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={getStatusBadgeColor(selectedUser.status)}>{selectedUser.status}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tier</Label>
                  <Badge className={getTierBadgeColor(selectedUser.tier)}>{selectedUser.tier}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Total Referrals</Label>
                  <p className="text-lg font-bold">{selectedUser.totalReferrals}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Successful Referrals</Label>
                  <p className="text-lg font-bold text-green-600">{selectedUser.successfulReferrals}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Success Rate</Label>
                  <p className="text-lg">
                    {selectedUser.totalReferrals > 0
                      ? `${((selectedUser.successfulReferrals / selectedUser.totalReferrals) * 100).toFixed(1)}%`
                      : "0%"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Total Rewards</Label>
                  <p className="text-lg font-bold">${selectedUser.totalRewards.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Join Date</Label>
                  <p className="text-lg">{selectedUser.joinDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Last Referral</Label>
                  <p className="text-lg">{selectedUser.lastReferral}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex space-x-4">
                  <Button
                    onClick={() => {
                      setEditData({
                        referralCode: selectedUser.referralCode,
                        referralEnabled: selectedUser.referralEnabled,
                      })
                      setShowUserDetails(false)
                      setShowEditDialog(true)
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit User
                  </Button>
                  <Button
                    variant={selectedUser.referralEnabled ? "destructive" : "default"}
                    onClick={() => {
                      handleToggleReferralStatus(selectedUser.id)
                      setShowUserDetails(false)
                    }}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    {selectedUser.referralEnabled ? "Disable Referrals" : "Enable Referrals"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Referral Settings</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editCode">Referral Code</Label>
                <Input
                  id="editCode"
                  value={editData.referralCode}
                  onChange={(e) => setEditData({ ...editData, referralCode: e.target.value.toUpperCase() })}
                  placeholder="Enter referral code"
                />
              </div>

              <div className="space-y-2">
                <Label>Referral Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editData.referralEnabled}
                    onCheckedChange={(checked) => setEditData({ ...editData, referralEnabled: checked })}
                  />
                  <span className="text-sm">{editData.referralEnabled ? "Enabled" : "Disabled"}</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={handleUpdateUser}>Save Changes</Button>
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
