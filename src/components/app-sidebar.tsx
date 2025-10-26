"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconGraph,
  IconBuildingStore,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { CreateBotDialog } from "@/components/create-bot-dialog"
import { useCreateBot } from "@/contexts/create-bot-context"
import { useRouter } from "next/navigation"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Crypto",
      url: "/crypto",
      icon: IconGraph,
    },
    {
      title: "Model Marketplace",
      url: "/bot-marketplace",
      icon: IconBuildingStore,
    },
    {
      title: "Portfolio",
      url: "/portfolio",
      icon: IconFolder,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [clickCount, setClickCount] = React.useState(0)
  const [clickTimestamps, setClickTimestamps] = React.useState<number[]>([])
  const easterEggUrl = process.env.NEXT_PUBLIC_EASTER_EGG_URL

  const handleEasterEggClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    
    const now = Date.now()
    const newTimestamps = [...clickTimestamps, now]
    
    // Filter clicks within the last second
    const recentClicks = newTimestamps.filter(timestamp => now - timestamp < 1000)
    
    if (recentClicks.length >= 5) {
      // Easter egg triggered!
      if (easterEggUrl) {
        window.open(easterEggUrl, '_blank')
      }
      // Reset after triggering
      setClickCount(0)
      setClickTimestamps([])
    } else {
      setClickCount(recentClicks.length)
      setClickTimestamps(newTimestamps)
    }
  }

  return (
    <>
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5"
              >
                <a href="#" onClick={handleEasterEggClick}>
                  <img src="/ducky.svg" alt="Ducky Logo" className="!size-5" />
                  <span className="text-base font-semibold">QuantBase</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />
          <NavSecondary items={data.navSecondary} className="mt-auto" />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>
      <GlobalCreateBotDialog />
    </>
  )
}

function GlobalCreateBotDialog() {
  const { isOpen, closeDialog } = useCreateBot()
  const [localOpen, setLocalOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    if (isOpen) {
      setLocalOpen(true)
    }
  }, [isOpen])

  const handleCreateBot = async (newBot: any) => {
    console.log('Bot created from global dialog:', newBot)
    // Navigate to marketplace or just close
    router.push('/bot-marketplace')
  }

  return (
    <CreateBotDialog 
      onCreateBot={handleCreateBot}
      open={localOpen}
      onOpenChange={(open) => {
        setLocalOpen(open)
        if (!open) {
          closeDialog()
        }
      }}
    />
  )
}
