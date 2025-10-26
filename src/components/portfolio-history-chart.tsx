"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
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
import { PortfolioHistoryTuple } from "@/hooks/use-portfolio"

export const description = "Portfolio performance history chart"

const chartConfig = {
  usd: {
    label: "USD Value",
    color: "var(--chart-1)",
  },
  sol: {
    label: "SOL Value",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

interface PortfolioHistoryChartProps {
  history: PortfolioHistoryTuple[]
}

export function PortfolioHistoryChart({ history }: PortfolioHistoryChartProps) {
  const [timeRange, setTimeRange] = React.useState("3h")

  // Transform tuple data to chart format
  const chartData = React.useMemo(() => {
    if (!history || !Array.isArray(history) || history.length === 0) {
      console.log('No history data provided')
      return []
    }

    const transformed = history
      .map((item: PortfolioHistoryTuple, index) => {
        // Tuple format: [timestamp, usd_value, sol_value]
        const [timestamp, usd_val, sol_val] = item

        // Debug logging
        if (index === 0 || index === history.length - 1) {
          console.log(`Entry ${index}:`, { timestamp, usd_val, sol_val })
        }

        return {
          timestamp: timestamp, // Keep as ISO string
          usd: Number(usd_val) || 0,
          sol: Number(sol_val) || 0,
        }
      })
      .filter((item) => {
        // Filter out invalid data points
        const hasValidTimestamp = item.timestamp && !isNaN(new Date(item.timestamp).getTime())
        const hasValidValues = !isNaN(item.usd) && !isNaN(item.sol) && item.usd >= 0 && item.sol >= 0

        if (!hasValidTimestamp || !hasValidValues) {
          console.warn('Filtered out invalid item:', item)
        }

        return hasValidTimestamp && hasValidValues
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    console.log(`Transformed ${history.length} entries to ${transformed.length} valid data points`)
    return transformed
  }, [history])

  const filteredData = React.useMemo(() => {
    if (chartData.length === 0) {
      console.log('No chart data available')
      return []
    }

    const now = new Date()
    let timeThreshold: Date

    if (timeRange === "3h") {
      timeThreshold = new Date(now.getTime() - 3 * 60 * 60 * 1000)
    } else {
      // "1d"
      timeThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }

    const filtered = chartData.filter((item) => {
      const itemDate = new Date(item.timestamp)
      return itemDate >= timeThreshold && !isNaN(itemDate.getTime())
    })

    console.log(`Filtered to ${filtered.length} points for ${timeRange} time range`)

    // NO FALLBACK - only return filtered data
    return filtered
  }, [chartData, timeRange])

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Portfolio Performance</CardTitle>
          <CardDescription>
            USD and SOL value over time
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 hours" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="3h" className="rounded-lg">
              Last 3 hours
            </SelectItem>
            <SelectItem value="1d" className="rounded-lg">
              Last day
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {filteredData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center">
            <p className="text-muted-foreground">
              No data available for the selected time range
            </p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillUsd" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-usd)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-usd)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillSol" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-sol)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-sol)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="timestamp"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="sol"
                type="natural"
                fill="url(#fillSol)"
                stroke="var(--color-sol)"
                stackId="a"
              />
              <Area
                dataKey="usd"
                type="natural"
                fill="url(#fillUsd)"
                stroke="var(--color-usd)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
