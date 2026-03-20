"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Settings, BarChart3, Shield, FileText, UserCheck } from "lucide-react"
import ReferralSettings from "./referral-settings"
import ReferralMonitoring from "./referral-monitoring"
import ReferralUserManagement from "./referral-user-management"
import ReferralFraudPrevention from "./referral-fraud-prevention"
import ReferralReporting from "./referral-reporting"

interface ReferralManagementProps {
  currentAdmin: any
}

type ReferralView = "overview" | "settings" | "monitoring" | "users" | "fraud" | "reporting"

const mockReferralStats = {
  totalReferrals: 1247,
  activeReferrals: 156,
  completedReferrals: 891,
  pendingReferrals: 89,
  totalRewardsDistributed: 45600,
  averageReward: 51.2,
  conversionRate: 68.5,
  topReferrer: "john_doe_123",
  systemEnabled: true,
  minDepositAmount: 50,
  rewardPercentage: 10,
  completionTimeframe: 30,
}

export default function ReferralManagement({ currentAdmin }: ReferralManagementProps) {
  const [view, setView] = useState<ReferralView>("overview")

  const renderContent = () => {
    switch (view) {
      case "settings":
        return <ReferralSettings currentAdmin={currentAdmin} onBack={() => setView("overview")} />
      case "monitoring":
        return <ReferralMonitoring currentAdmin={currentAdmin} onBack={() => setView("overview")} />
      case "users":
        return <ReferralUserManagement currentAdmin={currentAdmin} onBack={() => setView("overview")} />
      case "fraud":
        return <ReferralFraudPrevention currentAdmin={currentAdmin} onBack={() => setView("overview")} />
      case "reporting":
        return <ReferralReporting currentAdmin={currentAdmin} onBack={() => setView("overview")} />
      default:
        return (
          <div className="space-y-4 md:space-y-6">
            {/* Responsive header */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Referral System Management</h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Manage referral programs, monitor activity, and prevent fraud
              </p>
            </div>

            {/* Mobile-responsive stats */}
            <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockReferralStats.totalReferrals.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{mockReferralStats.activeReferrals} currently active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rewards Distributed</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${mockReferralStats.totalRewardsDistributed.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Avg: ${mockReferralStats.averageReward} per referral</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockReferralStats.conversionRate}%</div>
                  <p className="text-xs text-muted-foreground">Referrals to completed deposits</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Status</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockReferralStats.systemEnabled ? "Active" : "Disabled"}</div>
                  <p className="text-xs text-muted-foreground">
                    {mockReferralStats.rewardPercentage}% reward, ${mockReferralStats.minDepositAmount} min deposit
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Mobile-responsive quick actions */}
            <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setView("settings")}>
                <CardHeader className="text-center">
                  <Settings className="h-8 w-8 mx-auto text-blue-600" />
                  <CardTitle className="text-lg">Core Settings</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">Configure referral system parameters and rewards</p>
                  <Button className="mt-4 w-full">Manage Settings</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setView("monitoring")}>
                <CardHeader className="text-center">
                  <BarChart3 className="h-8 w-8 mx-auto text-green-600" />
                  <CardTitle className="text-lg">Monitoring</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">Track active, pending, and completed referrals</p>
                  <Button className="mt-4 w-full">View Activity</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setView("users")}>
                <CardHeader className="text-center">
                  <Users className="h-8 w-8 mx-auto text-purple-600" />
                  <CardTitle className="text-lg">User Management</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">Manage user referral codes and capabilities</p>
                  <Button className="mt-4 w-full">Manage Users</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setView("fraud")}>
                <CardHeader className="text-center">
                  <Shield className="h-8 w-8 mx-auto text-red-600" />
                  <CardTitle className="text-lg">Fraud Prevention</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">Monitor suspicious patterns and block users</p>
                  <Button className="mt-4 w-full">Security Center</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setView("reporting")}>
                <CardHeader className="text-center">
                  <FileText className="h-8 w-8 mx-auto text-orange-600" />
                  <CardTitle className="text-lg">Reporting</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">Generate reports and track performance</p>
                  <Button className="mt-4 w-full">View Reports</Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Summary */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Referral Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Pending Referrals</span>
                      <span className="font-medium">{mockReferralStats.pendingReferrals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Completed Today</span>
                      <span className="font-medium">23</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Rewards Paid Today</span>
                      <span className="font-medium">$1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Top Referrer</span>
                      <span className="font-medium">{mockReferralStats.topReferrer}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">System Status</span>
                      <span
                        className={`font-medium ${mockReferralStats.systemEnabled ? "text-green-600" : "text-red-600"}`}
                      >
                        {mockReferralStats.systemEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Min Deposit</span>
                      <span className="font-medium">${mockReferralStats.minDepositAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Reward Percentage</span>
                      <span className="font-medium">{mockReferralStats.rewardPercentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Completion Timeframe</span>
                      <span className="font-medium">{mockReferralStats.completionTimeframe} days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
    }
  }

  return <div className="space-y-6">{renderContent()}</div>
}
