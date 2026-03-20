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
import { ArrowLeft, Search, Filter, Download, Eye } from "lucide-react"

interface GameHistoryProps {
  games: any[]
  onBack: () => void
}

const mockGameLogs = [
  {
    id: "1",
    gameId: "1",
    gameName: "Lucky Slots",
    userId: "user_123",
    userName: "John Doe",
    userEmail: "john@example.com",
    betAmount: 50,
    winAmount: 75,
    result: "win",
    timestamp: "2024-01-15 14:30:25",
    sessionId: "sess_abc123",
    ip: "192.168.1.100",
  },
  {
    id: "2",
    gameId: "2",
    gameName: "Blackjack Pro",
    userId: "user_456",
    userName: "Jane Smith",
    userEmail: "jane@example.com",
    betAmount: 100,
    winAmount: 0,
    result: "loss",
    timestamp: "2024-01-15 14:28:15",
    sessionId: "sess_def456",
    ip: "192.168.1.101",
  },
  {
    id: "3",
    gameId: "1",
    gameName: "Lucky Slots",
    userId: "user_789",
    userName: "Bob Johnson",
    userEmail: "bob@example.com",
    betAmount: 25,
    winAmount: 125,
    result: "win",
    timestamp: "2024-01-15 14:25:10",
    sessionId: "sess_ghi789",
    ip: "192.168.1.102",
  },
  {
    id: "4",
    gameId: "3",
    gameName: "Roulette Master",
    userId: "user_101",
    userName: "Alice Brown",
    userEmail: "alice@example.com",
    betAmount: 200,
    winAmount: 0,
    result: "loss",
    timestamp: "2024-01-15 14:20:45",
    sessionId: "sess_jkl101",
    ip: "192.168.1.103",
  },
  {
    id: "5",
    gameId: "2",
    gameName: "Blackjack Pro",
    userId: "user_202",
    userName: "Charlie Wilson",
    userEmail: "charlie@example.com",
    betAmount: 75,
    winAmount: 150,
    result: "win",
    timestamp: "2024-01-15 14:15:30",
    sessionId: "sess_mno202",
    ip: "192.168.1.104",
  },
]

export default function GameHistory({ games, onBack }: GameHistoryProps) {
  const [logs, setLogs] = useState(mockGameLogs)
  const [searchTerm, setSearchTerm] = useState("")
  const [gameFilter, setGameFilter] = useState("all")
  const [resultFilter, setResultFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("today")
  const [selectedLog, setSelectedLog] = useState<any>(null)
  const [showLogDetails, setShowLogDetails] = useState(false)

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.gameName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.sessionId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesGame = gameFilter === "all" || log.gameId === gameFilter
    const matchesResult = resultFilter === "all" || log.result === resultFilter

    return matchesSearch && matchesGame && matchesResult
  })

  const getResultBadgeColor = (result: string) => {
    switch (result) {
      case "win":
        return "bg-green-100 text-green-800"
      case "loss":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleExportLogs = () => {
    // In a real app, this would generate and download a CSV/Excel file
    console.log("Exporting logs...", filteredLogs)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Games
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Game History</h2>
        </div>
        <Button onClick={handleExportLogs}>
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredLogs.length}</div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${filteredLogs.reduce((sum, log) => sum + log.betAmount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Sum of all bets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Winnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${filteredLogs.reduce((sum, log) => sum + log.winAmount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Sum of all winnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((filteredLogs.filter((log) => log.result === "win").length / filteredLogs.length) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Player win percentage</p>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="User, game, session..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Game</Label>
              <Select value={gameFilter} onValueChange={setGameFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Games" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Games</SelectItem>
                  {games.map((game) => (
                    <SelectItem key={game.id} value={game.id}>
                      {game.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Result</Label>
              <Select value={resultFilter} onValueChange={setResultFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Results" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="win">Wins</SelectItem>
                  <SelectItem value="loss">Losses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
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
                  setGameFilter("all")
                  setResultFilter("all")
                  setDateFilter("today")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Game Logs ({filteredLogs.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Game</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Bet Amount</TableHead>
                <TableHead>Win Amount</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Session ID</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                  <TableCell className="font-medium">{log.gameName}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.userName}</div>
                      <div className="text-sm text-gray-500">{log.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>${log.betAmount}</TableCell>
                  <TableCell>${log.winAmount}</TableCell>
                  <TableCell>
                    <Badge className={getResultBadgeColor(log.result)}>{log.result}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{log.sessionId}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedLog(log)
                        setShowLogDetails(true)
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

      {/* Log Details Dialog */}
      <Dialog open={showLogDetails} onOpenChange={setShowLogDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Game Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Log ID</Label>
                  <p className="text-lg font-mono">{selectedLog.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Timestamp</Label>
                  <p className="text-lg">{selectedLog.timestamp}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Game</Label>
                  <p className="text-lg">{selectedLog.gameName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Player</Label>
                  <div>
                    <p className="text-lg">{selectedLog.userName}</p>
                    <p className="text-sm text-gray-500">{selectedLog.userEmail}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Bet Amount</Label>
                  <p className="text-lg">${selectedLog.betAmount}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Win Amount</Label>
                  <p className="text-lg">${selectedLog.winAmount}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Result</Label>
                  <Badge className={getResultBadgeColor(selectedLog.result)}>{selectedLog.result}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Net Result</Label>
                  <p
                    className={`text-lg font-bold ${selectedLog.winAmount - selectedLog.betAmount >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    ${selectedLog.winAmount - selectedLog.betAmount}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Session ID</Label>
                  <p className="text-lg font-mono">{selectedLog.sessionId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">IP Address</Label>
                  <p className="text-lg font-mono">{selectedLog.ip}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
