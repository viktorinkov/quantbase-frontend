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

interface BotCardProps {
  id: string
  name: string
  modelName: string
  todaysTrades: BotTrade[]
  index?: number
}

export function BotCard({
  id,
  name,
  modelName,
  todaysTrades,
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
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Today&apos;s Trades</h4>
          <BotTradesTable trades={todaysTrades} />
        </div>
      </CardContent>
    </Card>
  )
}
