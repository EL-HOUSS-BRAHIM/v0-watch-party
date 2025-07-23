"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Users, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSocket } from "@/hooks/use-socket"

interface VideoPlayerProps {
  src: string
  partyId?: string
  isHost?: boolean
  className?: string
  onTimeUpdate?: (time: number) => void
}

export function VideoPlayer({ src, partyId, isHost = false, className, onTimeUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Socket for real-time sync
  const { socket } = useSocket(partyId ? `/party/${partyId}` : null)

  // Video sync effect
  useEffect(() => {
    if (!socket || !partyId) return

    socket.on("video:control", (data) => {
      if (!videoRef.current) return

      const video = videoRef.current
      const timeDiff = Math.abs(video.currentTime - data.timestamp)

      // Sync if difference is more than 1 second
      if (timeDiff > 1) {
        video.currentTime = data.timestamp
      }

      if (data.action === "play" && video.paused) {
        video.play()
      } else if (data.action === "pause" && !video.paused) {
        video.pause()
      }
    })

    return () => socket.off("video:control")
  }, [socket, partyId])

  const handlePlay = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
      if (isHost && socket) {
        socket.emit("video:control", {
          action: "pause",
          timestamp: videoRef.current.currentTime,
        })
      }
    } else {
      videoRef.current.play()
      if (isHost && socket) {
        socket.emit("video:control", {
          action: "play",
          timestamp: videoRef.current.currentTime,
        })
      }
    }
  }

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return

    const newTime = (value[0] / 100) * duration
    videoRef.current.currentTime = newTime

    if (isHost && socket) {
      socket.emit("video:control", {
        action: "seek",
        timestamp: newTime,
      })
    }
  }

  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return

    const newVolume = value[0] / 100
    videoRef.current.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (!videoRef.current) return

    if (isMuted) {
      videoRef.current.volume = volume
      setIsMuted(false)
    } else {
      videoRef.current.volume = 0
      setIsMuted(true)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div
      className={cn("relative bg-black rounded-lg overflow-hidden group", className)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => {
          const time = e.currentTarget.currentTime
          setCurrentTime(time)
          onTimeUpdate?.(time)
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onVolumeChange={(e) => {
          setVolume(e.currentTarget.volume)
          setIsMuted(e.currentTarget.muted)
        }}
      />

      {/* Party Info Overlay */}
      {partyId && (
        <div className="absolute top-4 left-4 flex items-center space-x-2">
          <Badge variant="secondary" className="bg-black/50 text-white">
            <Users className="w-3 h-3 mr-1" />
            Live Party
          </Badge>
          {isHost && (
            <Badge variant="default" className="bg-accent-primary/90">
              Host
            </Badge>
          )}
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0",
        )}
      >
        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 text-white"
            onClick={handlePlay}
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </Button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          {/* Progress Bar */}
          <Slider
            value={[duration ? (currentTime / duration) * 100 : 0]}
            onValueChange={handleSeek}
            className="w-full"
            step={0.1}
          />

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={handlePlay}>
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>

              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>

                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                  step={1}
                />
              </div>

              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {partyId && (
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <MessageCircle className="w-4 h-4" />
                </Button>
              )}

              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Settings className="w-4 h-4" />
              </Button>

              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleFullscreen}>
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
