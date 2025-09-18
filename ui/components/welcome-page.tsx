"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Zap, Heart, Target, Smartphone } from "lucide-react"
import Image from "next/image"

interface WelcomePageProps {
  onGetStarted: () => void
}

export function WelcomePage({ onGetStarted }: WelcomePageProps) {
  const [currentFeature, setCurrentFeature] = useState(0)

  const features = [
    {
      icon: <Heart className="w-8 h-8 text-primary" />,
      title: "Smart Health Tracking",
      description: "AI-powered analysis of your smartwatch data for personalized insights",
    },
    {
      icon: <Target className="w-8 h-8 text-primary" />,
      title: "Personalized Workouts",
      description: "Custom workout plans that adapt to your fitness level and recovery",
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "Nutrition Guidance",
      description: "Intelligent meal planning and supplement recommendations",
    },
    {
      icon: <Smartphone className="w-8 h-8 text-primary" />,
      title: "Voice & Chat AI",
      description: "Get instant answers and coaching through voice or text",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000) // Change feature every 3 seconds

    return () => clearInterval(interval)
  }, [features.length])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card relative overflow-hidden">
      {/* Background geometric elements */}
      <div className="absolute top-20 right-10 w-32 h-32 border border-primary/20 rotate-45 rounded-lg"></div>
      <div className="absolute bottom-40 left-10 w-24 h-24 border border-primary/10 rotate-12 rounded-lg"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 max-w-md mx-auto">
        {/* Hero Image */}
        <div className="relative w-80 h-80 mb-8 rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src="/images/fitness-hero.png"
            alt="AI Wellness Coach - Dynamic fitness training with woman in athletic wear"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent"></div>
        </div>

        {/* Title and Subtitle */}
        <div className="text-center mb-8 space-y-3">
          <h1 className="text-4xl font-bold text-foreground text-balance">AI Wellness Coach</h1>
          <p className="text-lg text-muted-foreground text-balance leading-relaxed">
            Transform your smartwatch data into personalized workout and nutrition plans
          </p>
        </div>

        {/* Features Carousel */}
        <Card className="w-full mb-8 bg-card/50 backdrop-blur-sm border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              {features[currentFeature].icon}
              <h3 className="text-xl font-semibold text-foreground">{features[currentFeature].title}</h3>
              <p className="text-muted-foreground text-balance">{features[currentFeature].description}</p>
            </div>

            {/* Feature dots */}
            <div className="flex justify-center gap-2 mt-6">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentFeature ? "bg-primary w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Benefits */}
        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <div className="text-center p-4 rounded-lg bg-card/30 border border-primary/10">
            <div className="text-2xl font-bold text-primary mb-1">24/7</div>
            <div className="text-sm text-muted-foreground">AI Coaching</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-card/30 border border-primary/10">
            <div className="text-2xl font-bold text-primary mb-1">Smart</div>
            <div className="text-sm text-muted-foreground">Adaptations</div>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onGetStarted}
          size="lg"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          Get Started
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
        </Button>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Connect your smartwatch and start your personalized wellness journey
        </p>
      </div>
    </div>
  )
}
