"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Settings, BarChart3, History, Search, Plus, TrendingUp, DollarSign, Users } from "lucide-react"
import GameAnalytics from "./game-analytics"
import GameHistory from "./game-history"

interface GameManagementProps {
  currentAdmin: any
}

type GameView = "list" | "analytics" | "history" | "edit" | "add"

const mockGames = [
  {
    id: "1",
    name: "Lucky Slots",
    category: "slots",
    status: "active",
    rtp: 96.5,
    maxBet: 1000,
    minBet: 1,
    odds: 1.95,
    totalPlays: 15420,
    totalWinnings: 1245600,
    totalBets: 1298000,
    lastUpdated: "2024-01-15",
  },
  {
    id: "2",
    name: "Blackjack Pro",
    category: "table",
    status: "active",
    rtp: 99.2,
    maxBet: 5000,
    minBet: 10,
    odds: 1.5,
    totalPlays: 8930,
    totalWinnings: 892400,
    totalBets: 901200,
    lastUpdated: "2024-01-14",
  },
  {
    id: "3",
    name: "Roulette Master",
    category: "table",
    status: "maintenance",
    rtp: 97.3,
    maxBet: 2000,
    minBet: 5,
    odds: 35,
    totalPlays: 12100,
    totalWinnings: 1176730,
    totalBets: 1210000,
    lastUpdated: "2024-01-13",
  },
  {
    id: "4",
    name: "Poker Championship",
    category: "poker",
    status: "inactive",
    rtp: 98.1,
    maxBet: 10000,
    minBet: 25,
    odds: 2.1,
    totalPlays: 5670,
    totalWinnings: 556230,
    totalBets: 567000,
    lastUpdated: "2024-01-12",
  },
]

export default function GameManagement({ currentAdmin }: GameManagementProps) {
  const [view, setView] = useState<GameView>("list")
  const [games, setGames] = useState(mockGames)
  const [selectedGame, setSelectedGame] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [configData, setConfigData] = useState({
    rtp: 0,
    maxBet: 0,
    minBet: 0,
    odds: 0,
  })

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || game.category === categoryFilter
    const matchesStatus = statusFilter === "all" || game.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleToggleGame = (gameId: string) => {
    setGames(
      games.map((game) =>
        game.id === gameId ? { ...game, status: game.status === "active" ? "inactive" : "active" } : game,
      ),
    )
  }

  const handleEditConfig = (game: any) => {
    setSelectedGame(game)
    setConfigData({
      rtp: game.rtp,
      maxBet: game.maxBet,
      minBet: game.minBet,
      odds: game.odds,
    })
    setShowConfigDialog(true)
  }

  const handleSaveConfig = () => {
    setGames(
      games.map((game) =>
        game.id === selectedGame.id
          ? { ...game, ...configData, lastUpdated: new Date().toISOString().split("T")[0] }
          : game,
      ),
    )
    setShowConfigDialog(false)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "slots":
        return "bg-purple-100 text-purple-800"
      case "table":
        return "bg-blue-100 text-blue-800"
      case "poker":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (view === "analytics") {
    return <GameAnalytics games={games} onBack={() => setView("list")} />
  }

  if (view === "history") {
    return <GameHistory games={games} onBack={() => setView("list")} />
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Responsive header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Game Management</h2>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button variant="outline" onClick={() => setView("analytics")} className="w-full sm:w-auto">
            <BarChart3 className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
          </Button>
          <Button variant="outline" onClick={() => setView("history")} className="w-full sm:w-auto">
            <History className="mr-2 h-4 w-4" />
            History
          </Button>
          <Button onClick={() => setView("add")} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Game
          </Button>
        </div>
      </div>

      {/* Responsive stats grid */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Games</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{games.length}</div>
            <p className="text-xs text-muted-foreground">{games.filter((g) => g.status === "active").length} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {games.reduce((sum, game) => sum + game.totalPlays, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bets</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${games.reduce((sum, game) => sum + game.totalBets, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">House Edge</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                ((games.reduce((sum, game) => sum + game.totalBets, 0) -
                  games.reduce((sum, game) => sum + game.totalWinnings, 0)) /
                  games.reduce((sum, game) => sum + game.totalBets, 0)) *
                100
              ).toFixed(1)}
              %
            </div>
            <p className="text-xs text-muted-foreground">Average across all games</p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile-responsive games list */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:space-x-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="slots">Slots</SelectItem>
                  <SelectItem value="table">Table Games</SelectItem>
                  <SelectItem value="poker">Poker</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Game Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>RTP %</TableHead>
                  <TableHead>Max Bet</TableHead>
                  <TableHead>Total Plays</TableHead>
                  <TableHead>Win Rate</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGames.map((game) => (
                  <TableRow key={game.id}>
                    <TableCell className="font-medium">{game.name}</TableCell>
                    <TableCell>
                      <Badge className={getCategoryBadgeColor(game.category)}>{game.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(game.status)}>{game.status}</Badge>
                    </TableCell>
                    <TableCell>{game.rtp}%</TableCell>
                    <TableCell>${game.maxBet.toLocaleString()}</TableCell>
                    <TableCell>{game.totalPlays.toLocaleString()}</TableCell>
                    <TableCell>{((game.totalWinnings / game.totalBets) * 100).toFixed(1)}%</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Switch checked={game.status === "active"} onCheckedChange={() => handleToggleGame(game.id)} />
                        <Button variant="outline" size="sm" onClick={() => handleEditConfig(game)}>
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card Layout */}
          <div className="lg:hidden space-y-3">
            {filteredGames.map((game) => (
              <Card key={game.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium truncate">{game.name}</h3>
                      <Badge className={getStatusBadgeColor(game.status)}>{game.status}</Badge>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getCategoryBadgeColor(game.category)}>{game.category}</Badge>
                      <span className="text-sm text-gray-500">RTP: {game.rtp}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-gray-500">Max Bet:</span>
                        <span className="font-medium ml-1">${game.maxBet.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Plays:</span>
                        <span className="font-medium ml-1">{game.totalPlays.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Switch checked={game.status === "active"} onCheckedChange={() => handleToggleGame(game.id)} />
                    <Button variant="outline" size="sm" onClick={() => handleEditConfig(game)}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Game Configuration</DialogTitle>
          </DialogHeader>
          {selectedGame && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Game Name</Label>
                <p className="text-lg font-medium">{selectedGame.name}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rtp">RTP (%)</Label>
                <Input
                  id="rtp"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={configData.rtp}
                  onChange={(e) => setConfigData({ ...configData, rtp: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxBet">Max Bet ($)</Label>
                <Input
                  id="maxBet"
                  type="number"
                  min="0"
                  value={configData.maxBet}
                  onChange={(e) => setConfigData({ ...configData, maxBet: Number.parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minBet">Min Bet ($)</Label>
                <Input
                  id="minBet"
                  type="number"
                  min="0"
                  value={configData.minBet}
                  onChange={(e) => setConfigData({ ...configData, minBet: Number.parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="odds">Odds</Label>
                <Input
                  id="odds"
                  type="number"
                  step="0.1"
                  min="0"
                  value={configData.odds}
                  onChange={(e) => setConfigData({ ...configData, odds: Number.parseFloat(e.target.value) })}
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <Button onClick={handleSaveConfig}>Save Changes</Button>
                <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
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
