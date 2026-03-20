"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import { ArrowLeft, Download, TrendingUp, TrendingDown, DollarSign, Users, Target, Calendar } from "lucide-react"

interface ReferralReportingProps {
  currentAdmin: any
  onBack: () => void
}

const mockReferralAnalytics = [
  { date: "2024-01-01", referrals: 45, completed: 32, rewards: 1600, revenue: 8000 },
  { date: "2024-01-02", referrals: 52, completed: 38, rewards: 1900, revenue: 9500 },
  { date: "2024-01-03", referrals: 48, completed: 35, rewards: 1750, revenue: 8750 },
  { date: "2024-01-04", referrals: 55, completed: 42, rewards: 2100, revenue: 10500 },
  { date: "2024-01-05", referrals: 61, completed: 45, rewards: 2250, revenue: 11250 },
  { date: "2024-01-06", referrals: 58, completed: 41, rewards: 2050, revenue: 10250 },
  { date: "2024-01-07", referrals: 63, completed: 48, rewards: 2400, revenue: 12000 },
]

const topReferrersData = [
  { name: "John Doe", referrals: 25, rewards: 1250, conversionRate: 80 },
  { name: "Alice Brown", referrals: 20, rewards: 1000, conversionRate: 75 },
  { name: "Jane Smith", referrals: 18, rewards: 900, conversionRate: 72 },
  { name: "Bob Johnson", referrals: 15, rewards: 750, conversionRate: 68 },
  { name: "Charlie Wilson", referrals: 12, rewards: 600, conversionRate: 65 },
]

const referralSourceData = [
  { name: "Social Media", value: 40, color: "#8884d8" },
  { name: "Email", value: 25, color: "#82ca9d" },
  { name: "Direct Link", value: 20, color: "#ffc658" },
  { name: "Word of Mouth", value: 15, color: "#ff7300" },
]

const monthlyTrendsData = [
  { month: "Oct", referrals: 1200, completed: 840, rewards: 42000 },
  { month: "Nov", referrals: 1350, completed: 945, rewards: 47250 },
  { month: "Dec", referrals: 1580, completed: 1106, rewards: 55300 },
  { month: "Jan", referrals: 1720, completed: 1204, rewards: 60200 },
]

export default function ReferralReporting({ currentAdmin, onBack }: ReferralReportingProps) {
  const [timeRange, setTimeRange] = useState("7d")
  const [reportType, setReportType] = useState("overview")

  const handleExportReport = () => {
    // In a real app, this would generate and download a report
    console.log("Exporting referral report...", { timeRange, reportType })
  }

  const totalReferrals = mockReferralAnalytics.reduce((sum, day) => sum + day.referrals, 0)
  const totalCompleted = mockReferralAnalytics.reduce((sum, day) => sum + day.completed, 0)
  const totalRewards = mockReferralAnalytics.reduce((sum, day) => sum + day.rewards, 0)
  const totalRevenue = mockReferralAnalytics.reduce((sum, day) => sum + day.revenue, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Overview
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Referral Reporting</h2>
        </div>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReferrals.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +12.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Referrals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompleted.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +8.7% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRewards.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +15.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((totalCompleted / totalReferrals) * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              -2.1% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Referral Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Referral Activity Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                referrals: {
                  label: "Referrals",
                  color: "hsl(var(--chart-1))",
                },
                completed: {
                  label: "Completed",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockReferralAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="referrals"
                    stackId="1"
                    stroke="var(--color-referrals)"
                    fill="var(--color-referrals)"
                    name="Total Referrals"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stackId="1"
                    stroke="var(--color-completed)"
                    fill="var(--color-completed)"
                    name="Completed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Referral Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Referral Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                social: { label: "Social Media", color: "#8884d8" },
                email: { label: "Email", color: "#82ca9d" },
                direct: { label: "Direct Link", color: "#ffc658" },
                word: { label: "Word of Mouth", color: "#ff7300" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={referralSourceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {referralSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Referrers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Referrers Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                referrals: {
                  label: "Referrals",
                  color: "hsl(var(--chart-1))",
                },
                rewards: {
                  label: "Rewards",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topReferrersData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="referrals" fill="var(--color-referrals)" name="Referrals" />
                  <Bar dataKey="rewards" fill="var(--color-rewards)" name="Rewards ($)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                referrals: {
                  label: "Referrals",
                  color: "hsl(var(--chart-1))",
                },
                rewards: {
                  label: "Rewards",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="referrals"
                    stroke="var(--color-referrals)"
                    name="Referrals"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="rewards"
                    stroke="var(--color-rewards)"
                    name="Rewards ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">Average Daily Referrals</Label>
              <p className="text-2xl font-bold">{(totalReferrals / 7).toFixed(1)}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">Average Reward per Referral</Label>
              <p className="text-2xl font-bold">${(totalRewards / totalCompleted).toFixed(2)}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">Revenue per Referral</Label>
              <p className="text-2xl font-bold">${(totalRevenue / totalCompleted).toFixed(2)}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">ROI</Label>
              <p className="text-2xl font-bold">{(((totalRevenue - totalRewards) / totalRewards) * 100).toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
