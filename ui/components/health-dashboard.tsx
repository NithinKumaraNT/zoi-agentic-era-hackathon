"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Activity,
  Heart,
  Moon,
  Zap,
  Calendar,
  User,
  Settings,
  MessageSquare,
  Send,
  MessageCircle,
} from "lucide-react"
import { WorkoutSystem } from "./workout-system"
import { NutritionSystem } from "./nutrition-system"
import { ProfileSystem } from "./profile-system"
import { SmartwatchIntegration } from "./smartwatch-integration"
import { OnboardingQuestionnaire } from "./onboarding-questionnaire"
import { NutritionButton } from "./nutrition-button"
import { WorkoutReport } from "./workout-report"
import { WelcomePage } from "./welcome-page"
import { ExerciseAnimation } from "./exercise-animation"
import { apiService } from "@/lib/api"
import ReactMarkdown from "react-markdown"

export function HealthDashboard() {
  const [showWelcome, setShowWelcome] = useState(
    !(process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SKIP_ONBOARDING === 'true')
  )
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(
    process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SKIP_ONBOARDING === 'true'
  )
  const [currentView, setCurrentView] = useState<
    "dashboard" | "workout" | "nutrition" | "profile" | "smartwatch" | "report"
  >("dashboard")
  const [showTextInput, setShowTextInput] = useState(false)
  const [textInput, setTextInput] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [showWorkoutPlanInput, setShowWorkoutPlanInput] = useState(false)
  const [workoutPlanText, setWorkoutPlanText] = useState("")
  const [isGeneratingWorkoutPlan, setIsGeneratingWorkoutPlan] = useState(false)
  const [workoutPlanError, setWorkoutPlanError] = useState<string | null>(null)
  const [generatedWorkoutPlan, setGeneratedWorkoutPlan] = useState<string | null>(null)
  const [streamingWorkoutPlan, setStreamingWorkoutPlan] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const streamingContentRef = useRef("")
  const [showGymReport, setShowGymReport] = useState(false)

  const handleOnboardingComplete = (data: any) => {
    console.log("[v0] Onboarding completed with data:", data)
    setHasCompletedOnboarding(true)
    // Here you would typically save the data to your backend or local storage
  }

  const handleWelcomeComplete = () => {
    setShowWelcome(false)
  }

  const handleFeedbackSubmit = () => {
    if (feedbackText.trim()) {
      console.log("[v0] Feedback submitted:", feedbackText)
      setFeedbackText("")
      setShowFeedback(false)
      // Here you would typically send feedback to your backend
    }
  }


  const handleTextInput = () => {
    setShowTextInput(!showTextInput)
    if (showTextInput && textInput.trim()) {
      console.log("[v0] Processing text input:", textInput)
      setTextInput("")
    }
  }

  const handleSendText = () => {
    if (textInput.trim()) {
      console.log("[v0] Sending text:", textInput)
      setTextInput("")
      setShowTextInput(false)
    }
  }

  const handleWorkoutPlanSubmit = async () => {
    if (!workoutPlanText.trim()) return

    setIsGeneratingWorkoutPlan(true)
    setIsStreaming(true)
    setWorkoutPlanError(null)
    setGeneratedWorkoutPlan(null)
    setStreamingWorkoutPlan("")
    streamingContentRef.current = ""

    try {
      // Create a test user ID for development/testing
      const userId = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SKIP_ONBOARDING === 'true' 
        ? 'test_user_dev' 
        : `user_${Date.now()}`
      
      // Create a session for this user
      const sessionId = `session_${Date.now()}`
      await apiService.createSession(userId, sessionId)

      // Format the workout plan request message
      const workoutPlanMessage = `Please create a personalized workout plan based on the following user requirements:

${workoutPlanText}
user_email: margarita.vaquer-melo@zoi.tech
`

      // Use streaming API
      await apiService.sendStreamingMessage(
        userId,
        sessionId,
        workoutPlanMessage,
        (data) => {
          // Handle streaming data
          console.log("[v0] Streaming data received:", data)
          
          // Extract text content from the streaming response
          if (data.content?.parts?.[0]?.text) {
            const newText = data.content.parts[0].text
            streamingContentRef.current += newText
            setStreamingWorkoutPlan(streamingContentRef.current)
            console.log("[v0] Updated streaming content length:", streamingContentRef.current.length)
          }
        },
        (error) => {
          console.error("[v0] Streaming error:", error)
          setWorkoutPlanError(error.message)
          setIsStreaming(false)
        },
        () => {
          // Streaming complete
          console.log("[v0] Streaming complete")
          console.log("[v0] Final streaming content length:", streamingContentRef.current.length)
          console.log("[v0] Final streaming content preview:", streamingContentRef.current.substring(0, 100) + "...")
          
          // Use the ref content which should have the complete text
          setGeneratedWorkoutPlan(streamingContentRef.current)
          setStreamingWorkoutPlan("")
          setIsStreaming(false)
          setWorkoutPlanText("")
        }
      )
      
    } catch (error) {
      console.error("[v0] Error generating workout plan:", error)
      setWorkoutPlanError(error instanceof Error ? error.message : 'Failed to generate workout plan')
      setIsStreaming(false)
    } finally {
      setIsGeneratingWorkoutPlan(false)
    }
  }

  const healthMetrics = {
    recoveryScore: 78,
    restingHeartRate: 62,
    hrv: 45,
    sleepScore: 85,
    workoutReadiness: "High",
    todayWorkout: "Upper Body Strength",
    caloriesBurned: 2340,
    activeMinutes: 87,
  }

  const getReadinessColor = (readiness: string) => {
    switch (readiness) {
      case "High":
        return "bg-green-500"
      case "Medium":
        return "bg-yellow-500"
      case "Low":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (showWelcome) {
    return <WelcomePage onGetStarted={handleWelcomeComplete} />
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingQuestionnaire onComplete={handleOnboardingComplete} />
  }

  if (currentView === "workout") {
    return <WorkoutSystem onBack={() => setCurrentView("dashboard")} />
  }

  if (currentView === "nutrition") {
    return <NutritionSystem onBack={() => setCurrentView("dashboard")} />
  }

  if (currentView === "profile") {
    return <ProfileSystem onBack={() => setCurrentView("dashboard")} />
  }

  if (currentView === "smartwatch") {
    return <SmartwatchIntegration onBack={() => setCurrentView("dashboard")} />
  }

  if (currentView === "report") {
    return <WorkoutReport onBack={() => setCurrentView("dashboard")} />
  }

  return (
    <div className="relative p-4 max-w-md mx-auto space-y-6 pb-24">
      <div className="text-center space-y-2 pt-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setCurrentView("smartwatch")}>
            <Settings className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI wellness coach</h1>
            <p className="text-muted-foreground text-balance">Your intelligent wellness coach</p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setShowFeedback(!showFeedback)}>
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setCurrentView("profile")}>
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">Connected to Pixel Watch</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Heart className="w-4 h-4 text-red-500" />
              Resting HR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthMetrics.restingHeartRate}</div>
            <p className="text-xs text-muted-foreground">bpm</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-blue-500" />
              HRV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthMetrics.hrv}</div>
            <p className="text-xs text-muted-foreground">ms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Moon className="w-4 h-4 text-purple-500" />
              Sleep Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthMetrics.sleepScore}%</div>
            <p className="text-xs text-muted-foreground">8h 15m</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-orange-500" />
              Active Min
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthMetrics.activeMinutes}</div>
            <p className="text-xs text-muted-foreground">of 90 goal</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Today's Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-foreground">{healthMetrics.todayWorkout}</h3>
            <p className="text-sm text-muted-foreground">Recommended Workout</p>
            <p className="text-xs text-muted-foreground mt-1">
              Based on your high recovery score, you're ready for intense training
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setCurrentView("workout")}
            >
              Start Workout
            </Button>
            <Button variant="outline" onClick={() => setShowGymReport(!showGymReport)} className="flex-1">
              {showGymReport ? "Hide Report" : "Last Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {showGymReport && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Activity className="w-5 h-5 text-green-600" />
              Gym Progress Report
            </CardTitle>
            <p className="text-sm text-green-600">Your fitness journey progress</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <img 
                src="/images/gym_progress_20250918_115924.png" 
                alt="Gym Progress Visualization" 
                className="w-full max-w-sm mx-auto rounded-lg shadow-md"
              />
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-green-800 text-lg">🏋️ Your Fitness Transformation Journey</h4>
              
              <div className="bg-white/70 p-4 rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-700 mb-2">📊 Progress Summary</h5>
                <p className="text-sm text-green-600 mb-2">
                  <strong>Consistency Score:</strong> 95% - Excellent! You've maintained your workout routine consistently over the past 3 months.
                </p>
                <p className="text-sm text-green-600 mb-2">
                  <strong>Strength Gains:</strong> +15% increase in overall strength metrics. Your dedication is paying off!
                </p>
                <p className="text-sm text-green-600 mb-2">
                  <strong>Cardio Improvement:</strong> Your endurance has improved by 22% since starting your fitness journey.
                </p>
                <p className="text-sm text-green-600">
                  <strong>Body Composition:</strong> Lean muscle mass increased by 8% while maintaining healthy body fat levels.
                </p>
              </div>

              <div className="bg-white/70 p-4 rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-700 mb-2">🎯 Key Achievements</h5>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>✅ Completed 45 consecutive workout days</li>
                  <li>✅ Increased bench press by 25 lbs</li>
                  <li>✅ Reduced 5K run time by 3 minutes</li>
                  <li>✅ Achieved personal best in deadlift</li>
                  <li>✅ Maintained perfect attendance for 2 months</li>
                </ul>
              </div>

              <div className="bg-white/70 p-4 rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-700 mb-2">💡 AI Coach Insights</h5>
                <p className="text-sm text-green-600 mb-2">
                  Your progress visualization shows the classic "slow and steady wins the race" pattern. 
                  The initial phase was challenging, but your consistency has led to remarkable improvements.
                </p>
                <p className="text-sm text-green-600 mb-2">
                  <strong>Recommendation:</strong> Continue your current routine and consider adding 10 minutes 
                  of flexibility training to prevent injury and improve recovery.
                </p>
                <p className="text-sm text-green-600">
                  <strong>Next Goal:</strong> Focus on progressive overload in your strength training to 
                  continue building muscle mass and strength.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={() => setShowGymReport(false)}
                  variant="outline" 
                  className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                >
                  Close Report
                </Button>
                <Button 
                  onClick={() => setCurrentView("workout")}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  Start Next Workout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Generate Workout Plan
          </CardTitle>
          <p className="text-sm text-muted-foreground">Create a personalized workout plan based on your preferences</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => setShowWorkoutPlanInput(!showWorkoutPlanInput)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {showWorkoutPlanInput ? "Hide Input" : "Generate Workout Plan"}
          </Button>
          
          {showWorkoutPlanInput && (
            <div className="space-y-3">
              {!isStreaming && !generatedWorkoutPlan && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Describe your workout preferences:
                  </label>
                  <textarea
                    value={workoutPlanText}
                    onChange={(e) => setWorkoutPlanText(e.target.value)}
                    placeholder="e.g., I want to focus on upper body strength, 3 times a week, 45 minutes per session, using dumbbells..."
                    className="w-full p-3 border rounded-lg resize-none h-24 text-sm"
                    autoFocus
                  />
                </div>
              )}
              
              {isStreaming && (
                <ExerciseAnimation isActive={true} />
              )}
              
              {streamingWorkoutPlan && isStreaming && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Generating your workout plan...</h4>
                  <div className="text-sm text-blue-700 max-h-40 overflow-y-auto prose prose-sm prose-blue max-w-none">
                    <ReactMarkdown>{streamingWorkoutPlan}</ReactMarkdown>
                    <span className="animate-pulse">|</span>
                  </div>
                </div>
              )}
              
              {!isStreaming && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleWorkoutPlanSubmit}
                    disabled={!workoutPlanText.trim() || isGeneratingWorkoutPlan}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isGeneratingWorkoutPlan ? "Generating..." : "Generate Plan"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowWorkoutPlanInput(false)}
                    className="flex-1"
                    disabled={isGeneratingWorkoutPlan}
                  >
                    Cancel
                  </Button>
                </div>
              )}
              
              {workoutPlanError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{workoutPlanError}</p>
                </div>
              )}
              
              {generatedWorkoutPlan && !isStreaming && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Your Personalized Workout Plan:</h4>
                  <div className="text-sm text-green-700 max-h-60 overflow-y-auto prose prose-sm prose-green max-w-none">
                    <ReactMarkdown>{generatedWorkoutPlan}</ReactMarkdown>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button 
                      onClick={() => {
                        setGeneratedWorkoutPlan(null)
                        setWorkoutPlanText("")
                        setShowWorkoutPlanInput(false)
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      Generate New Plan
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowWorkoutPlanInput(false)}
                      className="flex-1"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-secondary/10 to-primary/5 border-secondary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Recommended for You
          </CardTitle>
          <p className="text-sm text-muted-foreground">AI-selected supplements based on your goals</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
              <div className="flex-1">
                <h4 className="font-semibold text-sm">Whey Protein Powder</h4>
                <p className="text-xs text-muted-foreground">Perfect for muscle recovery</p>
                <p className="text-sm font-bold text-primary mt-1">$29.99</p>
              </div>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Buy Now
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
              <div className="flex-1">
                <h4 className="font-semibold text-sm">Creatine Monohydrate</h4>
                <p className="text-xs text-muted-foreground">Boost strength & power</p>
                <p className="text-sm font-bold text-primary mt-1">$19.99</p>
              </div>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Buy Now
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
              <div className="flex-1">
                <h4 className="font-semibold text-sm">Multivitamin Complex</h4>
                <p className="text-xs text-muted-foreground">Daily nutritional support</p>
                <p className="text-sm font-bold text-primary mt-1">$24.99</p>
              </div>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Buy Now
              </Button>
            </div>
          </div>

          <Button variant="outline" className="w-full bg-transparent">
            View All Products
          </Button>
        </CardContent>
      </Card>

      <NutritionButton onClick={() => setCurrentView("nutrition")} />

      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3">
        {showTextInput && (
          <div className="bg-background border rounded-lg p-3 shadow-lg w-64 mb-2">
            <div className="flex gap-2">
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Ask AI wellness coach anything..."
                className="flex-1"
                onKeyPress={(e) => e.key === "Enter" && handleSendText()}
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleSendText}
                disabled={!textInput.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <Button
          onClick={handleTextInput}
          className={`w-14 h-14 rounded-full shadow-lg transition-all duration-200 ${
            showTextInput
              ? "bg-primary hover:bg-primary/90 text-white"
              : "bg-primary/20 hover:bg-primary/30 text-primary"
          }`}
          size="icon"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>

      {showFeedback && (
        <Card className="border-primary/20 bg-background/95 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Share Your Feedback</CardTitle>
            <p className="text-sm text-muted-foreground">Help us improve your wellness experience</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Tell us what you think about the app, features you'd like to see, or any issues you've encountered..."
              className="w-full p-3 border rounded-lg resize-none h-24 text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                onClick={handleFeedbackSubmit}
                disabled={!feedbackText.trim()}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Send Feedback
              </Button>
              <Button variant="outline" onClick={() => setShowFeedback(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}
