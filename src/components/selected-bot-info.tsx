"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, TrendingUp, Users, DollarSign } from "lucide-react"
import { useSelectedBot } from "@/contexts/selected-bot-context"

export function SelectedBotInfo() {
  const { selectedBot, deselectBot } = useSelectedBot()

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

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`
    }
    return `$${num}`
  }

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
          <div className="flex items-start gap-6">
            {/* Bot Info */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                <img src={selectedBot.image} alt={selectedBot.name} className="h-full w-full object-cover" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-1">{selectedBot.name}</h3>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={selectedBot.creator.avatar} alt={selectedBot.creator.username} />
                    <AvatarFallback>{selectedBot.creator.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">@{selectedBot.creator.username}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 grid grid-cols-3 gap-4">
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Monthly Performance</span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-semibold">
                    {selectedBot.monthlyPerformance >= 0 ? "+" : ""}{selectedBot.monthlyPerformance.toFixed(1)}%
                  </p>
                  <Badge
                    variant={selectedBot.monthlyPerformance >= 0 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {selectedBot.monthlyPerformance >= 0 ? "Profit" : "Loss"}
                  </Badge>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total Volume</span>
                </div>
                <p className="text-2xl font-semibold">{formatNumber(selectedBot.totalVolume)}</p>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Active Users</span>
                </div>
                <p className="text-2xl font-semibold">{selectedBot.userCount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
