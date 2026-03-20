"use client"

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
} from "recharts"
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Users, Target, Gift } from "lucide-react"
import { useState } from "react"

interface BonusAnalyticsProps {
  currentAdmin: any
  onBack: () => void
}

const mockBonusAnalytics = [
  { date: "2024-01-01", claims: 45, value: 4500, redemptions: 38 },
  { date: "2024-01-02", claims: 52, value: 5200, redemptions: 44 },
  { date: "2024-01-03", claims: 48, value: 4800, redemptions: 41 },
  { date: "2024-01-04", claims: 55, value: 5500, redemptions: 47 },
  { date: "2024-01-05", claims: 61, value: 6100, redemptions: 53 },
  { date: "2024-01-06", claims: 58, value: 5800, redemptions: 50 },
  { date: "2024-01-07", claims: 63, value: 6300, redemptions: 55 },
]

const bonusTypeData = [
  { name: "Welcome", value: 35, color: "#8884d8" },
  { name: "Deposit", value: 25, color: "#82ca9d" },
  { name: "Free Spins", value: 20, color: "#ffc658" },
  { name: "Cashback", value: 15, color: "#ff7300" },
  { name: "Loyalty", value: 5, color: "#00ff00" },
]

const campaignPerformance = [
  { name: "Welcome Bonus", claims: 1247, value: 45600, conversion: 68.5 },
  { name: "Free Spins Friday", claims: 892, value: 12400, conversion: 45.2 },
  { name: "VIP Cashback", claims: 156, value: 23400, conversion: 89.1 },
  { name: "Reload Bonus", claims: 445, value: 18900, conversion: 52.3 },
]

export default function BonusAnalytics({ currentAdmin, onBack }: BonusAnalyticsProps) {
  const [timeRange, setTimeRange] = useState("7d")
  const [selectedMetric, setSelectedMetric] = useState("claims")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Overview
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Bonus Analytics</h2>
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
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +15.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$125,400</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +8.7% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68.5%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              -2.1% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,956</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +12.3% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Claims Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Bonus Claims Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                claims: {
                  label: "Claims",
                  color: "hsl(var(--chart-1))",
                },
                value: {
                  label: "Value",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockBonusAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="claims" stroke="var(--color-claims)" name="Claims" />
                  <Line type="monotone" dataKey="value" stroke="var(--color-value)" name="Value ($)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Bonus Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Bonus Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                welcome: { label: "Welcome", color: "#8884d8" },
                deposit: { label: "Deposit", color: "#82ca9d" },
                freespins: { label: "Free Spins", color: "#ffc658" },
                cashback: { label: "Cashback", color: "#ff7300" },
                loyalty: { label: "Loyalty", color: "#00ff00" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bonusTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {bonusTypeData.map((entry, index) => (
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

      {/* Campaign Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              claims: {
                label: "Claims",
                color: "hsl(var(--chart-1))",
              },
              value: {
                label: "Value",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="claims" fill="var(--color-claims)" name="Claims" />
                <Bar dataKey="value" fill="var(--color-value)" name="Value ($)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
