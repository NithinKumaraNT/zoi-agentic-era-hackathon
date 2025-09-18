"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from "lucide-react"

interface WorkoutVideoPlayerProps {
  exerciseName: string
  onClose?: () => void
}

// Map exercise names to video file names
const exerciseVideoMap: Record<string, string> = {
  "Push-ups": "push-up.mp4",
  "Pull-ups": "pull-up.mp4", 
  "Boxing": "boxing.mp4"
}

export function WorkoutVideoPlayer({ exerciseName, onClose }: WorkoutVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const videoSrc = exerciseVideoMap[exerciseName] ? `/videos/${exerciseVideoMap[exerciseName]}` : null

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!videoSrc) {
    return (
      <Card className="w-full bg-black/95 border-primary/20">
        <CardContent className="p-6 text-center">
          <p className="text-white">Video not available for {exerciseName}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-black/95 border-primary/20">
      <CardContent className="p-0">
        {/* Video Player */}
        <div className="relative aspect-video overflow-hidden">
          <video
            ref={videoRef}
            src={videoSrc}
            className="w-full h-full object-cover"
            muted={isMuted}
            preload="metadata"
          />
          
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-white">Loading video...</div>
            </div>
          )}

          {/* Exercise Info Overlay */}
          <div className="absolute bottom-4 left-4 text-white z-10">
            <h3 className="text-xl font-bold mb-1">{exerciseName}</h3>
            <p className="text-sm text-white/80">Exercise demonstration</p>
          </div>

          {/* Play/Pause Overlay */}
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity"
          >
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
            </div>
          </button>
        </div>

        {/* Video Controls */}
        <div className="p-4 bg-black/90">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-white text-sm mb-2">
              <span>{formatTime(currentTime)}</span>
              <div 
                className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-orange-500 transition-all duration-300"
                  style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                />
              </div>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={togglePlay} className="text-white hover:bg-white/10">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const video = videoRef.current
                  if (video) {
                    video.currentTime = 0
                    setCurrentTime(0)
                  }
                }}
                className="text-white hover:bg-white/10"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleMute} className="text-white hover:bg-white/10">
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>

              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
