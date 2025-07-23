"use client"

import { useState, useEffect } from "react"
import { VideoPlayer } from "@/components/video/video-player"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ParticipantsList } from "@/components/watch-party/participants-list"
import { PartyControls } from "@/components/watch-party/party-controls"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, MessageCircle, Settings, Share2, Crown, Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSocket } from "@/hooks/use-socket"

interface Participant {
  id: string
  username: string
  avatar?: string
  isHost: boolean
  isOnline: boolean
  joinedAt: string
}

interface WatchPartyRoomProps {
  roomId: string
  videoSrc: string
  isHost?: boolean
  className?: string
}

export function WatchPartyRoom({ roomId, videoSrc, isHost = false, className }: WatchPartyRoomProps) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [showParticipants, setShowParticipants] = useState(false)

  const { socket } = useSocket(`/party/${roomId}`)

  // Socket connection status
  useEffect(() => {
    if (!socket) return

    socket.on("connect", () => setIsConnected(true))
    socket.on("disconnect", () => setIsConnected(false))

    socket.on("party:participants", (participantsList: Participant[]) => {
      setParticipants(participantsList)
    })

    socket.on("party:user_joined", (user: Participant) => {
      setParticipants((prev) => [...prev, user])
    })

    socket.on("party:user_left", (userId: string) => {
      setParticipants((prev) => prev.filter((p) => p.id !== userId))
    })

    return () => {
      socket.off("connect")
      socket.off("disconnect")
      socket.off("party:participants")
      socket.off("party:user_joined")
      socket.off("party:user_left")
    }
  }, [socket])

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Header */}
      <header className="bg-background-secondary border-b border-background-tertiary p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-text-primary">Watch Party</h1>

            <div className="flex items-center space-x-2">
              <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center space-x-1">
                {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                <span>{isConnected ? "Connected" : "Disconnected"}</span>
              </Badge>

              <Badge variant="secondary" className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{participants.length} viewers</span>
              </Badge>

              {isHost && (
                <Badge variant="default" className="flex items-center space-x-1">
                  <Crown className="w-3 h-3" />
                  <span>Host</span>
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>

            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <Card className="p-0 overflow-hidden">
              <VideoPlayer src={videoSrc} partyId={roomId} isHost={isHost} className="w-full aspect-video" />
            </Card>

            {/* Party Controls */}
            {isHost && (
              <div className="mt-4">
                <PartyControls roomId={roomId} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-[600px] flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
                  <TabsTrigger value="chat" className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat</span>
                  </TabsTrigger>
                  <TabsTrigger value="participants" className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>People</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="flex-1 m-0">
                  <ChatInterface partyId={roomId} className="h-full border-0" />
                </TabsContent>

                <TabsContent value="participants" className="flex-1 m-0 p-4">
                  <ParticipantsList participants={participants} isHost={isHost} roomId={roomId} />
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
