"use client"

import type React from "react"

import { useState, useRef, useEffect, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Smile, ImageIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { useSocket } from "@/hooks/use-socket"

interface ChatMessage {
  id: string
  content: string
  timestamp: string
  user: {
    id: string
    username: string
    avatar?: string
    isHost?: boolean
  }
  type: "message" | "system" | "reaction"
}

interface ChatInterfaceProps {
  partyId: string
  className?: string
}

export function ChatInterface({ partyId, className }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { socket } = useSocket(`/chat/${partyId}`)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    socket.on("chat:message", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message])
    })

    socket.on("chat:typing", ({ userId, username, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          return prev.includes(username) ? prev : [...prev, username]
        } else {
          return prev.filter((user) => user !== username)
        }
      })
    })

    socket.on("chat:history", (history: ChatMessage[]) => {
      setMessages(history)
    })

    return () => {
      socket.off("chat:message")
      socket.off("chat:typing")
      socket.off("chat:history")
    }
  }, [socket])

  // Typing indicator
  useEffect(() => {
    if (!socket) return

    const timeout = setTimeout(() => {
      if (isTyping) {
        socket.emit("chat:typing", { isTyping: false })
        setIsTyping(false)
      }
    }, 1000)

    return () => clearTimeout(timeout)
  }, [inputValue, socket, isTyping])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)

    if (!isTyping && socket) {
      socket.emit("chat:typing", { isTyping: true })
      setIsTyping(true)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim() || !socket) return

    socket.emit("chat:message", { content: inputValue.trim() })
    setInputValue("")

    if (isTyping) {
      socket.emit("chat:typing", { isTyping: false })
      setIsTyping(false)
    }

    inputRef.current?.focus()
  }

  const handleReaction = (messageId: string, emoji: string) => {
    if (!socket) return

    socket.emit("chat:reaction", { messageId, emoji })
  }

  return (
    <div className={cn("flex flex-col h-full bg-background-secondary rounded-lg", className)}>
      {/* Header */}
      <div className="p-4 border-b border-background-tertiary">
        <h3 className="font-semibold text-text-primary">Live Chat</h3>
        <p className="text-sm text-text-secondary">{messages.length} messages</p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="group">
              {message.type === "system" ? (
                <div className="text-center">
                  <Badge variant="secondary" className="text-xs">
                    {message.content}
                  </Badge>
                </div>
              ) : (
                <div className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={message.user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{message.user.username[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm text-text-primary">{message.user.username}</span>

                      {message.user.isHost && (
                        <Badge variant="default" className="text-xs px-1.5 py-0.5">
                          Host
                        </Badge>
                      )}

                      <span className="text-xs text-text-tertiary">
                        {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                      </span>
                    </div>

                    <p className="text-sm text-text-secondary break-words">{message.content}</p>

                    {/* Quick reactions */}
                    <div className="flex items-center space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {["👍", "❤️", "😂", "😮"].map((emoji) => (
                        <Button
                          key={emoji}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-xs hover:bg-background-tertiary"
                          onClick={() => handleReaction(message.id, emoji)}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center space-x-2 text-text-tertiary">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce delay-200" />
              </div>
              <span className="text-sm">
                {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-background-tertiary">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="pr-20"
              maxLength={500}
            />

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Smile className="w-4 h-4" />
              </Button>

              <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                <ImageIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button type="submit" size="sm" disabled={!inputValue.trim()} className="px-3">
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-xs text-text-tertiary mt-2">{inputValue.length}/500 characters</div>
      </form>
    </div>
  )
}
