"use client"

import { useState } from "react"
import { User, Brain, Database, Shield, Palette, Camera, Save, Trash2, Download, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    name: "Alex Chen",
    email: "alex@example.com",
    bio: "Building the future with AI",
    timezone: "America/Los_Angeles",
  })
  const [aiPrefs, setAiPrefs] = useState({
    responseLength: 50,
    creativity: 30,
    autoSuggest: true,
    contextWindow: "medium",
    preferredModel: "gpt-4",
  })
  const [privacy, setPrivacy] = useState({
    localProcessing: false,
    analytics: true,
    shareImprovements: false,
    twoFactor: true,
  })
  const [appearance, setAppearance] = useState({
    theme: "dark",
    fontSize: 14,
    compactMode: false,
    animations: true,
  })

  const handleSave = async () => {
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSaving(false)
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account and configure your AI Personal Brain</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
            <TabsTrigger value="profile" className="gap-2">
              <User className="size-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Brain className="size-4" />
              <span className="hidden sm:inline">AI</span>
            </TabsTrigger>
            <TabsTrigger value="memory" className="gap-2">
              <Database className="size-4" />
              <span className="hidden sm:inline">Memory</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Shield className="size-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="size-4" />
              <span className="hidden sm:inline">Theme</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details and public profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="size-20">
                    <AvatarImage src="/diverse-user-avatars.png" alt={profile.name} />
                    <AvatarFallback className="text-lg">
                      {profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Camera className="size-4" />
                      Change Photo
                    </Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="min-h-[80px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">Brief description for your profile.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={profile.timezone}
                    onValueChange={(value) => setProfile({ ...profile, timezone: value })}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                      <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Japan Standard Time (JST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Preferences Tab */}
          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Behavior</CardTitle>
                <CardDescription>Customize how your AI assistant responds and interacts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Response Length</Label>
                      <p className="text-xs text-muted-foreground">Adjust how detailed responses should be</p>
                    </div>
                    <span className="text-sm font-medium tabular-nums">{aiPrefs.responseLength}%</span>
                  </div>
                  <Slider
                    value={[aiPrefs.responseLength]}
                    onValueChange={([value]) => setAiPrefs({ ...aiPrefs, responseLength: value })}
                    max={100}
                    step={10}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Concise</span>
                    <span>Detailed</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Creativity Level</Label>
                      <p className="text-xs text-muted-foreground">Balance between accuracy and creative responses</p>
                    </div>
                    <span className="text-sm font-medium tabular-nums">{aiPrefs.creativity}%</span>
                  </div>
                  <Slider
                    value={[aiPrefs.creativity]}
                    onValueChange={([value]) => setAiPrefs({ ...aiPrefs, creativity: value })}
                    max={100}
                    step={10}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Precise</span>
                    <span>Creative</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="model">Preferred Model</Label>
                  <Select
                    value={aiPrefs.preferredModel}
                    onValueChange={(value) => setAiPrefs({ ...aiPrefs, preferredModel: value })}
                  >
                    <SelectTrigger id="model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4 (Most capable)</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Faster)</SelectItem>
                      <SelectItem value="claude-3">Claude 3 Opus</SelectItem>
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="context">Context Window</Label>
                  <Select
                    value={aiPrefs.contextWindow}
                    onValueChange={(value) => setAiPrefs({ ...aiPrefs, contextWindow: value })}
                  >
                    <SelectTrigger id="context">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (4K tokens)</SelectItem>
                      <SelectItem value="medium">Medium (16K tokens)</SelectItem>
                      <SelectItem value="large">Large (32K tokens)</SelectItem>
                      <SelectItem value="max">Maximum (128K tokens)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Larger windows use more memory but provide better context
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Suggestions</Label>
                    <p className="text-xs text-muted-foreground">Show AI suggestions while typing</p>
                  </div>
                  <Switch
                    checked={aiPrefs.autoSuggest}
                    onCheckedChange={(checked) => setAiPrefs({ ...aiPrefs, autoSuggest: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Memory Management Tab */}
          <TabsContent value="memory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
                <CardDescription>Monitor and manage your stored memories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Storage Used</span>
                    <span className="font-medium">2.4 GB / 5 GB</span>
                  </div>
                  <Progress value={48} className="h-2" />
                  <p className="text-xs text-muted-foreground">48% of your storage is currently in use</p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Storage Breakdown</h4>
                  <div className="space-y-3">
                    {[
                      { label: "Notes", value: 1.2, color: "bg-blue-500" },
                      { label: "Documents", value: 0.8, color: "bg-emerald-500" },
                      { label: "Chat History", value: 0.3, color: "bg-violet-500" },
                      { label: "Other", value: 0.1, color: "bg-amber-500" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className={`size-3 rounded-full ${item.color}`} />
                        <span className="flex-1 text-sm">{item.label}</span>
                        <span className="text-sm text-muted-foreground">{item.value} GB</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Download className="size-4" />
                    Export All Data
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="gap-2 text-destructive hover:text-destructive bg-transparent"
                      >
                        <Trash2 className="size-4" />
                        Clear All Memories
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="size-5 text-destructive" />
                          Clear All Memories
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete all your stored memories, notes,
                          documents, and chat history from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete Everything
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Optimization</CardTitle>
                <CardDescription>Configure automatic memory management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Archive Old Memories</Label>
                    <p className="text-xs text-muted-foreground">Archive memories older than 90 days</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Deduplicate Content</Label>
                    <p className="text-xs text-muted-foreground">Automatically merge similar memories</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Smart Summarization</Label>
                    <p className="text-xs text-muted-foreground">Compress old chat history into summaries</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy & Security Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Controls</CardTitle>
                <CardDescription>Manage how your data is processed and stored</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Local Processing Only</Label>
                    <p className="text-xs text-muted-foreground">Process sensitive data on your device only</p>
                  </div>
                  <Switch
                    checked={privacy.localProcessing}
                    onCheckedChange={(checked) => setPrivacy({ ...privacy, localProcessing: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Usage Analytics</Label>
                    <p className="text-xs text-muted-foreground">Help improve the product with anonymous usage data</p>
                  </div>
                  <Switch
                    checked={privacy.analytics}
                    onCheckedChange={(checked) => setPrivacy({ ...privacy, analytics: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Share for AI Improvements</Label>
                    <p className="text-xs text-muted-foreground">Allow anonymized data to train AI models</p>
                  </div>
                  <Switch
                    checked={privacy.shareImprovements}
                    onCheckedChange={(checked) => setPrivacy({ ...privacy, shareImprovements: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Protect your account and data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    checked={privacy.twoFactor}
                    onCheckedChange={(checked) => setPrivacy({ ...privacy, twoFactor: checked })}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Change Password</Label>
                      <p className="text-xs text-muted-foreground">Last changed 3 months ago</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Update
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Active Sessions</Label>
                      <p className="text-xs text-muted-foreground">3 devices currently logged in</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible account actions</CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="size-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="size-5 text-destructive" />
                        Delete Account
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action is permanent and cannot be undone. All your data, memories, notes, and settings will
                        be permanently deleted. You will lose access to your AI Personal Brain forever.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete My Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Customize the look and feel of your interface</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Color Mode</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "light", label: "Light" },
                      { value: "dark", label: "Dark" },
                      { value: "system", label: "System" },
                    ].map((theme) => (
                      <button
                        key={theme.value}
                        onClick={() => setAppearance({ ...appearance, theme: theme.value })}
                        className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                          appearance.theme === theme.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div
                          className={`size-8 rounded-md ${
                            theme.value === "light"
                              ? "bg-white border"
                              : theme.value === "dark"
                                ? "bg-zinc-900"
                                : "bg-gradient-to-br from-white to-zinc-900"
                          }`}
                        />
                        <span className="text-sm font-medium">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Font Size</Label>
                      <p className="text-xs text-muted-foreground">Base text size for the interface</p>
                    </div>
                    <span className="text-sm font-medium tabular-nums">{appearance.fontSize}px</span>
                  </div>
                  <Slider
                    value={[appearance.fontSize]}
                    onValueChange={([value]) => setAppearance({ ...appearance, fontSize: value })}
                    min={12}
                    max={20}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Smaller</span>
                    <span>Larger</span>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact Mode</Label>
                    <p className="text-xs text-muted-foreground">Reduce spacing for denser layouts</p>
                  </div>
                  <Switch
                    checked={appearance.compactMode}
                    onCheckedChange={(checked) => setAppearance({ ...appearance, compactMode: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Interface Animations</Label>
                    <p className="text-xs text-muted-foreground">Enable smooth transitions and effects</p>
                  </div>
                  <Switch
                    checked={appearance.animations}
                    onCheckedChange={(checked) => setAppearance({ ...appearance, animations: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="sticky bottom-0 mt-8 flex justify-end border-t bg-background py-4">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <>
                <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
