"use client"

import * as React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check } from "lucide-react"
import { useSelectedBot } from "@/contexts/selected-bot-context"
import { BotTradesTable } from "@/components/bot-trades-table"

interface BotTrade {
  action: string
  price: number
  timestamp: string
}

interface BotStats {
  updated_at: string
  hourly_pnl_usd: {
    value: number
    estimated: boolean
    basis: string
  }
  daily_pnl_usd: {
    value: number
    estimated: boolean
    basis: string
  }
  trades_hourly: {
    value: number
    estimated: boolean
    basis: string
  }
  win_rate_daily: {
    value: number
    estimated: boolean
    basis: string
  }
  samples: {
    ticks_lookback: number
    trips_total: number
    trips_1h: number
    trips_today: number
    open_buys: number
  }
  assumptions: {
    trade_size_SOL: number
    lookback_days_for_ticks: number
  }
}

interface BotCardProps {
  id: string
  name: string
  modelName: string
  description?: string
  architecture?: string
  monthlyPerformance?: number
  accuracy?: string
  mape?: number
  tags?: string[]
  userCount?: number
  totalTrades?: number
  ranking?: number
  totalBots?: number
  topPercentile?: number
  todaysTrades: BotTrade[]
  stats?: BotStats
  index?: number
}

export function BotCard({
  id,
  name,
  modelName,
  description,
  architecture,
  monthlyPerformance,
  accuracy,
  mape,
  tags,
  userCount,
  totalTrades,
  ranking,
  totalBots,
  topPercentile,
  todaysTrades,
  stats,
  index = 0,
}: BotCardProps) {
  const { selectedBot, selectBot, deselectBot } = useSelectedBot()
  const isSelected = selectedBot?.id === id

  // Array of bot avatar images that alternate
  const avatarImages = [
    "https://api.dicebear.com/7.x/bottts/svg?seed=bot1&backgroundColor=3b82f6",
    "https://api.dicebear.com/7.x/bottts/svg?seed=bot2&backgroundColor=a855f7",
    "https://api.dicebear.com/7.x/bottts/svg?seed=bot3&backgroundColor=22c55e",
    "https://api.dicebear.com/7.x/bottts/svg?seed=bot4&backgroundColor=f97316",
    "https://api.dicebear.com/7.x/bottts/svg?seed=bot5&backgroundColor=ec4899",
    "https://api.dicebear.com/7.x/bottts/svg?seed=bot6&backgroundColor=06b6d4",
  ]

  const avatarColors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-green-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-cyan-500",
  ]

  const avatarImage = avatarImages[index % avatarImages.length]
  const avatarColor = avatarColors[index % avatarColors.length]

  // Enhanced usage visualization component
  const UsageVisualization = () => {
    if (!userCount || !totalTrades) return null
    
    // Generate usage data points for the last 7 days (simplified)
    const usageData = Array.from({ length: 7 }, (_, i) => {
      const baseUsage = Math.sin((i * Math.PI) / 6) * 0.4 + 0.6
      const variation = Math.random() * 0.3 - 0.15
      return Math.max(0.2, Math.min(1, baseUsage + variation))
    })

    // Color schemes for different performance tiers
    const getColorScheme = () => {
      if (ranking && ranking <= 3) {
        // Top 3: Gold to orange gradient
        return "bg-gradient-to-t from-amber-500 to-yellow-400"
      } else if (ranking && ranking <= 6) {
        // Top 6: Blue to cyan gradient  
        return "bg-gradient-to-t from-blue-500 to-cyan-400"
      } else if (ranking && ranking <= 9) {
        // Top 9: Purple to pink gradient
        return "bg-gradient-to-t from-purple-500 to-pink-400"
      } else {
        // Others: Green to emerald gradient
        return "bg-gradient-to-t from-emerald-500 to-green-400"
      }
    }

    const colorClass = getColorScheme()

    return (
      <div className="flex items-end gap-1 h-12 w-24">
        {usageData.map((height, i) => (
          <div
            key={i}
            className={`${colorClass} rounded-sm flex-1 shadow-sm`}
            style={{ height: `${height * 100}%` }}
          />
        ))}
      </div>
    )
  }

  const handleToggleSelect = () => {
    if (isSelected) {
      deselectBot()
    } else {
      selectBot({
        id,
        name,
        modelName,
        todaysTrades,
      })
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={avatarImage} alt={name} />
              <AvatarFallback className={avatarColor}>
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {architecture ? `${architecture} • ` : ''}Model: {modelName}
              </p>
              {description && (
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {description}
                </p>
              )}
              {stats?.updated_at && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Updated: {new Date(stats.updated_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={handleToggleSelect}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className="ml-4"
          >
            {isSelected ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Currently Selected
              </>
            ) : (
              "Select Bot"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Performance Metrics */}
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              {monthlyPerformance && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    +{monthlyPerformance}%
                  </p>
                  <p className="text-xs text-muted-foreground">Monthly ROI</p>
                </div>
              )}
              {accuracy && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{accuracy}</p>
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                </div>
              )}
              {mape && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{mape.toFixed(2)}%</p>
                  <p className="text-xs text-muted-foreground">MAPE</p>
                </div>
              )}
            </div>
            
            {/* Usage Visualization */}
            <div className="flex items-end gap-3">
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-medium">7d Usage</p>
                <p className="text-xs text-muted-foreground/70">Activity</p>
              </div>
              <UsageVisualization />
            </div>
          </div>

          {/* Enhanced Usage Stats */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
            <div className="space-y-1">
              {ranking && totalBots && (
                <div className="flex items-center gap-2">
                  <div className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                    #{ranking}/{totalBots}
                  </div>
                  {topPercentile && (
                    <div className="text-xs font-medium text-emerald-600">
                      Top {100 - topPercentile}%
                    </div>
                  )}
                </div>
              )}
              {userCount && (
                <div className="text-sm">
                  <span className="font-bold text-primary">{userCount.toLocaleString()}</span>
                  <span className="text-muted-foreground ml-1">users</span>
                </div>
              )}
            </div>
            <div className="space-y-1 text-right">
              {totalTrades && (
                <div className="text-sm">
                  <span className="font-bold text-primary">{totalTrades.toLocaleString()}</span>
                  <span className="text-muted-foreground ml-1">trades</span>
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                {todaysTrades && todaysTrades.length > 0 
                  ? `${todaysTrades.length} today`
                  : 'Select for portfolio'
                }
              </div>
            </div>
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 6).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}


          {/* Stats Grid if available */}
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              {/* Trades Table Column */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Today&apos;s Trades</h4>
                <BotTradesTable trades={todaysTrades} compact />
              </div>

              {/* Stats Cards Column */}
              <div className="space-y-3">
                {/* Hourly PnL USD */}
                <Card className="border">
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground">Hourly PnL (USD)</div>
                    <div className="text-lg font-bold mt-1">
                      ${stats.hourly_pnl_usd.value.toFixed(5)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {stats.hourly_pnl_usd.estimated ? "Estimated" : "Actual"}
                    </div>
                  </CardContent>
                </Card>

                {/* Daily PnL USD */}
                <Card className="border">
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground">Daily PnL (USD)</div>
                    <div className="text-lg font-bold mt-1">
                      ${stats.daily_pnl_usd.value.toFixed(5)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {stats.daily_pnl_usd.estimated ? "Estimated" : "Actual"}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
