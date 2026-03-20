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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Code, Copy, Eye, Trash2, Users, Calendar, Target } from "lucide-react"

interface PromoCodesProps {
  currentAdmin: any
  onBack: () => void
}

const mockPromoCodes = [
  {
    id: "1",
    code: "WELCOME100",
    type: "percentage",
    value: 100,
    maxUses: 1000,
    currentUses: 247,
    maxUsesPerUser: 1,
    minDeposit: 20,
    maxBonus: 500,
    status: "active",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    description: "Welcome bonus for new players",
  },
  {
    id: "2",
    code: "FREESPINS50",
    type: "free_spins",
    value: 50,
    maxUses: 500,
    currentUses: 123,
    maxUsesPerUser: 1,
    minDeposit: 0,
    maxBonus: 0,
    status: "active",
    startDate: "2024-01-01",
    endDate: "2024-06-30",
    description: "50 free spins on selected slots",
  },
  {
    id: "3",
    code: "CASHBACK10",
    type: "cashback",
    value: 10,
    maxUses: 100,
    currentUses: 67,
    maxUsesPerUser: 1,
    minDeposit: 100,
    maxBonus: 200,
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    description: "10% cashback on losses",
  },
  {
    id: "4",
    code: "EXPIRED2023",
    type: "fixed",
    value: 25,
    maxUses: 200,
    currentUses: 200,
    maxUsesPerUser: 1,
    minDeposit: 10,
    maxBonus: 25,
    status: "expired",
    startDate: "2023-12-01",
    endDate: "2023-12-31",
    description: "Holiday bonus code",
  },
]

const mockRedemptionLogs = [
  {
    id: "1",
    code: "WELCOME100",
    userId: "user_123",
    userName: "John Doe",
    userEmail: "john@example.com",
    bonusAmount: 100,
    timestamp: "2024-01-15 14:30:25",
    status: "claimed",
  },
  {
    id: "2",
    code: "FREESPINS50",
    userId: "user_456",
    userName: "Jane Smith",
    userEmail: "jane@example.com",
    bonusAmount: 50,
    timestamp: "2024-01-15 14:25:10",
    status: "claimed",
  },
  {
    id: "3",
    code: "CASHBACK10",
    userId: "user_789",
    userName: "Bob Johnson",
    userEmail: "bob@example.com",
    bonusAmount: 25,
    timestamp: "2024-01-15 14:20:45",
    status: "pending",
  },
]

export default function PromoCodes({ currentAdmin, onBack }: PromoCodesProps) {
  const [promoCodes, setPromoCodes] = useState(mockPromoCodes)
  const [redemptionLogs, setRedemptionLogs] = useState(mockRedemptionLogs)
  const [selectedCode, setSelectedCode] = useState<any>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("codes")
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: 0,
    maxUses: 100,
    maxUsesPerUser: 1,
    minDeposit: 0,
    maxBonus: 0,
    startDate: "",
    endDate: "",
    description: "",
  })

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, code: result })
  }

  const handleCreateCode = () => {
    const newCode = {
      id: Date.now().toString(),
      ...formData,
      currentUses: 0,
      status: "active",
    }
    setPromoCodes([...promoCodes, newCode])
    setShowCreateDialog(false)
    setFormData({
      code: "",
      type: "percentage",
      value: 0,
      maxUses: 100,
      maxUsesPerUser: 1,
      minDeposit: 0,
      maxBonus: 0,
      startDate: "",
      endDate: "",
      description: "",
    })
  }

  const handleToggleCode = (codeId: string) => {
    setPromoCodes(
      promoCodes.map((code) =>
        code.id === codeId ? { ...code, status: code.status === "active" ? "inactive" : "active" } : code,
      ),
    )
  }

  const handleDeleteCode = (codeId: string) => {
    setPromoCodes(promoCodes.filter((code) => code.id !== codeId))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "expired":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "percentage":
        return "bg-blue-100 text-blue-800"
      case "fixed":
        return "bg-green-100 text-green-800"
      case "free_spins":
        return "bg-purple-100 text-purple-800"
      case "cashback":
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
          <h2 className="text-3xl font-bold tracking-tight">Promo Codes</h2>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Code
        </Button>
      </div>

      {/* Promo Code Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Codes</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promoCodes.length}</div>
            <p className="text-xs text-muted-foreground">
              {promoCodes.filter((c) => c.status === "active").length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Redemptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promoCodes.reduce((sum, c) => sum + c.currentUses, 0)}</div>
            <p className="text-xs text-muted-foreground">Across all codes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redemption Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                (promoCodes.reduce((sum, c) => sum + c.currentUses, 0) /
                  promoCodes.reduce((sum, c) => sum + c.maxUses, 0)) *
                100
              ).toFixed(1)}
              %
            </div>
            <p className="text-xs text-muted-foreground">Usage vs capacity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promoCodes.filter((c) => c.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">Currently available</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="codes">Promo Codes</TabsTrigger>
          <TabsTrigger value="logs">Redemption Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="codes">
          <Card>
            <CardHeader>
              <CardTitle>Promo Code List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono font-medium">
                        <div className="flex items-center space-x-2">
                          <span>{code.code}</span>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(code.code)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeBadgeColor(code.type)}>{code.type.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>
                        {code.type === "percentage"
                          ? `${code.value}%`
                          : code.type === "free_spins"
                            ? `${code.value} spins`
                            : `$${code.value}`}
                      </TableCell>
                      <TableCell>
                        {code.currentUses} / {code.maxUses}
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                          <div
                            className="bg-blue-600 h-1 rounded-full"
                            style={{ width: `${(code.currentUses / code.maxUses) * 100}%` }}
                          ></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(code.status)}>{code.status}</Badge>
                      </TableCell>
                      <TableCell>{code.endDate}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Switch
                            checked={code.status === "active"}
                            onCheckedChange={() => handleToggleCode(code.id)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCode(code)
                              setShowViewDialog(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteCode(code.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Redemption Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Bonus Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {redemptionLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                      <TableCell className="font-mono">{log.code}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.userName}</div>
                          <div className="text-sm text-gray-500">{log.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>${log.bonusAmount}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            log.status === "claimed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Code Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Promo Code</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Promo Code</Label>
                <div className="flex space-x-2">
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Enter code"
                  />
                  <Button type="button" variant="outline" onClick={generateRandomCode}>
                    Generate
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Code Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage Bonus</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="free_spins">Free Spins</SelectItem>
                    <SelectItem value="cashback">Cashback</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">
                  {formData.type === "percentage"
                    ? "Percentage (%)"
                    : formData.type === "free_spins"
                      ? "Number of Spins"
                      : "Amount ($)"}
                </Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxUses">Max Uses</Label>
                <Input
                  id="maxUses"
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxUsesPerUser">Max Uses Per User</Label>
                <Input
                  id="maxUsesPerUser"
                  type="number"
                  value={formData.maxUsesPerUser}
                  onChange={(e) => setFormData({ ...formData, maxUsesPerUser: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minDeposit">Min Deposit ($)</Label>
                <Input
                  id="minDeposit"
                  type="number"
                  value={formData.minDeposit}
                  onChange={(e) => setFormData({ ...formData, minDeposit: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxBonus">Max Bonus ($)</Label>
                <Input
                  id="maxBonus"
                  type="number"
                  value={formData.maxBonus}
                  onChange={(e) => setFormData({ ...formData, maxBonus: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <Button onClick={handleCreateCode}>Create Code</Button>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Code Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Promo Code Details</DialogTitle>
          </DialogHeader>
          {selectedCode && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Code</Label>
                  <p className="text-lg font-mono">{selectedCode.code}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Type</Label>
                  <Badge className={getTypeBadgeColor(selectedCode.type)}>{selectedCode.type.replace("_", " ")}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Value</Label>
                  <p className="text-lg">
                    {selectedCode.type === "percentage"
                      ? `${selectedCode.value}%`
                      : selectedCode.type === "free_spins"
                        ? `${selectedCode.value} spins`
                        : `$${selectedCode.value}`}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Usage</Label>
                  <p className="text-lg">
                    {selectedCode.currentUses} / {selectedCode.maxUses}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={getStatusBadgeColor(selectedCode.status)}>{selectedCode.status}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Expires</Label>
                  <p className="text-lg">{selectedCode.endDate}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Description</Label>
                <p className="text-lg">{selectedCode.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
