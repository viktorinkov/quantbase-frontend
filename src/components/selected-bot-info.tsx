"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useSelectedBot } from "@/contexts/selected-bot-context"
import { BotParameterCustomizer } from "@/components/bot-parameter-customizer"
import { BotTradesTable } from "@/components/bot-trades-table"

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
                  Model Marketplace
                </a>{" "}
                to select a bot.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-xl mb-1">{selectedBot.name}</h3>
              <p className="text-sm text-muted-foreground">Model: {selectedBot.modelName}</p>
            </div>
            
            {/* Trade History Section */}
            <div>
              <h4 className="text-lg font-medium mb-3">Trade History</h4>
              <div className="border rounded-lg">
                <BotTradesTable trades={selectedBot.todaysTrades || []} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
