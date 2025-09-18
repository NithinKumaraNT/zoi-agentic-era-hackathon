"use client"

import { useState, useEffect } from "react"

interface ExerciseAnimationProps {
  isActive: boolean
  className?: string
}

const exerciseEmojis = [
  "🏃‍♂️", "🏃‍♀️", "💪", "🏋️‍♂️", "🏋️‍♀️", "🤸‍♂️", "🤸‍♀️", 
  "🚴‍♂️", "🚴‍♀️", "🏊‍♂️", "🏊‍♀️", "🤾‍♂️", "🤾‍♀️", "🏌️‍♂️", 
  "🏌️‍♀️", "⛹️‍♂️", "⛹️‍♀️", "🤺", "🏇", "🧘‍♂️", "🧘‍♀️"
]

const funnyTexts = [
  "💪 Flexing those muscles...",
  "🏃‍♂️ Running for you...",
  "🏋️‍♀️ Lifting your game...",
  "🤸‍♂️ Ready to move...",
  "🚴‍♀️ Pedaling for gains...",
  "🏊‍♂️ Diving into plans...",
  "🤾‍♀️ Planning your moves...",
  "🏌️‍♂️ Teeing up now...",
  "⛹️‍♀️ Bouncing ideas now...",
  "🏇 Galloping to goals...",
  "🧘‍♂️ Finding your zen...",
  "💪 Building your strength...",
  "🏃‍♀️ Sprinting to finish...",
  "🏋️‍♂️ Pumping your plan...",
  "🤸‍♀️ Flipping new moves...",
  "🚴‍♂️ Cycling best options...",
  "🏊‍♀️ Swimming in ideas...",
  "🤾‍♂️ Passing you plans...",
  "🏌️‍♀️ Swinging for goals...",
  "⛹️‍♂️ Jumping into action...",
  "🤺 Dueling with workouts...",
  "🏇 Racing to plan...",
  "🧘‍♀️ Meditating on fitness..."
]

export function ExerciseAnimation({ isActive, className = "" }: ExerciseAnimationProps) {
  const [currentEmoji, setCurrentEmoji] = useState(exerciseEmojis[0])
  const [currentText, setCurrentText] = useState(funnyTexts[0])
  const [textIndex, setTextIndex] = useState(0)

  useEffect(() => {
    if (!isActive) return

    // Rotate emojis every 500ms
    const emojiInterval = setInterval(() => {
      setCurrentEmoji(prev => {
        const currentIndex = exerciseEmojis.indexOf(prev)
        return exerciseEmojis[(currentIndex + 1) % exerciseEmojis.length]
      })
    }, 1000)

    // Rotate funny texts every 2 seconds
    const textInterval = setInterval(() => {
      setTextIndex(prev => (prev + 1) % funnyTexts.length)
      setCurrentText(funnyTexts[textIndex])
    }, 1000)

    return () => {
      clearInterval(emojiInterval)
      clearInterval(textInterval)
    }
  }, [isActive, textIndex])

  if (!isActive) return null

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 p-6 ${className}`}>
      <div className="text-6xl animate-bounce">
        {currentEmoji}
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-primary animate-pulse">
          {currentText}
        </p>
        <div className="flex justify-center space-x-1 mt-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}
