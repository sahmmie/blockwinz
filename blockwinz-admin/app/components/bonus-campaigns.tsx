"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Plus, Edit, Trash2, Eye, Calendar, Target, DollarSign, Users } from "lucide-react"

interface BonusCampaignsProps {
  currentAdmin: any
  onBack: () => void
}

const mockCampaigns = [
  {
    id: "1",
    name: "Welcome Bonus",
    type: "welcome",
    status: "active",
    bonusAmount: 100,
    bonusType: "percentage",
    minDeposit: 20,
    maxBonus: 500,
    wageringRequirement: 35,
    validDays: 30,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    totalClaims: 1247,
    totalValue: 45600,
    description: "100% match bonus up to $500 for new players",
  },
  {
    id: "2",
    name: "Free Spins Friday",
    type: "free_spins",
    status: "active",
    bonusAmount: 50,
    bonusType: "fixed",
    minDeposit: 0,
    maxBonus: 50,
    wageringRequirement: 40,
    validDays: 7,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    totalClaims: 892,
    totalValue: 12400,
    description: "50 free spins every Friday",
  },
  {
    id: "3",
    name: "VIP Cashback",
    type: "cashback",
    status: "active",
    bonusAmount: 10,
    bonusType: "percentage",
    minDeposit: 100,
    maxBonus: 1000,
    wageringRequirement: 1,
    validDays: 7,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    totalClaims: 156,
    totalValue: 23400,
    description: "10% weekly cashback for VIP players",
  },
  {
    id: "4",
    name: "Holiday Special",
    type: "seasonal",
    status: "expired",
    bonusAmount: 200,
    bonusType: "percentage",
    minDeposit: 50,
    maxBonus: 1000,
    wageringRequirement: 30,
    validDays: 14,
    startDate: "2023-12-15",
    endDate: "2024-01-05",
    totalClaims: 567,
    totalValue: 89200,
    description: "200% holiday bonus for limited time",
  },
]

export default function BonusCampaigns({ currentAdmin, onBack }: BonusCampaignsProps) {
  const [campaigns, setCampaigns] = useState(mockCampaigns)
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "welcome",
    bonusAmount: 0,
    bonusType: "percentage",
    minDeposit: 0,
    maxBonus: 0,
    wageringRequirement: 35,
    validDays: 30,
    startDate: "",
    endDate: "",
    description: "",
  })

  const handleCreateCampaign = () => {
    const newCampaign = {
      id: Date.now().toString(),
      ...formData,
      status: "active",
      totalClaims: 0,
      totalValue: 0,
    }
    setCampaigns([...campaigns, newCampaign])
    setShowCreateDialog(false)
    setFormData({
      name: "",
      type: "welcome",
      bonusAmount: 0,
      bonusType: "percentage",
      minDeposit: 0,
      maxBonus: 0,
      wageringRequirement: 35,
      validDays: 30,
      startDate: "",
      endDate: "",
      description: "",
    })
  }

  const handleEditCampaign = () => {
    setCampaigns(
      campaigns.map((campaign) => (campaign.id === selectedCampaign.id ? { ...campaign, ...formData } : campaign)),
    )
    setShowEditDialog(false)
    setSelectedCampaign(null)
  }

  const handleToggleCampaign = (campaignId: string) => {
    setCampaigns(
      campaigns.map((campaign) =>
        campaign.id === campaignId
          ? { ...campaign, status: campaign.status === "active" ? "inactive" : "active" }
          : campaign,
      ),
    )
  }

  const handleDeleteCampaign = (campaignId: string) => {
    setCampaigns(campaigns.filter((campaign) => campaign.id !== campaignId))
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "expired":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "welcome":
        return "bg-blue-100 text-blue-800"
      case "free_spins":
        return "bg-purple-100 text-purple-800"
      case "cashback":
        return "bg-orange-100 text-orange-800"
      case "seasonal":
        return "bg-pink-100 text-pink-800"
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
          <h2 className="text-3xl font-bold tracking-tight">Bonus Campaigns</h2>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      {/* Campaign Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              {campaigns.filter((c) => c.status === "active").length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + c.totalClaims, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${campaigns.reduce((sum, c) => sum + c.totalValue, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Bonus value distributed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Claim Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68.5%</div>
            <p className="text-xs text-muted-foreground">Campaign effectiveness</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bonus</TableHead>
                <TableHead>Claims</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>
                    <Badge className={getTypeBadgeColor(campaign.type)}>{campaign.type.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(campaign.status)}>{campaign.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {campaign.bonusType === "percentage" ? `${campaign.bonusAmount}%` : campaign.bonusAmount}
                    {campaign.maxBonus > 0 && ` (max $${campaign.maxBonus})`}
                  </TableCell>
                  <TableCell>{campaign.totalClaims.toLocaleString()}</TableCell>
                  <TableCell>${campaign.totalValue.toLocaleString()}</TableCell>
                  <TableCell>{campaign.endDate}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Switch
                        checked={campaign.status === "active"}
                        onCheckedChange={() => handleToggleCampaign(campaign.id)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCampaign(campaign)
                          setShowViewDialog(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCampaign(campaign)
                          setFormData(campaign)
                          setShowEditDialog(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteCampaign(campaign.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Campaign Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter campaign name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Campaign Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome Bonus</SelectItem>
                    <SelectItem value="deposit">Deposit Bonus</SelectItem>
                    <SelectItem value="free_spins">Free Spins</SelectItem>
                    <SelectItem value="cashback">Cashback</SelectItem>
                    <SelectItem value="seasonal">Seasonal</SelectItem>
                    <SelectItem value="loyalty">Loyalty Reward</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bonusAmount">Bonus Amount</Label>
                <Input
                  id="bonusAmount"
                  type="number"
                  value={formData.bonusAmount}
                  onChange={(e) => setFormData({ ...formData, bonusAmount: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bonusType">Bonus Type</Label>
                <Select
                  value={formData.bonusType}
                  onValueChange={(value) => setFormData({ ...formData, bonusType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="free_spins">Free Spins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxBonus">Max Bonus ($)</Label>
                <Input
                  id="maxBonus"
                  type="number"
                  value={formData.maxBonus}
                  onChange={(e) => setFormData({ ...formData, maxBonus: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minDeposit">Min Deposit ($)</Label>
                <Input
                  id="minDeposit"
                  type="number"
                  value={formData.minDeposit}
                  onChange={(e) => setFormData({ ...formData, minDeposit: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wageringRequirement">Wagering Requirement (x)</Label>
                <Input
                  id="wageringRequirement"
                  type="number"
                  value={formData.wageringRequirement}
                  onChange={(e) => setFormData({ ...formData, wageringRequirement: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validDays">Valid Days</Label>
                <Input
                  id="validDays"
                  type="number"
                  value={formData.validDays}
                  onChange={(e) => setFormData({ ...formData, validDays: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter campaign description"
              />
            </div>

            <div className="flex space-x-4">
              <Button onClick={handleCreateCampaign}>Create Campaign</Button>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Campaign Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
          </DialogHeader>
          {/* Same form fields as create dialog */}
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Campaign Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Campaign Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome Bonus</SelectItem>
                    <SelectItem value="deposit">Deposit Bonus</SelectItem>
                    <SelectItem value="free_spins">Free Spins</SelectItem>
                    <SelectItem value="cashback">Cashback</SelectItem>
                    <SelectItem value="seasonal">Seasonal</SelectItem>
                    <SelectItem value="loyalty">Loyalty Reward</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button onClick={handleEditCampaign}>Save Changes</Button>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Campaign Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Campaign Details</DialogTitle>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Campaign Name</Label>
                  <p className="text-lg">{selectedCampaign.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Type</Label>
                  <Badge className={getTypeBadgeColor(selectedCampaign.type)}>
                    {selectedCampaign.type.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={getStatusBadgeColor(selectedCampaign.status)}>{selectedCampaign.status}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Bonus Amount</Label>
                  <p className="text-lg">
                    {selectedCampaign.bonusType === "percentage"
                      ? `${selectedCampaign.bonusAmount}%`
                      : `$${selectedCampaign.bonusAmount}`}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Total Claims</Label>
                  <p className="text-lg">{selectedCampaign.totalClaims.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Total Value</Label>
                  <p className="text-lg">${selectedCampaign.totalValue.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Description</Label>
                <p className="text-lg">{selectedCampaign.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
