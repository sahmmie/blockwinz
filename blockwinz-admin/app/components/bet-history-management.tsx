"use client"

// app/components/bet-history-management.tsx

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Bet {
  id: string
  gameName: string
  userName: string
  betAmount: number
  winAmount: number
  outcome: "won" | "lost" | "pending"
  timestamp: string
}

const dummyBets: Bet[] = [
  {
    id: "1",
    gameName: "Game 1",
    userName: "User A",
    betAmount: 10,
    winAmount: 20,
    outcome: "won",
    timestamp: "2024-01-01 10:00",
  },
  {
    id: "2",
    gameName: "Game 2",
    userName: "User B",
    betAmount: 15,
    winAmount: 0,
    outcome: "lost",
    timestamp: "2024-01-01 11:00",
  },
  {
    id: "3",
    gameName: "Game 3",
    userName: "User C",
    betAmount: 20,
    winAmount: 0,
    outcome: "pending",
    timestamp: "2024-01-01 12:00",
  },
]

const getOutcomeBadgeColor = (outcome: string) => {
  switch (outcome) {
    case "won":
      return "bg-green-100 text-green-800"
    case "lost":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const BetHistoryManagement = () => {
  const [filteredBets, setFilteredBets] = React.useState(dummyBets)

  const handleExportBets = () => {
    // Implement export functionality here
    console.log("Exporting bets...")
  }

  return (
    // Make bet history mobile-responsive
    <div className="space-y-4 md:space-y-6">
      {/* Responsive header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Bet History & Analytics</h2>
          <p className="text-sm md:text-base text-muted-foreground">Monitor betting activity and analyze patterns</p>
        </div>
        <Button onClick={handleExportBets} className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Mobile-responsive filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">{/* Mobile-first filter layout */}</div>
        </CardContent>
      </Card>

      {/* Mobile-responsive bet list */}
      <Card>
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Game</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Bet Amount</TableHead>
                    <TableHead>Win Amount</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBets.map((bet) => (
                    <TableRow key={bet.id}>
                      <TableCell className="font-medium">{bet.gameName}</TableCell>
                      <TableCell>{bet.userName}</TableCell>
                      <TableCell>${bet.betAmount}</TableCell>
                      <TableCell>${bet.winAmount}</TableCell>
                      <TableCell>
                        <Badge className={getOutcomeBadgeColor(bet.outcome)}>{bet.outcome}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            /* view bet details */
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Card Layout */}
          <div className="lg:hidden">
            {filteredBets.map((bet) => (
              <div key={bet.id} className="border-b last:border-b-0 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium truncate">{bet.gameName}</h3>
                      <Badge className={getOutcomeBadgeColor(bet.outcome)}>{bet.outcome}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{bet.userName}</p>
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-gray-500">Bet:</span>
                        <span className="font-medium ml-1">${bet.betAmount}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Win:</span>
                        <span className="font-medium ml-1">${bet.winAmount}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{bet.timestamp}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      /* view bet details */
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BetHistoryManagement
