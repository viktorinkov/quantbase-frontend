"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

interface CryptoChartProps {
  name: string
  symbol: string
  currentPrice: number
  priceChange24h: number
  chartData: Array<{ date: string; price: number }>
}

const chartConfig = {
  price: {
    label: "Price",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function CryptoChart({
  name,
  symbol,
  currentPrice,
  priceChange24h,
  chartData,
}: CryptoChartProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date(chartData[chartData.length - 1].date)
    let millisecondsToSubtract = 90 * 24 * 60 * 60 * 1000 // 90 days default

    if (timeRange === "1m") {
      millisecondsToSubtract = 60 * 1000 // 1 minute
    } else if (timeRange === "1h") {
      millisecondsToSubtract = 60 * 60 * 1000 // 1 hour
    } else if (timeRange === "1d") {
      millisecondsToSubtract = 24 * 60 * 60 * 1000 // 1 day
    } else if (timeRange === "7d") {
      millisecondsToSubtract = 7 * 24 * 60 * 60 * 1000 // 7 days
    } else if (timeRange === "30d") {
      millisecondsToSubtract = 30 * 24 * 60 * 60 * 1000 // 30 days
    }

    const startDate = new Date(referenceDate.getTime() - millisecondsToSubtract)
    return date >= startDate
  })

  const priceChangeColor = priceChange24h >= 0 ? "text-green-600" : "text-red-600"
  const priceChangeSign = priceChange24h >= 0 ? "+" : ""

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>
          {name} ({symbol})
        </CardTitle>
        <CardDescription>
          <span className="text-2xl font-bold">
            ${currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`ml-2 text-sm ${priceChangeColor}`}>
            {priceChangeSign}{priceChange24h.toFixed(2)}%
          </span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-3 @[767px]/card:flex"
          >
            <ToggleGroupItem value="1m">1 Min</ToggleGroupItem>
            <ToggleGroupItem value="1h">1 Hour</ToggleGroupItem>
            <ToggleGroupItem value="1d">1 Day</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 Days</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 Days</ToggleGroupItem>
            <ToggleGroupItem value="90d">3 Months</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="1m" className="rounded-lg">
                Last 1 minute
              </SelectItem>
              <SelectItem value="1h" className="rounded-lg">
                Last 1 hour
              </SelectItem>
              <SelectItem value="1d" className="rounded-lg">
                Last 1 day
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id={`fill-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-price)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-price)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                if (timeRange === "1m" || timeRange === "1h") {
                  return date.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                } else if (timeRange === "1d") {
                  return date.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const date = new Date(value)
                    if (timeRange === "1m" || timeRange === "1h") {
                      return date.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                    } else if (timeRange === "1d") {
                      return date.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    }
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  formatter={(value) => {
                    return `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="price"
              type="natural"
              fill={`url(#fill-${symbol})`}
              stroke="var(--color-price)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
