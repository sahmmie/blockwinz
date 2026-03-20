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
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react"
import { useState } from "react"

interface GameAnalyticsProps {
  games: any[]
  onBack: () => void
}

const mockAnalyticsData = [
  { date: "2024-01-01", totalBets: 45000, totalWinnings: 42000, plays: 1200 },
  { date: "2024-01-02", totalBets: 52000, totalWinnings: 48000, plays: 1350 },
  { date: "2024-01-03", totalBets: 48000, totalWinnings: 45000, plays: 1180 },
  { date: "2024-01-04", totalBets: 55000, totalWinnings: 51000, plays: 1420 },
  { date: "2024-01-05", totalBets: 61000, totalWinnings: 56000, plays: 1580 },
  { date: "2024-01-06", totalBets: 58000, totalWinnings: 54000, plays: 1460 },
  { date: "2024-01-07", totalBets: 63000, totalWinnings: 58000, plays: 1650 },
]

const gamePerformanceData = [
  { name: "Lucky Slots", revenue: 52400, plays: 15420, winRate: 95.9 },
  { name: "Blackjack Pro", revenue: 8800, plays: 8930, winRate: 99.0 },
  { name: "Roulette Master", revenue: 33270, plays: 12100, winRate: 97.3 },
  { name: "Poker Championship", revenue: 10770, plays: 5670, winRate: 98.1 },
]

const categoryData = [
  { name: "Slots", value: 45, color: "#8884d8" },
  { name: "Table Games", value: 35, color: "#82ca9d" },
  { name: "Poker", value: 20, color: "#ffc658" },
]

export default function GameAnalytics({ games, onBack }: GameAnalyticsProps) {
  const [timeRange, setTimeRange] = useState("7d")
  const [selectedMetric, setSelectedMetric] = useState("revenue")

  const totalRevenue = games.reduce((sum, game) => sum + (game.totalBets - game.totalWinnings), 0)
  const totalPlays = games.reduce((sum, game) => sum + game.totalPlays, 0)
  const averageRTP = games.reduce((sum, game) => sum + game.rtp, 0) / games.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Games
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Game Analytics</h2>
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
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +12.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlays.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +8.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average RTP</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRTP.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              -0.3% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">House Edge</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(100 - averageRTP).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +0.3% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue",
                  color: "hsl(var(--chart-1))",
                },
                winnings: {
                  label: "Winnings",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockAnalyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="totalBets" stroke="var(--color-revenue)" name="Total Bets" />
                  <Line type="monotone" dataKey="totalWinnings" stroke="var(--color-winnings)" name="Total Winnings" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Game Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Game Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                slots: { label: "Slots", color: "#8884d8" },
                table: { label: "Table Games", color: "#82ca9d" },
                poker: { label: "Poker", color: "#ffc658" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {categoryData.map((entry, index) => (
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

      {/* Game Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Game Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: {
                label: "Revenue",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gamePerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
