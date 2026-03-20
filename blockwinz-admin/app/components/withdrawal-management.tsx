"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Search, CheckCircle, XCircle, Clock, Eye, Settings, AlertTriangle } from "lucide-react"

interface WithdrawalManagementProps {
  currentAdmin: any
  onBack: () => void
}

const mockWithdrawals = [
  {
    id: "wd_001",
    userId: "user_456",
    userName: "Jane Smith",
    userEmail: "jane@example.com",
    amount: 500,
    method: "bank_transfer",
    status: "pending",
    requestDate: "2024-01-15 14:25:10",
    accountDetails: "Bank: Chase, Account: ****1234",
    verificationStatus: "verified",
    priority: "normal",
    estimatedProcessing: "1-3 business days",
    fee: 15,
    netAmount: 485,
  },
  {
    id: "wd_002",
    userId: "user_303",
    userName: "Diana Prince",
    userEmail: "diana@example.com",
    amount: 300,
    method: "e_wallet",
    status: "pending",
    requestDate: "2024-01-15 13:45:30",
    accountDetails: "PayPal: diana@example.com",
    verificationStatus: "pending",
    priority: "high",
    estimatedProcessing: "24 hours",
    fee: 9,
    netAmount: 291,
  },
  {
    id: "wd_003",
    userId: "user_567",
    userName: "Mike Johnson",
    userEmail: "mike@example.com",
    amount: 1000,
    method: "crypto",
    status: "pending",
    requestDate: "2024-01-15 12:30:15",
    accountDetails: "BTC: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    verificationStatus: "verified",
    priority: "high",
    estimatedProcessing: "1 hour",
    fee: 20,
    netAmount: 980,
  },
  {
    id: "wd_004",
    userId: "user_789",
    userName: "Sarah Wilson",
    userEmail: "sarah@example.com",
    amount: 250,
    method: "credit_card",
    status: "approved",
    requestDate: "2024-01-15 11:15:45",
    accountDetails: "Card: ****4242",
    verificationStatus: "verified",
    priority: "normal",
    estimatedProcessing: "3-5 business days",
    fee: 7.5,
    netAmount: 242.5,
    approvedBy: "admin_001",
    approvedDate: "2024-01-15 11:30:00",
  },
  {
    id: "wd_005",
    userId: "user_890",
    userName: "Tom Brown",
    userEmail: "tom@example.com",
    amount: 150,
    method: "bank_transfer",
    status: "denied",
    requestDate: "2024-01-15 10:45:20",
    accountDetails: "Bank: Wells Fargo, Account: ****5678",
    verificationStatus: "failed",
    priority: "normal",
    estimatedProcessing: "1-3 business days",
    fee: 5,
    netAmount: 145,
    deniedBy: "admin_002",
    deniedDate: "2024-01-15 11:00:00",
    denialReason: "Account verification failed",
  },
]

export default function WithdrawalManagement({ currentAdmin, onBack }: WithdrawalManagementProps) {
  const [withdrawals, setWithdrawals] = useState(mockWithdrawals)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null)
  const [showWithdrawalDetails, setShowWithdrawalDetails] = useState(false)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [showDenialDialog, setShowDenialDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [autoApprovalEnabled, setAutoApprovalEnabled] = useState(false)
  const [autoApprovalLimit, setAutoApprovalLimit] = useState(100)
  const [denialReason, setDenialReason] = useState("")

  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    const matchesSearch =
      withdrawal.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || withdrawal.status === statusFilter
    const matchesMethod = methodFilter === "all" || withdrawal.method === methodFilter
    const matchesPriority = priorityFilter === "all" || withdrawal.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesMethod && matchesPriority
  })

  const handleApproveWithdrawal = () => {
    if (selectedWithdrawal) {
      setWithdrawals(
        withdrawals.map((withdrawal) =>
          withdrawal.id === selectedWithdrawal.id
            ? {
                ...withdrawal,
                status: "approved",
                approvedBy: currentAdmin.id,
                approvedDate: new Date().toISOString(),
              }
            : withdrawal,
        ),
      )
      setShowApprovalDialog(false)
      setShowWithdrawalDetails(false)
      setSelectedWithdrawal(null)
    }
  }

  const handleDenyWithdrawal = () => {
    if (selectedWithdrawal && denialReason.trim()) {
      setWithdrawals(
        withdrawals.map((withdrawal) =>
          withdrawal.id === selectedWithdrawal.id
            ? {
                ...withdrawal,
                status: "denied",
                deniedBy: currentAdmin.id,
                deniedDate: new Date().toISOString(),
                denialReason: denialReason,
              }
            : withdrawal,
        ),
      )
      setShowDenialDialog(false)
      setShowWithdrawalDetails(false)
      setSelectedWithdrawal(null)
      setDenialReason("")
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "denied":
        return "bg-red-100 text-red-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-emerald-100 text-emerald-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMethodBadgeColor = (method: string) => {
    switch (method) {
      case "credit_card":
        return "bg-purple-100 text-purple-800"
      case "bank_transfer":
        return "bg-blue-100 text-blue-800"
      case "crypto":
        return "bg-orange-100 text-orange-800"
      case "e_wallet":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "normal":
        return "bg-blue-100 text-blue-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getVerificationBadgeColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
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
          <h2 className="text-3xl font-bold tracking-tight">Withdrawal Management</h2>
        </div>
      </div>

      {/* Withdrawal Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{withdrawals.filter((w) => w.status === "pending").length}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {withdrawals
                .filter((w) => w.status === "pending")
                .reduce((sum, w) => sum + w.amount, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total pending value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {withdrawals.filter((w) => w.priority === "high" && w.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Urgent requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto Approval</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch checked={autoApprovalEnabled} onCheckedChange={setAutoApprovalEnabled} />
              <span className="text-sm">{autoApprovalEnabled ? "Enabled" : "Disabled"}</span>
            </div>
            <p className="text-xs text-muted-foreground">Under ${autoApprovalLimit}</p>
          </CardContent>
        </Card>
      </div>

      {/* Auto Approval Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Auto Approval Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Enable Auto Approval</Label>
              <div className="flex items-center space-x-2">
                <Switch checked={autoApprovalEnabled} onCheckedChange={setAutoApprovalEnabled} />
                <span className="text-sm">{autoApprovalEnabled ? "Enabled" : "Disabled"}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Auto Approval Limit ($)</Label>
              <Input
                type="number"
                value={autoApprovalLimit}
                onChange={(e) => setAutoApprovalLimit(Number(e.target.value))}
                disabled={!autoApprovalEnabled}
              />
            </div>
            <div className="space-y-2">
              <Label>Additional Requirements</Label>
              <Select defaultValue="verified_only">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verified_only">Verified accounts only</SelectItem>
                  <SelectItem value="all_accounts">All accounts</SelectItem>
                  <SelectItem value="vip_only">VIP accounts only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="User, withdrawal ID..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Method</Label>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  <SelectItem value="e_wallet">E-Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
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
                  setMethodFilter("all")
                  setPriorityFilter("all")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests ({filteredWithdrawals.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWithdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell className="font-mono text-sm">{withdrawal.requestDate}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{withdrawal.userName}</div>
                      <div className="text-sm text-gray-500">{withdrawal.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">${withdrawal.amount}</div>
                      <div className="text-sm text-gray-500">Net: ${withdrawal.netAmount}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getMethodBadgeColor(withdrawal.method)}>
                      {withdrawal.method.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(withdrawal.status)}>{withdrawal.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityBadgeColor(withdrawal.priority)}>{withdrawal.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getVerificationBadgeColor(withdrawal.verificationStatus)}>
                      {withdrawal.verificationStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedWithdrawal(withdrawal)
                          setShowWithdrawalDetails(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {withdrawal.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal)
                              setShowApprovalDialog(true)
                            }}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal)
                              setShowDenialDialog(true)
                            }}
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Withdrawal Details Dialog */}
      <Dialog open={showWithdrawalDetails} onOpenChange={setShowWithdrawalDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Withdrawal Details</DialogTitle>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Withdrawal ID</Label>
                  <p className="text-lg font-mono">{selectedWithdrawal.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Request Date</Label>
                  <p className="text-lg">{selectedWithdrawal.requestDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">User</Label>
                  <div>
                    <p className="text-lg">{selectedWithdrawal.userName}</p>
                    <p className="text-sm text-gray-500">{selectedWithdrawal.userEmail}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Amount</Label>
                  <div>
                    <p className="text-lg font-bold">${selectedWithdrawal.amount}</p>
                    <p className="text-sm text-gray-500">Fee: ${selectedWithdrawal.fee}</p>
                    <p className="text-sm text-gray-500">Net: ${selectedWithdrawal.netAmount}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Method</Label>
                  <Badge className={getMethodBadgeColor(selectedWithdrawal.method)}>
                    {selectedWithdrawal.method.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={getStatusBadgeColor(selectedWithdrawal.status)}>{selectedWithdrawal.status}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Priority</Label>
                  <Badge className={getPriorityBadgeColor(selectedWithdrawal.priority)}>
                    {selectedWithdrawal.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Verification Status</Label>
                  <Badge className={getVerificationBadgeColor(selectedWithdrawal.verificationStatus)}>
                    {selectedWithdrawal.verificationStatus}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Account Details</Label>
                  <p className="text-lg">{selectedWithdrawal.accountDetails}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Estimated Processing</Label>
                  <p className="text-lg">{selectedWithdrawal.estimatedProcessing}</p>
                </div>
              </div>

              {selectedWithdrawal.status === "approved" && (
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Approved By</Label>
                      <p className="text-lg">{selectedWithdrawal.approvedBy}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Approved Date</Label>
                      <p className="text-lg">{selectedWithdrawal.approvedDate}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedWithdrawal.status === "denied" && (
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Denied By</Label>
                      <p className="text-lg">{selectedWithdrawal.deniedBy}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Denied Date</Label>
                      <p className="text-lg">{selectedWithdrawal.deniedDate}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-gray-500">Denial Reason</Label>
                    <p className="text-lg">{selectedWithdrawal.denialReason}</p>
                  </div>
                </div>
              )}

              {selectedWithdrawal.status === "pending" && (
                <div className="border-t pt-4">
                  <div className="flex space-x-4">
                    <Button
                      onClick={() => {
                        setShowWithdrawalDetails(false)
                        setShowApprovalDialog(true)
                      }}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setShowWithdrawalDetails(false)
                        setShowDenialDialog(true)
                      }}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Deny
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Withdrawal</DialogTitle>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm">
                  You are about to approve a withdrawal of <strong>${selectedWithdrawal.amount}</strong> for{" "}
                  <strong>{selectedWithdrawal.userName}</strong>.
                </p>
                <p className="text-sm mt-2">
                  Net amount after fees: <strong>${selectedWithdrawal.netAmount}</strong>
                </p>
              </div>
              <div className="flex space-x-4">
                <Button onClick={handleApproveWithdrawal}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Approval
                </Button>
                <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Denial Dialog */}
      <Dialog open={showDenialDialog} onOpenChange={setShowDenialDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Withdrawal</DialogTitle>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm">
                  You are about to deny a withdrawal of <strong>${selectedWithdrawal.amount}</strong> for{" "}
                  <strong>{selectedWithdrawal.userName}</strong>.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="denialReason">Reason for Denial</Label>
                <Textarea
                  id="denialReason"
                  value={denialReason}
                  onChange={(e) => setDenialReason(e.target.value)}
                  placeholder="Please provide a reason for denying this withdrawal..."
                  required
                />
              </div>
              <div className="flex space-x-4">
                <Button variant="destructive" onClick={handleDenyWithdrawal} disabled={!denialReason.trim()}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Confirm Denial
                </Button>
                <Button variant="outline" onClick={() => setShowDenialDialog(false)}>
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
