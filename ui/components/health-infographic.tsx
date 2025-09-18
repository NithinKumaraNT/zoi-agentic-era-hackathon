"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { User, Heart, Activity, Moon, Target, Utensils, TrendingUp, Calendar } from "lucide-react"

interface HealthData {
  name: string
  age: number
  gender: string
  height: number // cm
  currentWeight: number // kg
  targetWeight: number // kg
  currentBMI: number
  targetBMI: number
  bloodPressure: string
  heartRate: number
  dailySteps: number
  sleepHours: number
  activityLevel: string
  preferredWorkout: string[]
  dietaryPreference: string
}

interface HealthInfographicProps {
  data: HealthData
}

export function HealthInfographic({ data }: HealthInfographicProps) {
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-500" }
    if (bmi < 25) return { category: "Normal", color: "text-green-500" }
    if (bmi < 30) return { category: "Overweight", color: "text-yellow-500" }
    return { category: "Obese", color: "text-red-500" }
  }

  const getActivityColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-blue-500"
      case "intermediate":
        return "bg-purple-500"
      case "advanced":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStepsProgress = (steps: number) => {
    const target = 10000
    return Math.min((steps / target) * 100, 100)
  }

  const getSleepQuality = (hours: number) => {
    if (hours >= 7 && hours <= 9) return { quality: "Optimal", color: "text-green-500" }
    if (hours >= 6 && hours < 7) return { quality: "Good", color: "text-yellow-500" }
    return { quality: "Needs Improvement", color: "text-red-500" }
  }

  const currentBMICategory = getBMICategory(data.currentBMI)
  const targetBMICategory = getBMICategory(data.targetBMI)
  const sleepQuality = getSleepQuality(data.sleepHours)
  const stepsProgress = getStepsProgress(data.dailySteps)

  return (
    <div className="space-y-6">
      {/* Personal Profile Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{data.name}</h3>
              <p className="text-sm text-muted-foreground">
                {data.age} years • {data.gender}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">{data.height} cm</div>
              <p className="text-xs text-muted-foreground">Height</p>
            </div>
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{data.activityLevel}</div>
              <p className="text-xs text-muted-foreground">Activity Level</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weight & BMI Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-500" />
            Weight & BMI Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Current Stats */}
            <div className="space-y-3">
              <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/20 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{data.currentWeight} kg</div>
                <p className="text-xs text-muted-foreground">Current Weight</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/20 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{data.currentBMI}</div>
                <p className="text-xs text-muted-foreground">Current BMI</p>
                <Badge className={`mt-1 text-xs ${currentBMICategory.color} bg-transparent border-current`}>
                  {currentBMICategory.category}
                </Badge>
              </div>
            </div>

            {/* Target Stats */}
            <div className="space-y-3">
              <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-blue-500/20 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{data.targetWeight} kg</div>
                <p className="text-xs text-muted-foreground">Target Weight</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-blue-500/20 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{data.targetBMI}</div>
                <p className="text-xs text-muted-foreground">Target BMI</p>
                <Badge className={`mt-1 text-xs ${targetBMICategory.color} bg-transparent border-current`}>
                  {targetBMICategory.category}
                </Badge>
              </div>
            </div>
          </div>

          {/* Weight Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Goal</span>
              <span>{Math.abs(data.currentWeight - data.targetWeight)} kg to go</span>
            </div>
            <div className="relative">
              <Progress
                value={Math.max(0, 100 - (Math.abs(data.currentWeight - data.targetWeight) / data.currentWeight) * 100)}
                className="h-3"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Vitals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Health Vitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-red-500/10 to-pink-500/20 rounded-lg">
              <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-red-600">{data.heartRate}</div>
              <p className="text-xs text-muted-foreground">Resting HR (bpm)</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/20 rounded-lg">
              <Activity className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-blue-600">{data.bloodPressure}</div>
              <p className="text-xs text-muted-foreground">Blood Pressure</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" />
            Daily Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Daily Steps</span>
              <span className="text-sm text-muted-foreground">{data.dailySteps.toLocaleString()} / 10,000</span>
            </div>
            <Progress value={stepsProgress} className="h-2" />
            <div className="text-center">
              <Badge
                className={`${stepsProgress >= 100 ? "bg-green-500" : stepsProgress >= 70 ? "bg-yellow-500" : "bg-red-500"} text-white`}
              >
                {stepsProgress >= 100 ? "Goal Achieved!" : stepsProgress >= 70 ? "Almost There" : "Keep Going"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center p-3 bg-gradient-to-br from-purple-500/10 to-indigo-500/20 rounded-lg">
              <Moon className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-purple-600">{data.sleepHours}h</div>
              <p className="text-xs text-muted-foreground">Sleep</p>
              <Badge className={`mt-1 text-xs ${sleepQuality.color} bg-transparent border-current`}>
                {sleepQuality.quality}
              </Badge>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-orange-500/10 to-red-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-orange-600">
                <Badge className={`${getActivityColor(data.activityLevel)} text-white`}>{data.activityLevel}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Fitness Level</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Workout & Diet Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Preferred Workouts
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.preferredWorkout.map((workout, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700">
                  {workout}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Utensils className="w-4 h-4" />
              Dietary Preference
            </h4>
            <Badge className="bg-green-100 text-green-700 border-green-200">{data.dietaryPreference}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
