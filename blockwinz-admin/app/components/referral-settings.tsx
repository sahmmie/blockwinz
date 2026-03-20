"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Settings, DollarSign, Clock, Percent } from "lucide-react"

interface ReferralSettingsProps {
  currentAdmin: any
  onBack: () => void
}

export default function ReferralSettings({ currentAdmin, onBack }: ReferralSettingsProps) {
  const [settings, setSettings] = useState({
    systemEnabled: true,
    minDepositAmount: 50,
    rewardPercentage: 10,
    completionTimeframe: 30,
    maxRewardAmount: 500,
    referralCodeLength: 8,
    allowCustomCodes: false,
    requireVerification: true,
    autoApproveRewards: false,
    rewardType: "percentage", // percentage, fixed, tiered
    tierSettings: {
      tier1: { deposits: 1, reward: 10 },
      tier2: { deposits: 5, reward: 15 },
      tier3: { deposits: 10, reward: 20 },
    },
    restrictions: {
      maxReferralsPerUser: 100,
      cooldownPeriod: 24, // hours
      sameBankAccount: false,
      sameIPAddress: false,
    },
    notifications: {
      emailReferrer: true,
      emailReferred: true,
      adminNotifications: true,
    },
  })

  const handleSaveSettings = () => {
    // In a real app, this would save to the backend
    console.log("Saving referral settings:", settings)
    // Show success message
  }

  const handleResetToDefaults = () => {
    setSettings({
      systemEnabled: true,
      minDepositAmount: 50,
      rewardPercentage: 10,
      completionTimeframe: 30,
      maxRewardAmount: 500,
      referralCodeLength: 8,
      allowCustomCodes: false,
      requireVerification: true,
      autoApproveRewards: false,
      rewardType: "percentage",
      tierSettings: {
        tier1: { deposits: 1, reward: 10 },
        tier2: { deposits: 5, reward: 15 },
        tier3: { deposits: 10, reward: 20 },
      },
      restrictions: {
        maxReferralsPerUser: 100,
        cooldownPeriod: 24,
        sameBankAccount: false,
        sameIPAddress: false,
      },
      notifications: {
        emailReferrer: true,
        emailReferred: true,
        adminNotifications: true,
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Overview
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Referral System Settings</h2>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleResetToDefaults}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSaveSettings}>
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>

      {/* Core Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Core Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>System Status</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.systemEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, systemEnabled: checked })}
                />
                <span className="text-sm">{settings.systemEnabled ? "Enabled" : "Disabled"}</span>
              </div>
              <p className="text-xs text-muted-foreground">Toggle the entire referral system on/off</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minDeposit">Minimum Deposit Amount ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="minDeposit"
                  type="number"
                  value={settings.minDepositAmount}
                  onChange={(e) => setSettings({ ...settings, minDepositAmount: Number(e.target.value) })}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">Minimum deposit required to trigger referral reward</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rewardPercentage">Reward Percentage (%)</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="rewardPercentage"
                  type="number"
                  value={settings.rewardPercentage}
                  onChange={(e) => setSettings({ ...settings, rewardPercentage: Number(e.target.value) })}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">Percentage of deposit amount given as reward</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeframe">Completion Timeframe (days)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="timeframe"
                  type="number"
                  value={settings.completionTimeframe}
                  onChange={(e) => setSettings({ ...settings, completionTimeframe: Number(e.target.value) })}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">Days within which referred user must deposit</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxReward">Maximum Reward Amount ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="maxReward"
                  type="number"
                  value={settings.maxRewardAmount}
                  onChange={(e) => setSettings({ ...settings, maxRewardAmount: Number(e.target.value) })}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">Maximum reward amount per referral</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rewardType">Reward Type</Label>
              <Select
                value={settings.rewardType}
                onValueChange={(value) => setSettings({ ...settings, rewardType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage of Deposit</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="tiered">Tiered Rewards</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">How rewards are calculated</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Code Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Code Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="codeLength">Referral Code Length</Label>
              <Input
                id="codeLength"
                type="number"
                min="6"
                max="12"
                value={settings.referralCodeLength}
                onChange={(e) => setSettings({ ...settings, referralCodeLength: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">Length of auto-generated referral codes</p>
            </div>

            <div className="space-y-2">
              <Label>Allow Custom Codes</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.allowCustomCodes}
                  onCheckedChange={(checked) => setSettings({ ...settings, allowCustomCodes: checked })}
                />
                <span className="text-sm">{settings.allowCustomCodes ? "Enabled" : "Disabled"}</span>
              </div>
              <p className="text-xs text-muted-foreground">Allow users to create custom referral codes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification & Approval */}
      <Card>
        <CardHeader>
          <CardTitle>Verification & Approval</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Require User Verification</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.requireVerification}
                  onCheckedChange={(checked) => setSettings({ ...settings, requireVerification: checked })}
                />
                <span className="text-sm">{settings.requireVerification ? "Required" : "Not Required"}</span>
              </div>
              <p className="text-xs text-muted-foreground">Require KYC verification for referral rewards</p>
            </div>

            <div className="space-y-2">
              <Label>Auto-Approve Rewards</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.autoApproveRewards}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoApproveRewards: checked })}
                />
                <span className="text-sm">{settings.autoApproveRewards ? "Enabled" : "Manual Review"}</span>
              </div>
              <p className="text-xs text-muted-foreground">Automatically approve rewards or require manual review</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Restrictions */}
      <Card>
        <CardHeader>
          <CardTitle>Restrictions & Limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxReferrals">Max Referrals Per User</Label>
              <Input
                id="maxReferrals"
                type="number"
                value={settings.restrictions.maxReferralsPerUser}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    restrictions: { ...settings.restrictions, maxReferralsPerUser: Number(e.target.value) },
                  })
                }
              />
              <p className="text-xs text-muted-foreground">Maximum number of referrals per user</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cooldown">Cooldown Period (hours)</Label>
              <Input
                id="cooldown"
                type="number"
                value={settings.restrictions.cooldownPeriod}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    restrictions: { ...settings.restrictions, cooldownPeriod: Number(e.target.value) },
                  })
                }
              />
              <p className="text-xs text-muted-foreground">Time between referral attempts</p>
            </div>

            <div className="space-y-2">
              <Label>Block Same Bank Account</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.restrictions.sameBankAccount}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      restrictions: { ...settings.restrictions, sameBankAccount: checked },
                    })
                  }
                />
                <span className="text-sm">{settings.restrictions.sameBankAccount ? "Blocked" : "Allowed"}</span>
              </div>
              <p className="text-xs text-muted-foreground">Prevent referrals with same bank account</p>
            </div>

            <div className="space-y-2">
              <Label>Block Same IP Address</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.restrictions.sameIPAddress}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      restrictions: { ...settings.restrictions, sameIPAddress: checked },
                    })
                  }
                />
                <span className="text-sm">{settings.restrictions.sameIPAddress ? "Blocked" : "Allowed"}</span>
              </div>
              <p className="text-xs text-muted-foreground">Prevent referrals from same IP address</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Email Referrer</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.notifications.emailReferrer}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, emailReferrer: checked },
                    })
                  }
                />
                <span className="text-sm">{settings.notifications.emailReferrer ? "Enabled" : "Disabled"}</span>
              </div>
              <p className="text-xs text-muted-foreground">Notify referrer when reward is earned</p>
            </div>

            <div className="space-y-2">
              <Label>Email Referred User</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.notifications.emailReferred}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, emailReferred: checked },
                    })
                  }
                />
                <span className="text-sm">{settings.notifications.emailReferred ? "Enabled" : "Disabled"}</span>
              </div>
              <p className="text-xs text-muted-foreground">Welcome email to referred users</p>
            </div>

            <div className="space-y-2">
              <Label>Admin Notifications</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.notifications.adminNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, adminNotifications: checked },
                    })
                  }
                />
                <span className="text-sm">{settings.notifications.adminNotifications ? "Enabled" : "Disabled"}</span>
              </div>
              <p className="text-xs text-muted-foreground">Notify admins of referral activity</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tiered Rewards (if selected) */}
      {settings.rewardType === "tiered" && (
        <Card>
          <CardHeader>
            <CardTitle>Tiered Reward Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Tier 1 (1+ deposits)</Label>
                <Input
                  type="number"
                  value={settings.tierSettings.tier1.reward}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tierSettings: {
                        ...settings.tierSettings,
                        tier1: { ...settings.tierSettings.tier1, reward: Number(e.target.value) },
                      },
                    })
                  }
                  placeholder="Reward %"
                />
              </div>
              <div className="space-y-2">
                <Label>Tier 2 (5+ deposits)</Label>
                <Input
                  type="number"
                  value={settings.tierSettings.tier2.reward}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tierSettings: {
                        ...settings.tierSettings,
                        tier2: { ...settings.tierSettings.tier2, reward: Number(e.target.value) },
                      },
                    })
                  }
                  placeholder="Reward %"
                />
              </div>
              <div className="space-y-2">
                <Label>Tier 3 (10+ deposits)</Label>
                <Input
                  type="number"
                  value={settings.tierSettings.tier3.reward}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tierSettings: {
                        ...settings.tierSettings,
                        tier3: { ...settings.tierSettings.tier3, reward: Number(e.target.value) },
                      },
                    })
                  }
                  placeholder="Reward %"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
