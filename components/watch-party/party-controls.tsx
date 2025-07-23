"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Users, Copy, QrCode, Share2, Volume2, VolumeX } from "lucide-react"
import { useSocket } from "@/hooks/use-socket"
import { toast } from "sonner"

interface PartyControlsProps {
  roomId: string
  className?: string
}

export function PartyControls({ roomId, className }: PartyControlsProps) {
  const [isPrivate, setIsPrivate] = useState(false)
  const [allowChat, setAllowChat] = useState(true)
  const [allowReactions, setAllowReactions] = useState(true)
  const [maxParticipants, setMaxParticipants] = useState(50)
  const [roomDescription, setRoomDescription] = useState("")

  const { socket } = useSocket(`/party/${roomId}`)

  const handleSettingChange = (setting: string, value: any) => {
    if (!socket) return

    socket.emit("party:update_settings", { [setting]: value })

    switch (setting) {
      case "isPrivate":
        setIsPrivate(value)
        break
      case "allowChat":
        setAllowChat(value)
        break
      case "allowReactions":
        setAllowReactions(value)
        break
      case "maxParticipants":
        setMaxParticipants(value)
        break
      case "description":
        setRoomDescription(value)
        break
    }
  }

  const copyRoomLink = () => {
    const link = `${window.location.origin}/watch/${roomId}`
    navigator.clipboard.writeText(link)
    toast.success("Room link copied to clipboard!")
  }

  const generateQRCode = () => {
    // Implement QR code generation
    toast.info("QR code feature coming soon!")
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Party Controls</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Room Sharing */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Share Room</Label>

          <div className="flex space-x-2">
            <Button onClick={copyRoomLink} className="flex-1">
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>

            <Button variant="outline" onClick={generateQRCode}>
              <QrCode className="w-4 h-4 mr-2" />
              QR Code
            </Button>

            <Button variant="outline">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Room Settings */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Room Settings</Label>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Private Room</Label>
                <p className="text-xs text-text-secondary">Only people with the link can join</p>
              </div>
              <Switch checked={isPrivate} onCheckedChange={(checked) => handleSettingChange("isPrivate", checked)} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Allow Chat</Label>
                <p className="text-xs text-text-secondary">Let participants send messages</p>
              </div>
              <Switch checked={allowChat} onCheckedChange={(checked) => handleSettingChange("allowChat", checked)} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Allow Reactions</Label>
                <p className="text-xs text-text-secondary">Enable emoji reactions during playback</p>
              </div>
              <Switch
                checked={allowReactions}
                onCheckedChange={(checked) => handleSettingChange("allowReactions", checked)}
              />
            </div>
          </div>
        </div>

        {/* Participant Limit */}
        <div className="space-y-2">
          <Label htmlFor="max-participants" className="text-sm font-medium">
            Maximum Participants
          </Label>
          <Input
            id="max-participants"
            type="number"
            min="1"
            max="100"
            value={maxParticipants}
            onChange={(e) => handleSettingChange("maxParticipants", Number.parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Room Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Room Description
          </Label>
          <Textarea
            id="description"
            placeholder="Describe what you're watching..."
            value={roomDescription}
            onChange={(e) => handleSettingChange("description", e.target.value)}
            className="resize-none"
            rows={3}
          />
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Actions</Label>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Invite Friends
            </Button>

            <Button variant="outline" size="sm">
              {allowChat ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
              {allowChat ? "Mute All" : "Unmute All"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
