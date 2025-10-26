"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Check } from "lucide-react"
import { useSelectedBot } from "@/contexts/selected-bot-context"

interface Trade {
  pair: string
  profit: number
  timestamp: string
}

interface DailyPerformance {
  date: string
  performance: number
}

interface BotCardProps {
  id: string
  name: string
  modelName: string
  dailyPerformance: DailyPerformance[]
  todaysTradesToday: Trade[]
}

export function BotCard({
  id,
  name,
  modelName,
  dailyPerformance,
  todaysTradesToday,
}: BotCardProps) {
  const { selectedBot, selectBot, deselectBot } = useSelectedBot()
  const isSelected = selectedBot?.id === id

  const chartData = dailyPerformance.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    performance: item.performance,
  }))

  const chartConfig = {
    performance: {
      label: "Performance ($)",
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
        modelName,
        dailyPerformance,
        todaysTradesToday,
      })
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-sm text-muted-foreground mt-1">Model: {modelName}</p>
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
        <div className="flex gap-4">
          {/* Left Column - Today's Trades */}
          <div className="w-1/3 space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Today&apos;s Trades</h4>
            {todaysTradesToday.length > 0 ? (
              <div className="space-y-2">
                {todaysTradesToday.map((trade, index) => (
                  <div
                    key={index}
                    className="rounded-lg border bg-card p-3 text-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{trade.pair}</span>
                      <span className={trade.profit >= 0 ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>
                        {trade.profit >= 0 ? "+" : ""}${trade.profit.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(trade.timestamp).toLocaleTimeString("en-US", {
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

          {/* Right Column - Chart */}
          <div className="flex-1">
            {/* Daily Performance Chart */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                Daily Performance (USD)
              </h4>
              <ChartContainer config={chartConfig} className="h-[240px] w-full">
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
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
