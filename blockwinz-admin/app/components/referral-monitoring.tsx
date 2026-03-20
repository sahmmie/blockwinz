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
import {
  ArrowLeft,
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
} from "lucide-react"

interface ReferralMonitoringProps {
  currentAdmin: any
  onBack: () => void
}

const mockReferrals = [
  {
    id: "ref_001",
    referrerId: "user_123",
    referrerName: "John Doe",
    referrerEmail: "john@example.com",
    referredId: "user_456",
    referredName: "Jane Smith",
    referredEmail: "jane@example.com",
    referralCode: "JOHN123",
    status: "completed",
    depositAmount: 250,
    rewardAmount: 25,
    createdDate: "2024-01-15 14:30:25",
    completedDate: "2024-01-16 10:15:30",
    ipAddress: "192.168.1.100",
    deviceInfo: "Chrome/Windows",
  },
  {
    id: "ref_002",
    referrerId: "user_789",
    referrerName: "Bob Johnson",
    referrerEmail: "bob@example.com",
    referredId: "user_890",
    referredName: "Alice Brown",
    referredEmail: "alice@example.com",
    referralCode: "BOB789",
    status: "pending",
    depositAmount: 0,
    rewardAmount: 0,
    createdDate: "2024-01-15 12:45:10",
    completedDate: null,
    ipAddress: "192.168.1.101",
    deviceInfo: "Safari/MacOS",
  },
  {
    id: "ref_003",
    referrerId: "user_345",
    referrerName: "Charlie Wilson",
    referrerEmail: "charlie@example.com",
    referredId: "user_678",
    referredName: "Diana Prince",
    referredEmail: "diana@example.com",
    referralCode: "CHARLIE345",
    status: "active",
    depositAmount: 100,
    rewardAmount: 10,
    createdDate: "2024-01-14 16:20:45",
    completedDate: "2024-01-15 09:30:15",
    ipAddress: "192.168.1.102",
    deviceInfo: "Firefox/Linux",
  },
  {
    id: "ref_004",
    referrerId: "user_567",
    referrerName: "Eva Martinez",
    referrerEmail: "eva@example.com",
    referredId: "user_234",
    referredName: "Frank Miller",
    referredEmail: "frank@example.com",
    referralCode: "EVA567",
    status: "expired",
    depositAmount: 0,
    rewardAmount: 0,
    createdDate: "2023-12-20 11:15:30",
    completedDate: null,
    ipAddress: "192.168.1.103",
    deviceInfo: "Chrome/Android",
  },
]

export default function ReferralMonitoring({ currentAdmin, onBack }: ReferralMonitoringProps) {
  const [referrals, setReferrals] = useState(mockReferrals)
  const [selectedReferral, setSelectedReferral] = useState<any>(null)
  const [showReferralDetails, setShowReferralDetails] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  const filteredReferrals = referrals.filter((referral) => {
    const matchesSearch =
      referral.referrerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referredName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referralCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referrerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referredEmail.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || referral.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "active":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "expired":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "active":
        return <TrendingUp className="h-4 w-4 text-blue-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "expired":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
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
          <h2 className="text-3xl font-bold tracking-tight">Referral Monitoring</h2>
        </div>
      </div>

      {/* Monitoring Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referrals.filter((r) => r.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Referrals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referrals.filter((r) => r.status === "pending").length}</div>
            <p className="text-xs text-muted-foreground">Awaiting deposit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referrals.filter((r) => r.status === "completed").length}</div>
            <p className="text-xs text-muted-foreground">Rewards distributed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${referrals.reduce((sum, r) => sum + r.rewardAmount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Distributed today</p>
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
                  placeholder="User, code, email..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
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
                  setDateFilter("all")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referrals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Activity ({filteredReferrals.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created Date</TableHead>
                <TableHead>Referrer</TableHead>
                <TableHead>Referred User</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deposit</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReferrals.map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell className="font-mono text-sm">{referral.createdDate}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{referral.referrerName}</div>
                      <div className="text-sm text-gray-500">{referral.referrerEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{referral.referredName}</div>
                      <div className="text-sm text-gray-500">{referral.referredEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{referral.referralCode}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(referral.status)}
                      <Badge className={getStatusBadgeColor(referral.status)}>{referral.status}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>${referral.depositAmount}</TableCell>
                  <TableCell>${referral.rewardAmount}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReferral(referral)
                        setShowReferralDetails(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Referral Details Dialog */}
      <Dialog open={showReferralDetails} onOpenChange={setShowReferralDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Referral Details</DialogTitle>
          </DialogHeader>
          {selectedReferral && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Referral ID</Label>
                  <p className="text-lg font-mono">{selectedReferral.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedReferral.status)}
                    <Badge className={getStatusBadgeColor(selectedReferral.status)}>{selectedReferral.status}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Referrer</Label>
                  <div>
                    <p className="text-lg">{selectedReferral.referrerName}</p>
                    <p className="text-sm text-gray-500">{selectedReferral.referrerEmail}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Referred User</Label>
                  <div>
                    <p className="text-lg">{selectedReferral.referredName}</p>
                    <p className="text-sm text-gray-500">{selectedReferral.referredEmail}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Referral Code</Label>
                  <p className="text-lg font-mono">{selectedReferral.referralCode}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Created Date</Label>
                  <p className="text-lg">{selectedReferral.createdDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Deposit Amount</Label>
                  <p className="text-lg font-bold">${selectedReferral.depositAmount}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Reward Amount</Label>
                  <p className="text-lg font-bold text-green-600">${selectedReferral.rewardAmount}</p>
                </div>
                {selectedReferral.completedDate && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Completed Date</Label>
                    <p className="text-lg">{selectedReferral.completedDate}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-gray-500">IP Address</Label>
                  <p className="text-lg font-mono">{selectedReferral.ipAddress}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Device Info</Label>
                  <p className="text-lg">{selectedReferral.deviceInfo}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
