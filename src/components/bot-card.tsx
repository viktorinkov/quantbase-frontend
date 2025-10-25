"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, Users, DollarSign, Check } from "lucide-react"
import { useSelectedBot } from "@/contexts/selected-bot-context"

interface TopWin {
  pair: string
  profit: number
  timestamp: string
}

interface DailyPerformance {
  date: string
  performance: number
}

interface Creator {
  username: string
  avatar: string
}

interface BotCardProps {
  id: string
  name: string
  image: string
  creator: Creator
  monthlyPerformance: number
  totalVolume: number
  userCount: number
  dailyPerformance: DailyPerformance[]
  topWinsToday: TopWin[]
}

export function BotCard({
  id,
  name,
  image,
  creator,
  monthlyPerformance,
  totalVolume,
  userCount,
  dailyPerformance,
  topWinsToday,
}: BotCardProps) {
  const { selectedBot, selectBot, deselectBot } = useSelectedBot()
  const isSelected = selectedBot?.id === id

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`
    }
    return `$${num}`
  }

  const chartData = dailyPerformance.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    performance: item.performance,
  }))

  const chartConfig = {
    performance: {
      label: "Performance",
      color: "hsl(var(--chart-1))",
    },
  }

  const handleToggleSelect = () => {
    if (isSelected) {
      deselectBot()
    } else {
      selectBot({
        id,
        name,
        image,
        creator,
        monthlyPerformance,
        totalVolume,
        userCount,
        dailyPerformance,
        topWinsToday,
      })
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
              <img src={image} alt={name} className="h-full w-full object-cover" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={creator.avatar} alt={creator.username} />
                  <AvatarFallback>{creator.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">@{creator.username}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={monthlyPerformance >= 0 ? "default" : "destructive"}
              className="text-sm"
            >
              {monthlyPerformance >= 0 ? "+" : ""}{monthlyPerformance.toFixed(1)}%
            </Badge>
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {/* Left Column - Top Wins */}
          <div className="w-1/3 space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Today's Top Wins</h4>
            {topWinsToday.length > 0 ? (
              <div className="space-y-2">
                {topWinsToday.map((win, index) => (
                  <div
                    key={index}
                    className="rounded-lg border bg-card p-3 text-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{win.pair}</span>
                      <span className="text-green-500 font-semibold">
                        +{win.profit.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(win.timestamp).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">No trades today</p>
              </div>
            )}
          </div>

          {/* Right Column - Chart and Stats */}
          <div className="flex-1 space-y-4">
            {/* Daily Performance Chart */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                Daily Performance (%)
              </h4>
              <ChartContainer config={chartConfig} className="h-[160px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="performance" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.performance >= 0 ? "hsl(var(--chart-1))" : "hsl(var(--destructive))"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border bg-card p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Monthly</span>
                </div>
                <p className="text-lg font-semibold">
                  {monthlyPerformance >= 0 ? "+" : ""}{monthlyPerformance.toFixed(1)}%
                </p>
              </div>

              <div className="rounded-lg border bg-card p-3">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Volume</span>
                </div>
                <p className="text-lg font-semibold">{formatNumber(totalVolume)}</p>
              </div>

              <div className="rounded-lg border bg-card p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Users</span>
                </div>
                <p className="text-lg font-semibold">{userCount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
