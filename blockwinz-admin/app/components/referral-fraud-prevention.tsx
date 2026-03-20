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
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Search, Shield, AlertTriangle, Ban, Eye, CheckCircle, Users, Activity } from "lucide-react"

interface ReferralFraudPreventionProps {
  currentAdmin: any
  onBack: () => void
}

const mockSuspiciousActivity = [
  {
    id: "alert_001",
    type: "multiple_accounts",
    severity: "high",
    userId: "user_567",
    userName: "Mike Johnson",
    userEmail: "mike@example.com",
    description: "Multiple accounts from same IP address",
    ipAddress: "192.168.1.100",
    deviceFingerprint: "chrome_windows_123",
    detectedDate: "2024-01-15 14:30:25",
    status: "pending",
    referralsInvolved: 5,
    potentialLoss: 250,
  },
  {
    id: "alert_002",
    type: "rapid_referrals",
    severity: "medium",
    userId: "user_890",
    userName: "Sarah Wilson",
    userEmail: "sarah@example.com",
    description: "Unusually high referral rate in short time",
    ipAddress: "192.168.1.101",
    deviceFingerprint: "safari_macos_456",
    detectedDate: "2024-01-15 12:45:10",
    status: "investigating",
    referralsInvolved: 12,
    potentialLoss: 600,
  },
  {
    id: "alert_003",
    type: "same_bank_account",
    severity: "high",
    userId: "user_234",
    userName: "Tom Brown",
    userEmail: "tom@example.com",
    description: "Referrer and referred user share bank account",
    ipAddress: "192.168.1.102",
    deviceFingerprint: "firefox_linux_789",
    detectedDate: "2024-01-15 11:20:45",
    status: "confirmed",
    referralsInvolved: 3,
    potentialLoss: 150,
  },
]

const mockBlockedUsers = [
  {
    id: "user_999",
    name: "Blocked User 1",
    email: "blocked1@example.com",
    reason: "Multiple fake accounts",
    blockedDate: "2024-01-10",
    blockedBy: "admin_001",
    referralsBlocked: 8,
  },
  {
    id: "user_888",
    name: "Blocked User 2",
    email: "blocked2@example.com",
    reason: "Suspicious referral patterns",
    blockedDate: "2024-01-08",
    blockedBy: "admin_002",
    referralsBlocked: 15,
  },
]

export default function ReferralFraudPrevention({ currentAdmin, onBack }: ReferralFraudPreventionProps) {
  const [suspiciousActivity, setSuspiciousActivity] = useState(mockSuspiciousActivity)
  const [blockedUsers, setBlockedUsers] = useState(mockBlockedUsers)
  const [selectedAlert, setSelectedAlert] = useState<any>(null)
  const [showAlertDetails, setShowAlertDetails] = useState(false)
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [blockReason, setBlockReason] = useState("")
  const [fraudSettings, setFraudSettings] = useState({
    autoDetection: true,
    ipTracking: true,
    deviceFingerprinting: true,
    velocityChecks: true,
    bankAccountVerification: true,
    maxReferralsPerDay: 5,
    maxReferralsPerIP: 3,
    suspiciousPatternThreshold: 80,
  })

  const filteredActivity = suspiciousActivity.filter((activity) => {
    const matchesSearch =
      activity.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSeverity = severityFilter === "all" || activity.severity === severityFilter
    const matchesStatus = statusFilter === "all" || activity.status === statusFilter

    return matchesSearch && matchesSeverity && matchesStatus
  })

  const handleResolveAlert = (alertId: string, resolution: string) => {
    setSuspiciousActivity(
      suspiciousActivity.map((alert) => (alert.id === alertId ? { ...alert, status: resolution } : alert)),
    )
  }

  const handleBlockUser = () => {
    if (selectedAlert && blockReason.trim()) {
      const newBlockedUser = {
        id: selectedAlert.userId,
        name: selectedAlert.userName,
        email: selectedAlert.userEmail,
        reason: blockReason,
        blockedDate: new Date().toISOString().split("T")[0],
        blockedBy: currentAdmin.id,
        referralsBlocked: selectedAlert.referralsInvolved,
      }
      setBlockedUsers([...blockedUsers, newBlockedUser])
      handleResolveAlert(selectedAlert.id, "blocked")
      setShowBlockDialog(false)
      setShowAlertDetails(false)
      setBlockReason("")
    }
  }

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "investigating":
        return "bg-blue-100 text-blue-800"
      case "confirmed":
        return "bg-red-100 text-red-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "blocked":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "low":
        return <Activity className="h-4 w-4 text-blue-600" />
      default:
        return <Shield className="h-4 w-4 text-gray-600" />
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
          <h2 className="text-3xl font-bold tracking-tight">Fraud Prevention</h2>
        </div>
      </div>

      {/* Fraud Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suspiciousActivity.filter((a) => a.status === "pending").length}</div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Severity</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suspiciousActivity.filter((a) => a.severity === "high").length}</div>
            <p className="text-xs text-muted-foreground">Critical issues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Users</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blockedUsers.length}</div>
            <p className="text-xs text-muted-foreground">Permanently blocked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Loss</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${suspiciousActivity.reduce((sum, a) => sum + a.potentialLoss, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Prevented fraud</p>
          </CardContent>
        </Card>
      </div>

      {/* Fraud Detection Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            Fraud Detection Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Auto Detection</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={fraudSettings.autoDetection}
                  onCheckedChange={(checked) => setFraudSettings({ ...fraudSettings, autoDetection: checked })}
                />
                <span className="text-sm">{fraudSettings.autoDetection ? "Enabled" : "Disabled"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>IP Tracking</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={fraudSettings.ipTracking}
                  onCheckedChange={(checked) => setFraudSettings({ ...fraudSettings, ipTracking: checked })}
                />
                <span className="text-sm">{fraudSettings.ipTracking ? "Enabled" : "Disabled"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Device Fingerprinting</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={fraudSettings.deviceFingerprinting}
                  onCheckedChange={(checked) => setFraudSettings({ ...fraudSettings, deviceFingerprinting: checked })}
                />
                <span className="text-sm">{fraudSettings.deviceFingerprinting ? "Enabled" : "Disabled"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Velocity Checks</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={fraudSettings.velocityChecks}
                  onCheckedChange={(checked) => setFraudSettings({ ...fraudSettings, velocityChecks: checked })}
                />
                <span className="text-sm">{fraudSettings.velocityChecks ? "Enabled" : "Disabled"}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="maxPerDay">Max Referrals Per Day</Label>
              <Input
                id="maxPerDay"
                type="number"
                value={fraudSettings.maxReferralsPerDay}
                onChange={(e) => setFraudSettings({ ...fraudSettings, maxReferralsPerDay: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPerIP">Max Referrals Per IP</Label>
              <Input
                id="maxPerIP"
                type="number"
                value={fraudSettings.maxReferralsPerIP}
                onChange={(e) => setFraudSettings({ ...fraudSettings, maxReferralsPerIP: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold">Suspicious Pattern Threshold (%)</Label>
              <Input
                id="threshold"
                type="number"
                value={fraudSettings.suspiciousPatternThreshold}
                onChange={(e) =>
                  setFraudSettings({ ...fraudSettings, suspiciousPatternThreshold: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suspicious Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Suspicious Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="User, email, description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Severity</Label>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
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
                    setSeverityFilter("all")
                    setStatusFilter("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Activity Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Detected Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Potential Loss</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivity.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-mono text-sm">{activity.detectedDate}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{activity.userName}</div>
                        <div className="text-sm text-gray-500">{activity.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getSeverityIcon(activity.severity)}
                        <span>{activity.type.replace("_", " ")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityBadgeColor(activity.severity)}>{activity.severity}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(activity.status)}>{activity.status}</Badge>
                    </TableCell>
                    <TableCell>${activity.potentialLoss}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAlert(activity)
                            setShowAlertDetails(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {activity.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResolveAlert(activity.id, "resolved")}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAlert(activity)
                                setShowBlockDialog(true)
                              }}
                            >
                              <Ban className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Blocked Users */}
      <Card>
        <CardHeader>
          <CardTitle>Blocked Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Blocked Date</TableHead>
                <TableHead>Blocked By</TableHead>
                <TableHead>Referrals Blocked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blockedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{user.reason}</TableCell>
                  <TableCell>{user.blockedDate}</TableCell>
                  <TableCell>{user.blockedBy}</TableCell>
                  <TableCell>{user.referralsBlocked}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alert Details Dialog */}
      <Dialog open={showAlertDetails} onOpenChange={setShowAlertDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Suspicious Activity Details</DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Alert ID</Label>
                  <p className="text-lg font-mono">{selectedAlert.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Detected Date</Label>
                  <p className="text-lg">{selectedAlert.detectedDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">User</Label>
                  <div>
                    <p className="text-lg">{selectedAlert.userName}</p>
                    <p className="text-sm text-gray-500">{selectedAlert.userEmail}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Type</Label>
                  <div className="flex items-center space-x-2">
                    {getSeverityIcon(selectedAlert.severity)}
                    <span>{selectedAlert.type.replace("_", " ")}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Severity</Label>
                  <Badge className={getSeverityBadgeColor(selectedAlert.severity)}>{selectedAlert.severity}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={getStatusBadgeColor(selectedAlert.status)}>{selectedAlert.status}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">IP Address</Label>
                  <p className="text-lg font-mono">{selectedAlert.ipAddress}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Device Fingerprint</Label>
                  <p className="text-lg font-mono">{selectedAlert.deviceFingerprint}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Referrals Involved</Label>
                  <p className="text-lg font-bold">{selectedAlert.referralsInvolved}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Potential Loss</Label>
                  <p className="text-lg font-bold text-red-600">${selectedAlert.potentialLoss}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Description</Label>
                <p className="text-lg">{selectedAlert.description}</p>
              </div>

              {selectedAlert.status === "pending" && (
                <div className="border-t pt-4">
                  <div className="flex space-x-4">
                    <Button
                      onClick={() => {
                        handleResolveAlert(selectedAlert.id, "resolved")
                        setShowAlertDetails(false)
                      }}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Resolved
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setShowAlertDetails(false)
                        setShowBlockDialog(true)
                      }}
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      Block User
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Block User Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block User</DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm">
                  You are about to permanently block <strong>{selectedAlert.userName}</strong> from the referral system.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="blockReason">Reason for Blocking</Label>
                <Textarea
                  id="blockReason"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Please provide a detailed reason for blocking this user..."
                  required
                />
              </div>
              <div className="flex space-x-4">
                <Button variant="destructive" onClick={handleBlockUser} disabled={!blockReason.trim()}>
                  <Ban className="mr-2 h-4 w-4" />
                  Block User
                </Button>
                <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
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
