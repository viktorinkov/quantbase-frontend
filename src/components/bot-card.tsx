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
  image?: string
  todaysTrades: BotTrade[]
  stats?: BotStats
  index?: number
}

export function BotCard({
  id,
  name,
  modelName,
  image,
  todaysTrades,
  stats,
  index = 0,
}: BotCardProps) {
  const { selectedBot, selectBot, deselectBot } = useSelectedBot()
  const isSelected = selectedBot?.id === id

  // Fallback avatar images if bot doesn't have an image
  const fallbackAvatars = [
    "https://api.dicebear.com/7.x/bottts/svg?seed=bot1&backgroundColor=3b82f6",
    "https://api.dicebear.com/7.x/bottts/svg?seed=bot2&backgroundColor=a855f7",
    "https://api.dicebear.com/7.x/bottts/svg?seed=bot3&backgroundColor=22c55e",
    "https://api.dicebear.com/7.x/bottts/svg?seed=bot4&backgroundColor=f97316",
    "https://api.dicebear.com/7.x/bottts/svg?seed=bot5&backgroundColor=ec4899",
    "https://api.dicebear.com/7.x/bottts/svg?seed=bot6&backgroundColor=06b6d4",
    "https://api.dicebear.com/7.x/bottts/svg?seed=bot7&backgroundColor=e11d48",
    "https://api.dicebear.com/7.x/bottts/svg?seed=bot8&backgroundColor=8b5cf6",
    "https://api.dicebear.com/7.x/bottts/svg?seed=bot9&backgroundColor=14b8a6",
    "https://api.dicebear.com/7.x/bottts/svg?seed=bot10&backgroundColor=f59e0b",
    "https://api.dicebear.com/7.x/bottts/svg?seed=bot11&backgroundColor=ef4444",
    "https://api.dicebear.com/7.x/bottts/svg?seed=bot12&backgroundColor=10b981",
    "https://api.dicebear.com/7.x/bottts/svg?seed=bot13&backgroundColor=6366f1",
    "https://api.dicebear.com/7.x/bottts/svg?seed=bot14&backgroundColor=ec4899",
    "https://api.dicebear.com/7.x/bottts/svg?seed=bot15&backgroundColor=8b5cf6",
    "https://api.dicebear.com/7.x/bottts/svg?seed=bot16&backgroundColor=6366f1",
    "https://api.dicebear.com/7.x/bottts/svg?seed=bot17&backgroundColor=a78bfa",
    "https://api.dicebear.com/7.x/bottts/svg?seed=bot18&backgroundColor=f97316",
  ]

  const fallbackColors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-green-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-cyan-500",
    "bg-red-600",
    "bg-purple-600",
    "bg-teal-500",
    "bg-amber-500",
    "bg-red-500",
    "bg-emerald-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-purple-600",
    "bg-indigo-500",
    "bg-purple-400",
    "bg-orange-500",
  ]

  // Use bot's stored image if available, otherwise fallback to rotating avatars
  const avatarImage = image || fallbackAvatars[index % fallbackAvatars.length]
  const avatarColor = fallbackColors[index % fallbackColors.length]

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
            <div>
              <h3 className="font-semibold text-lg">{name}</h3>
              <p className="text-sm text-muted-foreground mt-1">Model: {modelName}</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Trades Table Column */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Today&apos;s Trades</h4>
            <BotTradesTable trades={todaysTrades} compact />
          </div>

          {/* Stats Cards Column */}
          {stats ? (
            <div className="space-y-3">
              {/* Hourly PnL USD */}
              <Card className="border">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Hourly PnL (USD)</div>
                  <div className="text-2xl font-bold mt-1">
                    ${stats.hourly_pnl_usd.value.toFixed(5)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stats.hourly_pnl_usd.estimated ? "Estimated" : "Actual"} • {stats.hourly_pnl_usd.basis}
                  </div>
                </CardContent>
              </Card>

              {/* Daily PnL USD */}
              <Card className="border">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Daily PnL (USD)</div>
                  <div className="text-2xl font-bold mt-1">
                    ${stats.daily_pnl_usd.value.toFixed(5)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stats.daily_pnl_usd.estimated ? "Estimated" : "Actual"} • {stats.daily_pnl_usd.basis}
                  </div>
                </CardContent>
              </Card>

              {/* Trades Hourly */}
              <Card className="border">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Trades (Hourly)</div>
                  <div className="text-2xl font-bold mt-1">
                    {stats.trades_hourly.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stats.trades_hourly.estimated ? "Estimated" : "Actual"} • {stats.trades_hourly.basis}
                  </div>
                </CardContent>
              </Card>

              {/* Win Rate Daily */}
              <Card className="border">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">Win Rate (Daily)</div>
                  <div className="text-2xl font-bold mt-1">
                    {(stats.win_rate_daily.value * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stats.win_rate_daily.estimated ? "Estimated" : "Actual"} • {stats.win_rate_daily.basis}
                  </div>
                </CardContent>
              </Card>

              {/* Samples */}
              <Card className="border">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground mb-2">Samples</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Ticks Lookback:</span>
                      <span className="font-semibold ml-1">{stats.samples.ticks_lookback}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Trips Total:</span>
                      <span className="font-semibold ml-1">{stats.samples.trips_total}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Trips 1h:</span>
                      <span className="font-semibold ml-1">{stats.samples.trips_1h}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Trips Today:</span>
                      <span className="font-semibold ml-1">{stats.samples.trips_today}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Open Buys:</span>
                      <span className="font-semibold ml-1">{stats.samples.open_buys}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assumptions */}
              <Card className="border">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground mb-2">Assumptions</div>
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-muted-foreground">Trade Size (SOL):</span>
                      <span className="font-semibold ml-1">{stats.assumptions.trade_size_SOL}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lookback Days:</span>
                      <span className="font-semibold ml-1">{stats.assumptions.lookback_days_for_ticks}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center p-8">
              <p className="text-sm text-muted-foreground">No stats available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
