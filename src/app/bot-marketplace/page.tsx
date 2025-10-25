import { AppSidebar } from "@/components/app-sidebar"
import { BotCard } from "@/components/bot-card"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import botsData from "@/data/bots.json"

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <div className="mb-4">
                <h1 className="text-3xl font-bold tracking-tight">Bot Marketplace</h1>
                <p className="text-muted-foreground mt-2">
                  Discover and deploy automated trading bots from top creators
                </p>
              </div>
              <div className="grid gap-6">
                {botsData.map((bot) => (
                  <BotCard
                    key={bot.id}
                    id={bot.id}
                    name={bot.name}
                    image={bot.image}
                    creator={bot.creator}
                    monthlyPerformance={bot.monthlyPerformance}
                    totalVolume={bot.totalVolume}
                    userCount={bot.userCount}
                    dailyPerformance={bot.dailyPerformance}
                    topWinsToday={bot.topWinsToday}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
