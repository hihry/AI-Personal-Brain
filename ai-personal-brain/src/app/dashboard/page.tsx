"use client"
import {
  Brain,
  FileText,
  MessageSquare,
  HardDrive,
  TrendingUp,
  TrendingDown,
  Plus,
  Upload,
  Search,
  Sparkles,
  FileUp,
  MessagesSquare,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"



function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

const metrics = [
  {
    title: "Total Memories",
    value: "1,284",
    trend: "+12%",
    trendUp: true,
    icon: Brain,
  },
  {
    title: "Notes Created",
    value: "248",
    trend: "+4 this week",
    trendUp: true,
    icon: FileText,
  },
  {
    title: "Conversations",
    value: "89",
    trend: "-2 from last week",
    trendUp: false,
    icon: MessageSquare,
  },
  {
    title: "Storage Used",
    value: "2.4 GB",
    trend: "of 10 GB",
    trendUp: null,
    icon: HardDrive,
  },
]

const recentActivity = [
  {
    type: "chat",
    title: "Discussed project architecture patterns",
    timestamp: "2 hours ago",
    icon: MessagesSquare,
  },
  {
    type: "note",
    title: "Updated meeting notes for Q1 planning",
    timestamp: "5 hours ago",
    icon: FileText,
  },
  {
    type: "upload",
    title: "Ingested research-paper-ml.pdf",
    timestamp: "Yesterday",
    icon: FileUp,
  },
  {
    type: "chat",
    title: "Explored ideas for new feature design",
    timestamp: "Yesterday",
    icon: MessagesSquare,
  },
  {
    type: "note",
    title: "Created summary of Thinking Fast and Slow",
    timestamp: "2 days ago",
    icon: FileText,
  },
]

const quickActions = [
  {
    label: "New Chat",
    description: "Start a conversation",
    icon: MessageSquare,
    variant: "default" as const,
  },
  {
    label: "Add Note",
    description: "Capture a thought",
    icon: Plus,
    variant: "outline" as const,
  },
  {
    label: "Upload Memory",
    description: "Ingest a file",
    icon: Upload,
    variant: "outline" as const,
  },
  {
    label: "Semantic Search",
    description: "Find anything",
    icon: Search,
    variant: "outline" as const,
  },
]


  return (
    <div className="flex flex-col gap-8 p-6">
      {/* Greeting Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{greeting}</h1>
          <p className="text-muted-foreground">Your brain has processed 12 new memories since your last visit.</p>
        </div>
        <Button className="w-full sm:w-auto">
          <Sparkles className="mr-2 size-4" />
          Start a new thought
        </Button>
      </div>

      <Separator />

      {/* Metrics Overview */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium">Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
                <metric.icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="mt-1 flex items-center gap-1 text-xs">
                  {metric.trendUp !== null &&
                    (metric.trendUp ? (
                      <TrendingUp className="size-3 text-emerald-500" />
                    ) : (
                      <TrendingDown className="size-3 text-red-500" />
                    ))}
                  <span
                    className={
                      metric.trendUp === true
                        ? "text-emerald-500"
                        : metric.trendUp === false
                          ? "text-red-500"
                          : "text-muted-foreground"
                    }
                  >
                    {metric.trend}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity Feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest interactions with the brain</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                    <activity.icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm font-medium leading-tight">{activity.title}</span>
                    <Badge variant="secondary" className="w-fit text-xs font-normal">
                      {activity.timestamp}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks at your fingertips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {quickActions.map((action) => (
                <Button key={action.label} variant={action.variant} className="h-auto justify-start gap-3 p-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <action.icon className="size-4" />
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium">{action.label}</span>
                    <span className="text-xs text-muted-foreground">{action.description}</span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
