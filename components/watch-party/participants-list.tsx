"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Crown, MoreVertical, UserMinus, Shield, Volume2, VolumeX, Circle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface Participant {
  id: string
  username: string
  avatar?: string
  isHost: boolean
  isOnline: boolean
  joinedAt: string
}

interface ParticipantsListProps {
  participants: Participant[]
  isHost: boolean
  roomId: string
  className?: string
}

export function ParticipantsList({ participants, isHost, roomId, className }: ParticipantsListProps) {
  const [mutedUsers, setMutedUsers] = useState<Set<string>>(new Set())

  const handleMuteUser = (userId: string) => {
    setMutedUsers((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })
  }

  const handleKickUser = (userId: string) => {
    // Implement kick functionality
    console.log("Kick user:", userId)
  }

  const handleMakeHost = (userId: string) => {
    // Implement make host functionality
    console.log("Make host:", userId)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-text-primary">Participants ({participants.length})</h3>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-background-tertiary/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{participant.username[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>

                  {/* Online status indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5">
                    <Circle
                      className={cn(
                        "w-3 h-3 border-2 border-background rounded-full",
                        participant.isOnline
                          ? "fill-accent-success text-accent-success"
                          : "fill-text-tertiary text-text-tertiary",
                      )}
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm text-text-primary truncate">{participant.username}</span>

                    {participant.isHost && <Crown className="w-3 h-3 text-accent-premium flex-shrink-0" />}

                    {mutedUsers.has(participant.id) && <VolumeX className="w-3 h-3 text-text-tertiary flex-shrink-0" />}
                  </div>

                  <p className="text-xs text-text-tertiary">
                    Joined {formatDistanceToNow(new Date(participant.joinedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {/* Actions for host */}
              {isHost && !participant.isHost && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleMuteUser(participant.id)}>
                      {mutedUsers.has(participant.id) ? (
                        <>
                          <Volume2 className="w-4 h-4 mr-2" />
                          Unmute
                        </>
                      ) : (
                        <>
                          <VolumeX className="w-4 h-4 mr-2" />
                          Mute
                        </>
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleMakeHost(participant.id)}>
                      <Shield className="w-4 h-4 mr-2" />
                      Make Host
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleKickUser(participant.id)} className="text-accent-error">
                      <UserMinus className="w-4 h-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
