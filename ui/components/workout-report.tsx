"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, TrendingUp, Target, AlertCircle, CheckCircle, Clock, Zap } from "lucide-react"
import { HealthInfographic } from "./health-infographic"

interface WorkoutReportProps {
  onBack: () => void
}

export function WorkoutReport({ onBack }: WorkoutReportProps) {
  const lastWorkout = {
    date: "Yesterday",
    type: "Upper Body Strength",
    duration: "45 minutes",
    caloriesBurned: 320,
    exercises: [
      { name: "Bench Press", sets: 4, reps: "8-10", weight: "185 lbs", completed: true },
      { name: "Pull-ups", sets: 3, reps: "6-8", weight: "Body weight", completed: true },
      { name: "Shoulder Press", sets: 3, reps: "10-12", weight: "135 lbs", completed: false },
      { name: "Barbell Rows", sets: 4, reps: "8-10", weight: "155 lbs", completed: true },
    ],
    overallPerformance: 85,
    heartRateAvg: 142,
    heartRateMax: 168,
  }

  const focusAreas = [
    {
      area: "Shoulder Strength",
      priority: "High",
      reason: "Incomplete shoulder press sets suggest need for improvement",
      recommendation: "Add lighter shoulder isolation exercises",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      area: "Pull-up Endurance",
      priority: "Medium",
      reason: "Good form but could increase reps for better endurance",
      recommendation: "Add assisted pull-ups or negatives",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      area: "Recovery Time",
      priority: "Low",
      reason: "Rest periods were optimal for strength training",
      recommendation: "Maintain current rest intervals",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ]

  const completedExercises = lastWorkout.exercises.filter((ex) => ex.completed).length
  const totalExercises = lastWorkout.exercises.length
  const completionRate = (completedExercises / totalExercises) * 100

  const healthData = {
    name: "Margarita V.",
    age: 29,
    gender: "Female",
    height: 165,
    currentWeight: 61.6,
    targetWeight: 58,
    currentBMI: 22.6,
    targetBMI: 21.3,
    bloodPressure: "118/76",
    heartRate: 72,
    dailySteps: 8900,
    sleepHours: 7.1,
    activityLevel: "Intermediate",
    preferredWorkout: ["Yoga", "Running"],
    dietaryPreference: "Vegetarian",
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-4 pt-8">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workout Report</h1>
          <p className="text-sm text-muted-foreground">Analysis of your last session</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 text-foreground">Health Overview</h2>
        <HealthInfographic data={healthData} />
      </div>

      {/* Workout Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            {lastWorkout.type}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {lastWorkout.date} • {lastWorkout.duration}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">{lastWorkout.caloriesBurned}</div>
              <p className="text-xs text-muted-foreground">Calories Burned</p>
            </div>
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">{lastWorkout.overallPerformance}%</div>
              <p className="text-xs text-muted-foreground">Performance</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Exercise Completion</span>
              <span>
                {completedExercises}/{totalExercises}
              </span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Avg HR: {lastWorkout.heartRateAvg} bpm</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <span>Max HR: {lastWorkout.heartRateMax} bpm</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Exercise Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {lastWorkout.exercises.map((exercise, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                {exercise.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium text-sm">{exercise.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {exercise.sets} sets × {exercise.reps} @ {exercise.weight}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Focus Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Suggested Focus Areas
          </CardTitle>
          <p className="text-sm text-muted-foreground">AI-powered recommendations for improvement</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {focusAreas.map((focus, index) => (
            <div key={index} className={`p-4 rounded-lg border ${focus.bgColor}`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm">{focus.area}</h3>
                <span className={`text-xs px-2 py-1 rounded-full bg-white ${focus.color}`}>{focus.priority}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{focus.reason}</p>
              <p className="text-xs font-medium">{focus.recommendation}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button className="w-full bg-primary text-black hover:bg-primary/90">Plan Next Workout</Button>
        <Button variant="outline" className="w-full bg-transparent">
          View Detailed Analytics
        </Button>
      </div>
    </div>
  )
}
