"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gift, BarChart3, Code, Users, DollarSign } from "lucide-react"
import BonusCampaigns from "./bonus-campaigns"
import PromoCodes from "./promo-codes"
import BonusClaims from "./bonus-claims"
import BonusAnalytics from "./bonus-analytics"

interface BonusManagementProps {
  currentAdmin: any
}

type BonusView = "overview" | "campaigns" | "codes" | "claims" | "analytics"

const mockBonusStats = {
  totalCampaigns: 12,
  activeCampaigns: 8,
  totalCodes: 45,
  activeCodes: 23,
  totalClaims: 1847,
  claimsToday: 67,
  totalBonusValue: 125400,
  redemptionRate: 68.5,
}

export default function BonusManagement({ currentAdmin }: BonusManagementProps) {
  const [view, setView] = useState<BonusView>("overview")

  const renderContent = () => {
    switch (view) {
      case "campaigns":
        return <BonusCampaigns currentAdmin={currentAdmin} onBack={() => setView("overview")} />
      case "codes":
        return <PromoCodes currentAdmin={currentAdmin} onBack={() => setView("overview")} />
      case "claims":
        return <BonusClaims currentAdmin={currentAdmin} onBack={() => setView("overview")} />
      case "analytics":
        return <BonusAnalytics currentAdmin={currentAdmin} onBack={() => setView("overview")} />
      default:
        return (
          <div className="space-y-4 md:space-y-6">
            {/* Responsive header */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Bonuses & Promotions</h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Manage campaigns, promo codes, and bonus claims
              </p>
            </div>

            {/* Responsive stats grid */}
            <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                  <Gift className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockBonusStats.activeCampaigns}</div>
                  <p className="text-xs text-muted-foreground">{mockBonusStats.totalCampaigns} total campaigns</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Promo Codes</CardTitle>
                  <Code className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockBonusStats.activeCodes}</div>
                  <p className="text-xs text-muted-foreground">{mockBonusStats.totalCodes} total codes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockBonusStats.totalClaims.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+{mockBonusStats.claimsToday} today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bonus Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${mockBonusStats.totalBonusValue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{mockBonusStats.redemptionRate}% redemption rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Mobile-responsive quick actions grid */}
            <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setView("campaigns")}>
                <CardHeader className="text-center pb-3">
                  <Gift className="h-6 w-6 md:h-8 md:w-8 mx-auto text-blue-600" />
                  <CardTitle className="text-base md:text-lg">Bonus Campaigns</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className="text-xs md:text-sm text-muted-foreground">Create and manage bonus campaigns</p>
                  <Button className="mt-2 md:mt-4 w-full text-xs md:text-sm">Manage Campaigns</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setView("codes")}>
                <CardHeader className="text-center pb-3">
                  <Code className="h-6 w-6 md:h-8 md:w-8 mx-auto text-green-600" />
                  <CardTitle className="text-base md:text-lg">Promo Codes</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className="text-xs md:text-sm text-muted-foreground">Generate and track promo codes</p>
                  <Button className="mt-2 md:mt-4 w-full text-xs md:text-sm">Manage Codes</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setView("claims")}>
                <CardHeader className="text-center pb-3">
                  <Users className="h-6 w-6 md:h-8 md:w-8 mx-auto text-purple-600" />
                  <CardTitle className="text-base md:text-lg">Bonus Claims</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className="text-xs md:text-sm text-muted-foreground">View and manage user claims</p>
                  <Button className="mt-2 md:mt-4 w-full text-xs md:text-sm">View Claims</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setView("analytics")}>
                <CardHeader className="text-center pb-3">
                  <BarChart3 className="h-6 w-6 md:h-8 md:w-8 mx-auto text-orange-600" />
                  <CardTitle className="text-base md:text-lg">Analytics</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className="text-xs md:text-sm text-muted-foreground">View bonus performance metrics</p>
                  <Button className="mt-2 md:mt-4 w-full text-xs md:text-sm">View Analytics</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )
    }
  }

  return <div className="space-y-6">{renderContent()}</div>
}
