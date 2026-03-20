"use client"

import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"

interface MobileTableWrapperProps {
  children: ReactNode
  mobileContent: ReactNode
  className?: string
}

export default function MobileTableWrapper({ children, mobileContent, className = "" }: MobileTableWrapperProps) {
  return (
    <Card className={className}>
      {/* Desktop Table */}
      <div className="hidden lg:block">{children}</div>

      {/* Mobile Content */}
      <div className="lg:hidden">{mobileContent}</div>
    </Card>
  )
}
