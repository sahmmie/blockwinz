"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, Users, Settings } from "lucide-react"

interface MaintenanceSettingsProps {
  currentAdmin: any
  maintenanceMode: boolean
  onToggleMaintenance: (enabled: boolean) => void
}

export default function MaintenanceSettings({
  currentAdmin,
  maintenanceMode,
  onToggleMaintenance,
}: MaintenanceSettingsProps) {
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "We're currently performing scheduled maintenance to improve your experience. Please check back soon!",
  )
  const [estimatedDuration, setEstimatedDuration] = useState("2 hours")
  const [allowAdminAccess, setAllowAdminAccess] = useState(true)
  const [notifyUsers, setNotifyUsers] = useState(true)
  const [scheduledMaintenance, setScheduledMaintenance] = useState(false)
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")

  const handleToggleMaintenance = () => {
    onToggleMaintenance(!maintenanceMode)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Maintenance Mode</h2>
        <p className="text-muted-foreground">Control system maintenance and user access</p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Current Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-4 h-4 rounded-full ${maintenanceMode ? "bg-red-500 animate-pulse" : "bg-green-500"}`}
              />
              <div>
                <p className="font-medium">{maintenanceMode ? "Maintenance Mode Active" : "System Online"}</p>
                <p className="text-sm text-muted-foreground">
                  {maintenanceMode ? "Users cannot access the platform" : "All systems operational"}
                </p>
              </div>
            </div>
            <Badge variant={maintenanceMode ? "destructive" : "default"}>
              {maintenanceMode ? "MAINTENANCE" : "LIVE"}
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Switch checked={maintenanceMode} onCheckedChange={handleToggleMaintenance} id="maintenance-toggle" />
            <Label htmlFor="maintenance-toggle" className="font-medium">
              Enable Maintenance Mode
            </Label>
          </div>

          {maintenanceMode && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-red-800 font-medium">Warning</span>
              </div>
              <p className="text-red-700 text-sm">
                Maintenance mode is currently active. Regular users cannot access the platform.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Maintenance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Maintenance Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maintenance-message">Maintenance Message</Label>
            <Textarea
              id="maintenance-message"
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              placeholder="Message displayed to users during maintenance"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated-duration">Estimated Duration</Label>
              <Input
                id="estimated-duration"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                placeholder="e.g., 2 hours"
              />
            </div>
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch checked={allowAdminAccess} onCheckedChange={setAllowAdminAccess} id="admin-access" />
                  <Label htmlFor="admin-access" className="text-sm">
                    Allow admin access
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={notifyUsers} onCheckedChange={setNotifyUsers} id="notify-users" />
                  <Label htmlFor="notify-users" className="text-sm">
                    Notify users via email
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Scheduled Maintenance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={scheduledMaintenance}
              onCheckedChange={setScheduledMaintenance}
              id="scheduled-maintenance"
            />
            <Label htmlFor="scheduled-maintenance" className="font-medium">
              Schedule Maintenance
            </Label>
          </div>

          {scheduledMaintenance && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduled-date">Date</Label>
                <Input
                  id="scheduled-date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduled-time">Time</Label>
                <Input
                  id="scheduled-time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Active Sessions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">89</div>
                <div className="text-sm text-blue-800">Total Active</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-sm text-green-800">Admin Sessions</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">77</div>
                <div className="text-sm text-orange-800">User Sessions</div>
              </div>
            </div>

            {maintenanceMode && (
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  Force Disconnect All User Sessions
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button
          variant={maintenanceMode ? "destructive" : "default"}
          onClick={handleToggleMaintenance}
          className="flex-1"
        >
          {maintenanceMode ? "Disable Maintenance Mode" : "Enable Maintenance Mode"}
        </Button>

        {scheduledMaintenance && (
          <Button variant="outline" className="flex-1">
            Schedule Maintenance
          </Button>
        )}
      </div>
    </div>
  )
}
