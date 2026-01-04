"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Brain,
  Search,
  Settings,
  Database,
  Bookmark,
  History,
  Trash2,
  HelpCircle,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const isActive = (href: string) => {
  if (href === "/dashboard") {
    return href === href
  }
  return href.startsWith(href)
}

const renderNavItem = (item: { title: string; href: string; icon: React.ComponentType<{ className?: string }> }) => (
  <SidebarMenuItem key={item.href}>
    <SidebarMenuButton
      asChild
      isActive={isActive(item.href)}
      tooltip={item.title}
      className={cn(
        "transition-colors",
        isActive(item.href) && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
      )}
    >
      <Link href={item.href}>
        <item.icon className="size-4" />
        <span>{item.title}</span>
      </Link>
    </SidebarMenuButton>
  </SidebarMenuItem>
)

export function AppSidebar() {
  const pathname = usePathname()

  // Memory usage mock data
  const memoryUsage = 67
  const memoryUsed = "2.1 GB"
  const memoryTotal = "3 GB"

  // Main Navigation Section
  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Chat",
      href: "/dashboard/chat",
      icon: MessageSquare,
    },
    {
      title: "Notes",
      href: "/dashboard/notes",
      icon: FileText,
    },
    {
      title: "Memory",
      href: "/dashboard/memory",
      icon: Brain,
    },
    {
      title: "Search",
      href: "/dashboard/search",
      icon: Search,
    },
  ]

  const secondaryToolItems = [
    {
      title: "Bookmarks",
      href: "/dashboard/bookmarks",
      icon: Bookmark,
    },
    {
      title: "History",
      href: "/dashboard/history",
      icon: History,
    },
    {
      title: "Trash",
      href: "/dashboard/trash",
      icon: Trash2,
    },
  ]

  const utilityItems = [
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
    {
      title: "Help & Support",
      href: "/dashboard/help",
      icon: HelpCircle,
    },
  ]

  return (
    <TooltipProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Brain className="size-4" />
            </div>
            <span className="font-semibold text-sm group-data-[collapsible=icon]:hidden">AI Personal Brain</span>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{mainNavItems.map(renderNavItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>Tools</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{secondaryToolItems.map(renderNavItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>{utilityItems.map(renderNavItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border">
          {/* Expanded state */}
          <div className="flex flex-col gap-2 p-2 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Database className="size-3" />
                <span>Memory Usage</span>
              </div>
              <span className="font-medium text-foreground">{memoryUsage}%</span>
            </div>
            <Progress
              value={memoryUsage}
              className={cn(
                "h-1.5",
                memoryUsage > 80 && "[&>div]:bg-destructive",
                memoryUsage > 60 && memoryUsage <= 80 && "[&>div]:bg-yellow-500",
              )}
            />
            <p className="text-[10px] text-muted-foreground">
              {memoryUsed} of {memoryTotal} used
            </p>
          </div>

          {/* Collapsed state with tooltip */}
          <div className="hidden group-data-[collapsible=icon]:block p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center cursor-default">
                  <div className="relative">
                    <Database
                      className={cn(
                        "size-4",
                        memoryUsage > 80
                          ? "text-destructive"
                          : memoryUsage > 60
                            ? "text-yellow-500"
                            : "text-muted-foreground",
                      )}
                    />
                    <span className="absolute -top-1 -right-1 size-2 rounded-full bg-primary" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                <p className="font-medium">Memory: {memoryUsage}%</p>
                <p className="text-muted-foreground">
                  {memoryUsed} of {memoryTotal}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  )
}
