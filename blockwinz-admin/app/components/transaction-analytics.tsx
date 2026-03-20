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
  Area,
  AreaChart,
} from "recharts"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react"
import { useState } from "react"

interface TransactionAnalyticsProps {
  currentAdmin: any
  onBack: () => void
}

const mockTransactionAnalytics = [
  { date: "2024-01-01", deposits: 12500, withdrawals: 8500, volume: 21000, transactions: 145 },
  { date: "2024-01-02", deposits: 15200, withdrawals: 9800, volume: 25000, transactions: 167 },
  { date: "2024-01-03", deposits: 13800, withdrawals: 7200, volume: 21000, transactions: 134 },
  { date: "2024-01-04", deposits: 16500, withdrawals: 11200, volume: 27700, transactions: 189 },
  { date: "2024-01-05", deposits: 18100, withdrawals: 12800, volume: 30900, transactions: 201 },
  { date: "2024-01-06", deposits: 14900, withdrawals: 9500, volume: 24400, transactions: 156 },
  { date: "2024-01-07", deposits: 17300, withdrawals: 10900, volume: 28200, transactions: 178 },
]

const paymentMethodData = [
  { name: "Credit Card", value: 45, color: "#8884d8" },
  { name: "Bank Transfer", value: 30, color: "#82ca9d" },
  { name: "E-Wallet", value: 15, color: "#ffc658" },
  { name: "Cryptocurrency", value: 10, color: "#ff7300" },
]

const transactionTypeData = [
  { name: "Deposits", value: 65, color: "#00C49F" },
  { name: "Withdrawals", value: 25, color: "#FFBB28" },
  { name: "Game Wins", value: 6, color: "#FF8042" },
  { name: "Game Losses", value: 4, color: "#0088FE" },
]

const hourlyTransactionData = [
  { hour: "00", transactions: 12, volume: 2400 },
  { hour: "01", transactions: 8, volume: 1600 },
  { hour: "02", transactions: 5, volume: 1000 },
  { hour: "03", transactions: 3, volume: 600 },
  { hour: "04", transactions: 4, volume: 800 },
  { hour: "05", transactions: 7, volume: 1400 },
  { hour: "06", transactions: 15, volume: 3000 },
  { hour: "07", transactions: 25, volume: 5000 },
  { hour: "08", transactions: 35, volume: 7000 },
  { hour: "09", transactions: 45, volume: 9000 },
  { hour: "10", transactions: 52, volume: 10400 },
  { hour: "11", transactions: 48, volume: 9600 },
  { hour: "12", transactions: 55, volume: 11000 },
  { hour: "13", transactions: 58, volume: 11600 },
  { hour: "14", transactions: 62, volume: 12400 },
  { hour: "15", transactions: 59, volume: 11800 },
  { hour: "16", transactions: 54, volume: 10800 },
  { hour: "17", transactions: 48, volume: 9600 },
  { hour: "18", transactions: 42, volume: 8400 },
  { hour: "19", transactions: 38, volume: 7600 },
  { hour: "20", transactions: 35, volume: 7000 },
  { hour: "21", transactions: 28, volume: 5600 },
  { hour: "22", transactions: 22, volume: 4400 },
  { hour: "23", transactions: 18, volume: 3600 },
]

export default function TransactionAnalytics({ currentAdmin, onBack }: TransactionAnalyticsProps) {
  const [timeRange, setTimeRange] = useState("7d")
  const [selectedMetric, setSelectedMetric] = useState("volume")

  const totalVolume = mockTransactionAnalytics.reduce((sum, day) => sum + day.volume, 0)
  const totalDeposits = mockTransactionAnalytics.reduce((sum, day) => sum + day.deposits, 0)
  const totalWithdrawals = mockTransactionAnalytics.reduce((sum, day) => sum + day.withdrawals, 0)
  const totalTransactions = mockTransactionAnalytics.reduce((sum, day) => sum + day.transactions, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Overview
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Transaction Analytics</h2>
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
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalVolume.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +12.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +8.7% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deposit Volume</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalDeposits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +15.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Withdrawal Volume</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalWithdrawals.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              -3.1% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Transaction Volume Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Volume Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                deposits: {
                  label: "Deposits",
                  color: "hsl(var(--chart-1))",
                },
                withdrawals: {
                  label: "Withdrawals",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockTransactionAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="deposits"
                    stackId="1"
                    stroke="var(--color-deposits)"
                    fill="var(--color-deposits)"
                    name="Deposits ($)"
                  />
                  <Area
                    type="monotone"
                    dataKey="withdrawals"
                    stackId="1"
                    stroke="var(--color-withdrawals)"
                    fill="var(--color-withdrawals)"
                    name="Withdrawals ($)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Payment Method Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                creditcard: { label: "Credit Card", color: "#8884d8" },
                banktransfer: { label: "Bank Transfer", color: "#82ca9d" },
                ewallet: { label: "E-Wallet", color: "#ffc658" },
                crypto: { label: "Cryptocurrency", color: "#ff7300" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {paymentMethodData.map((entry, index) => (
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
        {/* Transaction Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                deposits: { label: "Deposits", color: "#00C49F" },
                withdrawals: { label: "Withdrawals", color: "#FFBB28" },
                gamewins: { label: "Game Wins", color: "#FF8042" },
                gamelosses: { label: "Game Losses", color: "#0088FE" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={transactionTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {transactionTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Hourly Transaction Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Hourly Transaction Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                transactions: {
                  label: "Transactions",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyTransactionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="transactions" fill="var(--color-transactions)" name="Transactions" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Daily Transaction Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Transaction Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              volume: {
                label: "Volume",
                color: "hsl(var(--chart-1))",
              },
              transactions: {
                label: "Transactions",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockTransactionAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar yAxisId="left" dataKey="volume" fill="var(--color-volume)" name="Volume ($)" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="transactions"
                  stroke="var(--color-transactions)"
                  name="Transactions"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
