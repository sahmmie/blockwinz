"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Search, Eye, Clock, CheckCircle, XCircle, AlertTriangle, Plus, Target } from "lucide-react"

interface BonusClaimsProps {
  currentAdmin: any
  onBack: () => void
}

const mockBonusClaims = [
  {
    id: "1",
    userId: "user_123",
    userName: "John Doe",
    userEmail: "john@example.com",
    bonusType: "welcome",
    bonusName: "Welcome Bonus",
    bonusAmount: 100,
    wageringRequired: 3500,
    wageringCompleted: 1200,
    status: "active",
    claimedDate: "2024-01-15",
    expiryDate: "2024-02-14",
    tasks: [
      { id: "1", description: "Make first deposit", completed: true },
      { id: "2", description: "Play 10 games", completed: true },
      { id: "3", description: "Wager $1000", completed: false },
    ],
  },
  {
    id: "2",
    userId: "user_456",
    userName: "Jane Smith",
    userEmail: "jane@example.com",
    bonusType: "free_spins",
    bonusName: "Free Spins Friday",
    bonusAmount: 50,
    wageringRequired: 2000,
    wageringCompleted: 2000,
    status: "completed",
    claimedDate: "2024-01-12",
    expiryDate: "2024-01-19",
    tasks: [
      { id: "1", description: "Use all free spins", completed: true },
      { id: "2", description: "Complete wagering", completed: true },
    ],
  },
  {
    id: "3",
    userId: "user_789",
    userName: "Bob Johnson",
    userEmail: "bob@example.com",
    bonusType: "cashback",
    bonusName: "VIP Cashback",
    bonusAmount: 75,
    wageringRequired: 75,
    wageringCompleted: 0,
    status: "pending",
    claimedDate: "2024-01-14",
    expiryDate: "2024-01-21",
    tasks: [
      { id: "1", description: "Verify VIP status", completed: true },
      { id: "2", description: "Claim cashback", completed: false },
    ],
  },
  {
    id: "4",
    userId: "user_101",
    userName: "Alice Brown",
    userEmail: "alice@example.com",
    bonusType: "deposit",
    bonusName: "Reload Bonus",
    bonusAmount: 50,
    wageringRequired: 1750,
    wageringCompleted: 500,
    status: "expired",
    claimedDate: "2024-01-01",
    expiryDate: "2024-01-08",
    tasks: [
      { id: "1", description: "Make qualifying deposit", completed: true },
      { id: "2", description: "Complete wagering", completed: false },
    ],
  },
]

export default function BonusClaims({ currentAdmin, onBack }: BonusClaimsProps) {
  const [bonusClaims, setBonusClaims] = useState(mockBonusClaims)
  const [selectedClaim, setSelectedClaim] = useState<any>(null)
  const [showClaimDetails, setShowClaimDetails] = useState(false)
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [newTask, setNewTask] = useState("")

  const filteredClaims = bonusClaims.filter((claim) => {
    const matchesSearch =
      claim.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.bonusName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || claim.status === statusFilter
    const matchesType = typeFilter === "all" || claim.bonusType === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const handleExpireBonus = (claimId: string) => {
    setBonusClaims(bonusClaims.map((claim) => (claim.id === claimId ? { ...claim, status: "expired" } : claim)))
  }

  const handleAddTask = () => {
    if (selectedClaim && newTask.trim()) {
      const updatedClaim = {
        ...selectedClaim,
        tasks: [
          ...selectedClaim.tasks,
          {
            id: Date.now().toString(),
            description: newTask,
            completed: false,
          },
        ],
      }
      setBonusClaims(bonusClaims.map((claim) => (claim.id === selectedClaim.id ? updatedClaim : claim)))
      setSelectedClaim(updatedClaim)
      setNewTask("")
      setShowAddTaskDialog(false)
    }
  }

  const handleToggleTask = (taskId: string) => {
    if (selectedClaim) {
      const updatedClaim = {
        ...selectedClaim,
        tasks: selectedClaim.tasks.map((task: any) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task,
        ),
      }
      setBonusClaims(bonusClaims.map((claim) => (claim.id === selectedClaim.id ? updatedClaim : claim)))
      setSelectedClaim(updatedClaim)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "expired":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "welcome":
        return "bg-blue-100 text-blue-800"
      case "free_spins":
        return "bg-purple-100 text-purple-800"
      case "cashback":
        return "bg-orange-100 text-orange-800"
      case "deposit":
        return "bg-green-100 text-green-800"
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
          <h2 className="text-3xl font-bold tracking-tight">Bonus Claims</h2>
        </div>
      </div>

      {/* Claims Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bonusClaims.length}</div>
            <p className="text-xs text-muted-foreground">All time claims</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Claims</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bonusClaims.filter((c) => c.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bonusClaims.filter((c) => c.status === "pending").length}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((bonusClaims.filter((c) => c.status === "completed").length / bonusClaims.length) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Claims completed</p>
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
                  placeholder="User, bonus name..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="welcome">Welcome</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="free_spins">Free Spins</SelectItem>
                  <SelectItem value="cashback">Cashback</SelectItem>
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
                  setTypeFilter("all")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bonus Claims ({filteredClaims.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Bonus</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Wagering Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClaims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{claim.userName}</div>
                      <div className="text-sm text-gray-500">{claim.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{claim.bonusName}</TableCell>
                  <TableCell>
                    <Badge className={getTypeBadgeColor(claim.bonusType)}>{claim.bonusType.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell>${claim.bonusAmount}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        ${claim.wageringCompleted} / ${claim.wageringRequired}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min((claim.wageringCompleted / claim.wageringRequired) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(claim.status)}>{claim.status}</Badge>
                  </TableCell>
                  <TableCell>{claim.expiryDate}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedClaim(claim)
                          setShowClaimDetails(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {claim.status === "active" && (
                        <Button variant="outline" size="sm" onClick={() => handleExpireBonus(claim.id)}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Claim Details Dialog */}
      <Dialog open={showClaimDetails} onOpenChange={setShowClaimDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Bonus Claim Details</DialogTitle>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">User</Label>
                  <div>
                    <p className="text-lg">{selectedClaim.userName}</p>
                    <p className="text-sm text-gray-500">{selectedClaim.userEmail}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Bonus</Label>
                  <p className="text-lg">{selectedClaim.bonusName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Type</Label>
                  <Badge className={getTypeBadgeColor(selectedClaim.bonusType)}>
                    {selectedClaim.bonusType.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={getStatusBadgeColor(selectedClaim.status)}>{selectedClaim.status}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Bonus Amount</Label>
                  <p className="text-lg">${selectedClaim.bonusAmount}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Wagering Progress</Label>
                  <p className="text-lg">
                    ${selectedClaim.wageringCompleted} / ${selectedClaim.wageringRequired}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Claimed Date</Label>
                  <p className="text-lg">{selectedClaim.claimedDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Expiry Date</Label>
                  <p className="text-lg">{selectedClaim.expiryDate}</p>
                </div>
              </div>

              {/* Tasks Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-medium text-gray-500">Bonus Tasks</Label>
                  <Button size="sm" onClick={() => setShowAddTaskDialog(true)}>
                    <Plus className="mr-2 h-3 w-3" />
                    Add Task
                  </Button>
                </div>
                <div className="space-y-2">
                  {selectedClaim.tasks.map((task: any) => (
                    <div key={task.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(task.id)}
                        className="h-4 w-4"
                      />
                      <span className={`flex-1 ${task.completed ? "line-through text-gray-500" : ""}`}>
                        {task.description}
                      </span>
                      {task.completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="border-t pt-4">
                <div className="flex space-x-4">
                  {selectedClaim.status === "active" && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleExpireBonus(selectedClaim.id)
                        setShowClaimDetails(false)
                      }}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Expire Bonus
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setShowClaimDetails(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newTask">Task Description</Label>
              <Input
                id="newTask"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Enter task description"
              />
            </div>
            <div className="flex space-x-4">
              <Button onClick={handleAddTask}>Add Task</Button>
              <Button variant="outline" onClick={() => setShowAddTaskDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
