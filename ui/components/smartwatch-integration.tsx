"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Watch,
  Smartphone,
  Wifi,
  WifiOff,
  RefreshCw,
  Battery,
  Bluetooth,
  CheckCircle,
  Clock,
} from "lucide-react"

interface DeviceData {
  deviceName: string
  deviceType: "apple_watch" | "fitbit" | "garmin" | "samsung"
  batteryLevel: number
  lastSync: Date
  isConnected: boolean
  syncStatus: "syncing" | "synced" | "error" | "pending"
}

interface HealthData {
  heartRate: number[]
  steps: number
  calories: number
  sleepHours: number
  hrv: number
  activeMinutes: number
  timestamp: Date
}

export function SmartwatchIntegration({ onBack }: { onBack: () => void }) {
  const [currentView, setCurrentView] = useState<"overview" | "devices" | "data">("overview")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mock device data
  const [connectedDevices, setConnectedDevices] = useState<DeviceData[]>([
    {
      deviceName: "Alex's Pixel Watch",
      deviceType: "apple_watch",
      batteryLevel: 78,
      lastSync: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      isConnected: true,
      syncStatus: "synced",
    },
  ])

  // Mock real-time health data
  const [healthData, setHealthData] = useState<HealthData>({
    heartRate: [65, 68, 72, 69, 71, 67, 70],
    steps: 8432,
    calories: 2340,
    sleepHours: 7.5,
    hrv: 45,
    activeMinutes: 87,
    timestamp: new Date(),
  })

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "apple_watch":
        return "⌚"
      case "fitbit":
        return "⌚"
      case "garmin":
        return "⌚"
      case "samsung":
        return "⌚"
      default:
        return "⌚"
    }
  }

  const getDeviceName = (type: string) => {
    switch (type) {
      case "apple_watch":
        return "Pixel Watch"
      case "fitbit":
        return "Fitbit"
      case "garmin":
        return "Garmin"
      case "samsung":
        return "Samsung Galaxy Watch"
      default:
        return "Smartwatch"
    }
  }

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case "synced":
        return "bg-green-500"
      case "syncing":
        return "bg-blue-500"
      case "error":
        return "bg-red-500"
      case "pending":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getSyncStatusText = (status: string) => {
    switch (status) {
      case "synced":
        return "Synced"
      case "syncing":
        return "Syncing..."
      case "error":
        return "Sync Error"
      case "pending":
        return "Pending"
      default:
        return "Unknown"
    }
  }

  const formatLastSync = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Update last sync time
    setConnectedDevices((devices) =>
      devices.map((device) => ({
        ...device,
        lastSync: new Date(),
        syncStatus: "synced",
      })),
    )

    setIsRefreshing(false)
  }

  if (currentView === "data") {
    return (
      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setCurrentView("overview")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold">Live Data</h2>
            <p className="text-sm text-muted-foreground">Real-time health metrics</p>
          </div>
        </div>

        {/* Real-time Heart Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              Live Heart Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-red-500">
                {healthData.heartRate[healthData.heartRate.length - 1]} BPM
              </div>
              <div className="h-20 flex items-end justify-center gap-1">
                {healthData.heartRate.map((hr, index) => (
                  <div
                    key={index}
                    className="bg-red-500 w-4 rounded-t"
                    style={{ height: `${(hr / 100) * 80}px` }}
                  ></div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Last 7 readings</p>
            </div>
          </CardContent>
        </Card>

        {/* Today's Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">{healthData.steps.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Steps Today</div>
              <Progress value={(healthData.steps / 10000) * 100} className="h-1 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">{healthData.calories}</div>
              <div className="text-xs text-muted-foreground">Calories Burned</div>
              <Progress value={(healthData.calories / 2500) * 100} className="h-1 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-500">{healthData.sleepHours}h</div>
              <div className="text-xs text-muted-foreground">Sleep Last Night</div>
              <Progress value={(healthData.sleepHours / 8) * 100} className="h-1 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{healthData.activeMinutes}</div>
              <div className="text-xs text-muted-foreground">Active Minutes</div>
              <Progress value={(healthData.activeMinutes / 90) * 100} className="h-1 mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Data Quality */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <h3 className="font-semibold text-sm text-green-700">Data Quality: Excellent</h3>
                <p className="text-xs text-green-600">
                  All sensors are functioning properly. Data accuracy is optimal for AI recommendations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sync Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Last Data Update</div>
                <div className="text-xs text-muted-foreground">{formatLastSync(healthData.timestamp)}</div>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentView === "devices") {
    return (
      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setCurrentView("overview")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold">Connected Devices</h2>
            <p className="text-sm text-muted-foreground">Manage your wearables</p>
          </div>
        </div>

        {/* Connected Devices */}
        <div className="space-y-4">
          {connectedDevices.map((device, index) => (
            <Card key={index} className={device.isConnected ? "border-green-200" : "border-red-200"}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getDeviceIcon(device.deviceType)}</div>
                    <div>
                      <h3 className="font-semibold">{device.deviceName}</h3>
                      <p className="text-sm text-muted-foreground">{getDeviceName(device.deviceType)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`${getSyncStatusColor(device.syncStatus)} text-white text-xs`}>
                          {getSyncStatusText(device.syncStatus)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatLastSync(device.lastSync)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-2">
                      {device.isConnected ? (
                        <Wifi className="w-4 h-4 text-green-500" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-xs ${device.isConnected ? "text-green-600" : "text-red-600"}`}>
                        {device.isConnected ? "Connected" : "Disconnected"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Battery className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{device.batteryLevel}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Device */}
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="p-6 text-center">
            <Smartphone className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Add New Device</h3>
            <p className="text-sm text-muted-foreground mb-4">Connect another smartwatch or fitness tracker</p>
            <Button variant="outline">
              <Bluetooth className="w-4 h-4 mr-2" />
              Scan for Devices
            </Button>
          </CardContent>
        </Card>

        {/* Supported Devices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Supported Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "Pixel Watch", icon: "⌚", supported: true },
                { name: "Fitbit", icon: "⌚", supported: true },
                { name: "Garmin", icon: "⌚", supported: true },
                { name: "Samsung", icon: "⌚", supported: true },
              ].map((device) => (
                <div key={device.name} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                  <span className="text-lg">{device.icon}</span>
                  <span className="text-sm">{device.name}</span>
                  {device.supported && <CheckCircle className="w-3 h-3 text-green-500 ml-auto" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-xl font-bold">Device Integration</h2>
          <p className="text-sm text-muted-foreground">Smartwatch connection</p>
        </div>
      </div>

      {/* Connection Status */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Watch className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-700">Pixel Watch Connected</h3>
              <p className="text-sm text-green-600">Real-time data sync active</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600">Live monitoring</span>
              </div>
            </div>
            <Badge className="bg-green-500 text-white">Connected</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView("data")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">24/7</div>
            <div className="text-xs text-muted-foreground">Monitoring</div>
            <div className="text-xs text-green-600 mt-1">Active</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView("devices")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{connectedDevices.length}</div>
            <div className="text-xs text-muted-foreground">Devices</div>
            <div className="text-xs text-green-600 mt-1">Connected</div>
          </CardContent>
        </Card>
      </div>

      {/* Data Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            Data Sync
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Last Sync</span>
            <span className="text-sm text-muted-foreground">
              {formatLastSync(connectedDevices[0]?.lastSync || new Date())}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sync Progress</span>
              <span>100%</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-500">✓</div>
              <div className="text-xs text-muted-foreground">Heart Rate</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-500">✓</div>
              <div className="text-xs text-muted-foreground">Sleep Data</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-500">✓</div>
              <div className="text-xs text-muted-foreground">Activity</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-500">✓</div>
              <div className="text-xs text-muted-foreground">HRV</div>
            </div>
          </div>

          <Button variant="outline" className="w-full bg-transparent" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Syncing..." : "Sync Now"}
          </Button>
        </CardContent>
      </Card>

      {/* AI Data Usage */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Watch className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Data Processing</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Your smartwatch data is continuously analyzed to provide personalized workout and nutrition
                recommendations. All data is processed securely and privately.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-12 bg-transparent" onClick={() => setCurrentView("data")}>
          <Clock className="w-4 h-4 mr-2" />
          Live Data
        </Button>
        <Button variant="outline" className="h-12 bg-transparent" onClick={() => setCurrentView("devices")}>
          <Watch className="w-4 h-4 mr-2" />
          Manage Devices
        </Button>
      </div>
    </div>
  )
}
