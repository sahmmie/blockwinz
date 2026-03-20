"use client"

import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
  trend?: {
    value: string
    isPositive: boolean
  }
}

interface MobileStatsGridProps {
  stats: StatCardProps[]
  columns?: {
    mobile: number
    tablet: number
    desktop: number
  }
}

export default function MobileStatsGrid({
  stats,
  columns = { mobile: 2, tablet: 2, desktop: 4 },
}: MobileStatsGridProps) {
  const gridClasses = `grid gap-3 md:gap-4 grid-cols-${columns.mobile} sm:grid-cols-${columns.tablet} lg:grid-cols-${columns.desktop}`

  return (
    <div className={gridClasses}>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">{stat.title}</CardTitle>
            {stat.icon && <div className="h-4 w-4 text-muted-foreground flex-shrink-0">{stat.icon}</div>}
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
            </div>
            {stat.description && <p className="text-xs text-muted-foreground mt-1 truncate">{stat.description}</p>}
            {stat.trend && (
              <p
                className={`text-xs mt-1 flex items-center ${
                  stat.trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                <span className="mr-1">{stat.trend.isPositive ? "↗" : "↘"}</span>
                {stat.trend.value}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
