"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useSelectedBot } from "@/contexts/selected-bot-context"

export function SelectedBotInfo() {
  const { selectedBot, deselectBot, isLoading } = useSelectedBot()

  // Show loading state while fetching initial bot selection
  if (isLoading) {
    return (
      <div className="px-4 lg:px-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading bot information...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!selectedBot) {
    return (
      <div className="px-4 lg:px-6">
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No trading bot selected. Visit the{" "}
                <a href="/bot-marketplace" className="text-primary underline underline-offset-4 hover:text-primary/80">
                  Bot Marketplace
                </a>{" "}
                to select a bot.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate total profit from today's trades
  const todaysProfit = selectedBot.todaysTradesToday?.reduce((sum, trade) => sum + trade.profit, 0) ?? 0

  // Calculate total profit from all daily performance
  const totalProfit = selectedBot.dailyPerformance?.reduce((sum, day) => sum + day.performance, 0) ?? 0

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle>Active Trading Bot</CardTitle>
            <Button
              onClick={deselectBot}
              variant="outline"
              size="sm"
            >
              <X className="mr-2 h-4 w-4" />
              Remove Bot
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Bot Info */}
            <div>
              <h3 className="font-semibold text-xl mb-1">{selectedBot.name}</h3>
              <p className="text-sm text-muted-foreground">Model: {selectedBot.modelName}</p>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground mb-1">Today&apos;s P/L</p>
                <p className={`text-2xl font-semibold ${todaysProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {todaysProfit >= 0 ? "+" : ""}${todaysProfit.toFixed(2)}
                </p>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground mb-1">7-Day P/L</p>
                <p className={`text-2xl font-semibold ${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalProfit >= 0 ? "+" : ""}${totalProfit.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
