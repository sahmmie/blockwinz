"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, History, ArrowUpCircle, ArrowDownCircle, DollarSign, Clock } from "lucide-react"
import TransactionHistory from "./transaction-history"
import WithdrawalManagement from "./withdrawal-management"
import TransactionAnalytics from "./transaction-analytics"

interface TransactionManagementProps {
  currentAdmin: any
}

type TransactionView = "overview" | "history" | "withdrawals" | "analytics"

const mockTransactionStats = {
  totalTransactions: 15847,
  totalDeposits: 8923,
  totalWithdrawals: 2156,
  pendingWithdrawals: 47,
  totalVolume: 2847500,
  depositVolume: 1956800,
  withdrawalVolume: 890700,
  averageDeposit: 219,
  averageWithdrawal: 413,
}

export default function TransactionManagement({ currentAdmin }: TransactionManagementProps) {
  const [view, setView] = useState<TransactionView>("overview")

  const renderContent = () => {
    switch (view) {
      case "history":
        return <TransactionHistory currentAdmin={currentAdmin} onBack={() => setView("overview")} />
      case "withdrawals":
        return <WithdrawalManagement currentAdmin={currentAdmin} onBack={() => setView("overview")} />
      case "analytics":
        return <TransactionAnalytics currentAdmin={currentAdmin} onBack={() => setView("overview")} />
      default:
        return (
          <div className="space-y-4 md:space-y-6">
            {/* Responsive header */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Transaction Management</h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Monitor deposits, withdrawals, and transaction history
                </p>
              </div>
            </div>

            {/* Responsive stats grid */}
            <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockTransactionStats.totalTransactions.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">All time transactions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${mockTransactionStats.totalVolume.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Transaction volume</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockTransactionStats.pendingWithdrawals}</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Withdrawal</CardTitle>
                  <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${mockTransactionStats.averageWithdrawal}</div>
                  <p className="text-xs text-muted-foreground">Average amount</p>
                </CardContent>
              </Card>
            </div>

            {/* Mobile-responsive quick actions */}
            <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setView("history")}>
                <CardHeader className="text-center pb-3">
                  <History className="h-6 w-6 md:h-8 md:w-8 mx-auto text-blue-600" />
                  <CardTitle className="text-base md:text-lg">Transaction History</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className="text-xs md:text-sm text-muted-foreground">View and filter all transactions</p>
                  <Button className="mt-2 md:mt-4 w-full text-xs md:text-sm">View History</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setView("withdrawals")}>
                <CardHeader className="text-center pb-3">
                  <ArrowUpCircle className="h-6 w-6 md:h-8 md:w-8 mx-auto text-green-600" />
                  <CardTitle className="text-base md:text-lg">Withdrawal Management</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className="text-xs md:text-sm text-muted-foreground">Approve or deny withdrawal requests</p>
                  <Button className="mt-2 md:mt-4 w-full text-xs md:text-sm">Manage Withdrawals</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setView("analytics")}>
                <CardHeader className="text-center pb-3">
                  <ArrowDownCircle className="h-6 w-6 md:h-8 md:w-8 mx-auto text-purple-600" />
                  <CardTitle className="text-base md:text-lg">Transaction Analytics</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className="text-xs md:text-sm text-muted-foreground">View transaction trends and insights</p>
                  <Button className="mt-2 md:mt-4 w-full text-xs md:text-sm">View Analytics</Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Summary */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Deposit Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Deposits</span>
                      <span className="font-medium">{mockTransactionStats.totalDeposits.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Deposit Volume</span>
                      <span className="font-medium">${mockTransactionStats.depositVolume.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Average Deposit</span>
                      <span className="font-medium">${mockTransactionStats.averageDeposit}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Withdrawal Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Withdrawals</span>
                      <span className="font-medium">{mockTransactionStats.totalWithdrawals.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Withdrawal Volume</span>
                      <span className="font-medium">${mockTransactionStats.withdrawalVolume.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Average Withdrawal</span>
                      <span className="font-medium">${mockTransactionStats.averageWithdrawal}</span>
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
