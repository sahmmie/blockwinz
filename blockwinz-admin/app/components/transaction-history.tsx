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
  Filter,
  Download,
  Eye,
  ArrowUpCircle,
  ArrowDownCircle,
  Gamepad2,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

interface TransactionHistoryProps {
  currentAdmin: any
  onBack: () => void
}

const mockTransactions = [
  {
    id: "txn_001",
    userId: "user_123",
    userName: "John Doe",
    userEmail: "john@example.com",
    type: "deposit",
    amount: 250,
    method: "credit_card",
    status: "completed",
    timestamp: "2024-01-15 14:30:25",
    transactionId: "cc_4242424242424242",
    fee: 7.5,
    currency: "USD",
    description: "Credit card deposit",
  },
  {
    id: "txn_002",
    userId: "user_456",
    userName: "Jane Smith",
    userEmail: "jane@example.com",
    type: "withdrawal",
    amount: 500,
    method: "bank_transfer",
    status: "pending",
    timestamp: "2024-01-15 14:25:10",
    transactionId: "bt_1234567890",
    fee: 15,
    currency: "USD",
    description: "Bank transfer withdrawal",
  },
  {
    id: "txn_003",
    userId: "user_789",
    userName: "Bob Johnson",
    userEmail: "bob@example.com",
    type: "game_win",
    amount: 125,
    method: "game_credit",
    status: "completed",
    timestamp: "2024-01-15 14:20:45",
    transactionId: "game_lucky_slots_001",
    fee: 0,
    currency: "USD",
    description: "Lucky Slots win",
  },
  {
    id: "txn_004",
    userId: "user_101",
    userName: "Alice Brown",
    userEmail: "alice@example.com",
    type: "game_loss",
    amount: 75,
    method: "game_debit",
    status: "completed",
    timestamp: "2024-01-15 14:15:30",
    transactionId: "game_blackjack_002",
    fee: 0,
    currency: "USD",
    description: "Blackjack Pro loss",
  },
  {
    id: "txn_005",
    userId: "user_202",
    userName: "Charlie Wilson",
    userEmail: "charlie@example.com",
    type: "deposit",
    amount: 100,
    method: "crypto",
    status: "completed",
    timestamp: "2024-01-15 14:10:15",
    transactionId: "btc_1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    fee: 2,
    currency: "USD",
    description: "Bitcoin deposit",
  },
  {
    id: "txn_006",
    userId: "user_303",
    userName: "Diana Prince",
    userEmail: "diana@example.com",
    type: "withdrawal",
    amount: 300,
    method: "e_wallet",
    status: "failed",
    timestamp: "2024-01-15 14:05:00",
    transactionId: "ew_paypal_001",
    fee: 9,
    currency: "USD",
    description: "PayPal withdrawal failed",
  },
]

export default function TransactionHistory({ currentAdmin, onBack }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState(mockTransactions)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [showTransactionDetails, setShowTransactionDetails] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || transaction.type === typeFilter
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
    const matchesMethod = methodFilter === "all" || transaction.method === methodFilter

    return matchesSearch && matchesType && matchesStatus && matchesMethod
  })

  const handleExportTransactions = () => {
    // In a real app, this would generate and download a CSV/Excel file
    console.log("Exporting transactions...", filteredTransactions)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownCircle className="h-4 w-4 text-green-600" />
      case "withdrawal":
        return <ArrowUpCircle className="h-4 w-4 text-blue-600" />
      case "game_win":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "game_loss":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Gamepad2 className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "deposit":
        return "bg-green-100 text-green-800"
      case "withdrawal":
        return "bg-blue-100 text-blue-800"
      case "game_win":
        return "bg-emerald-100 text-emerald-800"
      case "game_loss":
        return "bg-red-100 text-red-800"
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Overview
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Transaction History</h2>
        </div>
        <Button onClick={handleExportTransactions}>
          <Download className="mr-2 h-4 w-4" />
          Export Transactions
        </Button>
      </div>

      {/* Transaction Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTransactions.length}</div>
            <p className="text-xs text-muted-foreground">In current filter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${filteredTransactions.reduce((sum, txn) => sum + txn.amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Transaction volume</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredTransactions.filter((txn) => txn.type === "deposit").length}
            </div>
            <p className="text-xs text-muted-foreground">
              $
              {filteredTransactions
                .filter((txn) => txn.type === "deposit")
                .reduce((sum, txn) => sum + txn.amount, 0)
                .toLocaleString()}{" "}
              volume
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredTransactions.filter((txn) => txn.type === "withdrawal").length}
            </div>
            <p className="text-xs text-muted-foreground">
              $
              {filteredTransactions
                .filter((txn) => txn.type === "withdrawal")
                .reduce((sum, txn) => sum + txn.amount, 0)
                .toLocaleString()}{" "}
              volume
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="User, transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="deposit">Deposits</SelectItem>
                  <SelectItem value="withdrawal">Withdrawals</SelectItem>
                  <SelectItem value="game_win">Game Wins</SelectItem>
                  <SelectItem value="game_loss">Game Losses</SelectItem>
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
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  <SelectItem value="e_wallet">E-Wallet</SelectItem>
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
                  setTypeFilter("all")
                  setStatusFilter("all")
                  setMethodFilter("all")
                  setDateFilter("all")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({filteredTransactions.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-sm">{transaction.timestamp}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{transaction.userName}</div>
                      <div className="text-sm text-gray-500">{transaction.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(transaction.type)}
                      <Badge className={getTypeBadgeColor(transaction.type)}>
                        {transaction.type.replace("_", " ")}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">${transaction.amount}</div>
                      {transaction.fee > 0 && <div className="text-sm text-gray-500">Fee: ${transaction.fee}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getMethodBadgeColor(transaction.method)}>
                      {transaction.method.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(transaction.status)}>{transaction.status}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{transaction.transactionId}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTransaction(transaction)
                        setShowTransactionDetails(true)
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

      {/* Transaction Details Dialog */}
      <Dialog open={showTransactionDetails} onOpenChange={setShowTransactionDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Transaction ID</Label>
                  <p className="text-lg font-mono">{selectedTransaction.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Timestamp</Label>
                  <p className="text-lg">{selectedTransaction.timestamp}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">User</Label>
                  <div>
                    <p className="text-lg">{selectedTransaction.userName}</p>
                    <p className="text-sm text-gray-500">{selectedTransaction.userEmail}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Type</Label>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(selectedTransaction.type)}
                    <Badge className={getTypeBadgeColor(selectedTransaction.type)}>
                      {selectedTransaction.type.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Amount</Label>
                  <p className="text-lg font-bold">${selectedTransaction.amount}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Fee</Label>
                  <p className="text-lg">${selectedTransaction.fee}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Method</Label>
                  <Badge className={getMethodBadgeColor(selectedTransaction.method)}>
                    {selectedTransaction.method.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={getStatusBadgeColor(selectedTransaction.status)}>
                    {selectedTransaction.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">External Transaction ID</Label>
                  <p className="text-lg font-mono">{selectedTransaction.transactionId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Currency</Label>
                  <p className="text-lg">{selectedTransaction.currency}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Description</Label>
                <p className="text-lg">{selectedTransaction.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
