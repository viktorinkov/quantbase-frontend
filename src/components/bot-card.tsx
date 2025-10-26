"use client"

import * as React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { useSelectedBot } from "@/contexts/selected-bot-context"
import { BotTradesTable } from "@/components/bot-trades-table"

interface BotTrade {
  action: string
  price: number
  timestamp: string
}

interface BotCardProps {
  id: string
  name: string
  modelName: string
  todaysTrades: BotTrade[]
}

export function BotCard({
  id,
  name,
  modelName,
  todaysTrades,
}: BotCardProps) {
  const { selectedBot, selectBot, deselectBot } = useSelectedBot()
  const isSelected = selectedBot?.id === id

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
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Today&apos;s Trades</h4>
          <BotTradesTable trades={todaysTrades} />
        </div>
      </CardContent>
    </Card>
  )
}
