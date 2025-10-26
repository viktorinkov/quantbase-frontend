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
import type { PortfolioHistoryTuple } from "@/hooks/use-portfolio"

const chartConfig = {
  usd: {
    label: "USD Value",
    color: "hsl(var(--chart-1))",
  },
  sol: {
    label: "SOL Value",
    color: "hsl(var(--chart-2))",
  },
}

interface PortfolioHistoryChartProps {
  history: PortfolioHistoryTuple[]
}

export function PortfolioHistoryChart({ history }: PortfolioHistoryChartProps) {
  const [timeRange, setTimeRange] = React.useState("90d")

  // Transform the tuple data into the format needed for the chart
  const chartData = React.useMemo(() => {
    if (!history || history.length === 0) {
      return []
    }

    // Convert tuples to objects
    const data = history.map(([timestamp, usd, sol]) => ({
      date: new Date(timestamp),
      usd,
      sol,
    }))

    // Filter by time range
    const now = new Date()
    const filtered = data.filter((item) => {
      const daysAgo = Math.floor(
        (now.getTime() - item.date.getTime()) / (1000 * 60 * 60 * 24)
      )

      switch (timeRange) {
        case "7d":
          return daysAgo <= 7
        case "30d":
          return daysAgo <= 30
        case "90d":
          return daysAgo <= 90
        default:
          return true
      }
    })

    return filtered.map((item) => ({
      date: item.date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      usd: item.usd,
      sol: item.sol,
    }))
  }, [history, timeRange])

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Portfolio History</CardTitle>
          <CardDescription>
            Showing portfolio value over time
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a time range"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
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
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return value
                  }}
                  formatter={(value, name) => (
                    <>
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                        style={
                          {
                            "--color-bg": `var(--color-${name})`,
                          } as React.CSSProperties
                        }
                      />
                      {chartConfig[name as keyof typeof chartConfig]?.label || name}
                      <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                        {typeof value === "number" ? value.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 4,
                        }) : value}
                        <span className="font-normal text-muted-foreground">
                          {name === "usd" ? "USD" : "SOL"}
                        </span>
                      </div>
                    </>
                  )}
                />
              }
            />
            <Area
              dataKey="usd"
              type="natural"
              fill="url(#fillUsd)"
              stroke="var(--color-usd)"
              stackId="a"
            />
            <Area
              dataKey="sol"
              type="natural"
              fill="url(#fillSol)"
              stroke="var(--color-sol)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
