"use client"

import * as React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Check,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Trophy,
  BarChart3,
  Info,
  Settings
} from "lucide-react"
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
        {/* Stats Cards Grid - 2x2 grid with compact square cards */}
        {stats && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Performance Metrics</h4>
            <div className="grid grid-cols-2 gap-3">
              {/* Hourly PnL USD */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`p-1 rounded ${stats.hourly_pnl_usd.value >= 0 ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                      {stats.hourly_pnl_usd.value >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="text-xs font-medium">Hourly PnL</div>
                  </div>
                  <div className={`text-lg font-bold ${stats.hourly_pnl_usd.value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stats.hourly_pnl_usd.value >= 0 ? '+' : ''}${Math.abs(stats.hourly_pnl_usd.value).toFixed(2)}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {stats.hourly_pnl_usd.estimated ? "Est" : "Actual"}
                  </div>
                </CardContent>
              </Card>

              {/* Daily PnL USD */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`p-1 rounded ${stats.daily_pnl_usd.value >= 0 ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                      <DollarSign className="h-3 w-3 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-xs font-medium">Daily PnL</div>
                  </div>
                  <div className={`text-lg font-bold ${stats.daily_pnl_usd.value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stats.daily_pnl_usd.value >= 0 ? '+' : ''}${Math.abs(stats.daily_pnl_usd.value).toFixed(2)}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {stats.daily_pnl_usd.estimated ? "Est" : "Actual"}
                  </div>
                </CardContent>
              </Card>

              {/* Trades Hourly */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 rounded bg-blue-100 dark:bg-blue-900/50">
                      <Activity className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-xs font-medium">Hourly Trades</div>
                  </div>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {stats.trades_hourly.value}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {stats.trades_hourly.estimated ? "Est" : "Actual"}
                  </div>
                </CardContent>
              </Card>

              {/* Win Rate Daily */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 rounded bg-purple-100 dark:bg-purple-900/50">
                      <Trophy className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-xs font-medium">Win Rate</div>
                  </div>
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {(stats.win_rate_daily.value * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {stats.win_rate_daily.estimated ? "Est" : "Actual"}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional stats in a row below */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              {/* Samples */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                    <div className="text-xs font-medium">Sample Data</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-muted-foreground">Lookback:</span>
                      <span className="font-semibold ml-1">{stats.samples.ticks_lookback}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-semibold ml-1">{stats.samples.trips_total}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">1h:</span>
                      <span className="font-semibold ml-1">{stats.samples.trips_1h}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Today:</span>
                      <span className="font-semibold ml-1">{stats.samples.trips_today}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assumptions */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                    <div className="text-xs font-medium">Config</div>
                  </div>
                  <div className="space-y-1 text-[10px]">
                    <div>
                      <span className="text-muted-foreground">Trade Size:</span>
                      <span className="font-semibold ml-1">{stats.assumptions.trade_size_SOL} SOL</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lookback:</span>
                      <span className="font-semibold ml-1">{stats.assumptions.lookback_days_for_ticks} days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Today's Trades Table */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Recent Transactions</h4>
          <BotTradesTable trades={todaysTrades} compact />
        </div>

        {!stats && (
          <div className="flex items-center justify-center p-8">
            <p className="text-sm text-muted-foreground">No stats available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
