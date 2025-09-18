"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, User, Target, Activity, Award, Save, Edit3 } from "lucide-react"

interface UserProfile {
  name: string
  age: number
  height: number
  weight: number
  activityLevel: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active"
  fitnessGoals: string[]
  preferredWorkouts: string[]
  dietaryRestrictions: string[]
  workoutDays: number
  targetWeight: number
  experience: "beginner" | "intermediate" | "advanced"
  injuries: string
}

interface FitnessGoals {
  primary: string
  secondary: string[]
  timeline: string
  motivation: string
}

export function ProfileSystem({ onBack }: { onBack: () => void }) {
  const [currentView, setCurrentView] = useState<"overview" | "edit" | "goals">("overview")
  const [isEditing, setIsEditing] = useState(false)

  // Mock user profile data
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Margarita Vaquer-Melo",
    age: 28,
    height: 175, // cm
    weight: 70, // kg
    activityLevel: "moderately_active",
    fitnessGoals: ["Build Muscle", "Improve Strength", "Better Recovery"],
    preferredWorkouts: ["Strength Training", "HIIT", "Yoga"],
    dietaryRestrictions: ["Vegetarian"],
    workoutDays: 4,
    targetWeight: 75,
    experience: "intermediate",
    injuries: "Previous lower back strain - avoid heavy deadlifts",
  })

  const [fitnessGoals, setFitnessGoals] = useState<FitnessGoals>({
    primary: "Build Muscle",
    secondary: ["Improve Strength", "Better Recovery"],
    timeline: "6 months",
    motivation: "Want to feel stronger and more confident in daily activities",
  })

  const activityLevels = {
    sedentary: "Sedentary (Office job, no exercise)",
    lightly_active: "Lightly Active (Light exercise 1-3 days/week)",
    moderately_active: "Moderately Active (Moderate exercise 3-5 days/week)",
    very_active: "Very Active (Hard exercise 6-7 days/week)",
    extremely_active: "Extremely Active (Physical job + exercise)",
  }

  const calculateBMI = () => {
    const heightInM = userProfile.height / 100
    return (userProfile.weight / (heightInM * heightInM)).toFixed(1)
  }

  const calculateGoalBMI = () => {
    const heightInM = userProfile.height / 100
    return (userProfile.targetWeight / (heightInM * heightInM)).toFixed(1)
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-600" }
    if (bmi < 25) return { category: "Normal", color: "text-green-600" }
    if (bmi < 30) return { category: "Overweight", color: "text-yellow-600" }
    return { category: "Obese", color: "text-red-600" }
  }

  const getExperienceColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-700"
      case "intermediate":
        return "bg-yellow-100 text-yellow-700"
      case "advanced":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  if (currentView === "goals") {
    return (
      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setCurrentView("overview")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold">Fitness Goals</h2>
            <p className="text-sm text-muted-foreground">Define your objectives</p>
          </div>
        </div>

        {/* Primary Goal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Primary Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary mb-2">{fitnessGoals.primary}</div>
              <Badge className="bg-primary text-primary-foreground">Target: {fitnessGoals.timeline}</Badge>
            </div>
            <div>
              <Label className="text-sm font-medium">Motivation</Label>
              <p className="text-sm text-muted-foreground mt-1">{fitnessGoals.motivation}</p>
            </div>
          </CardContent>
        </Card>

        {/* Secondary Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Secondary Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {fitnessGoals.secondary.map((goal) => (
                <Badge key={goal} variant="secondary">
                  {goal}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Progress Milestones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium text-sm">Week 1-2: Foundation</div>
                <div className="text-xs text-muted-foreground">Establish routine & form</div>
              </div>
              <Badge className="bg-green-500 text-white">✓ Complete</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <div className="font-medium text-sm">Week 3-8: Building</div>
                <div className="text-xs text-muted-foreground">Increase intensity & volume</div>
              </div>
              <Badge className="bg-yellow-500 text-white">In Progress</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-sm">Week 9-24: Mastery</div>
                <div className="text-xs text-muted-foreground">Advanced techniques & goals</div>
              </div>
              <Badge variant="secondary">Upcoming</Badge>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Goal Strategy</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on your muscle-building goal, I'm prioritizing progressive overload in strength training with
                  adequate protein intake and recovery time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentView === "edit") {
    return (
      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setCurrentView("overview")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold">Edit Profile</h2>
            <p className="text-sm text-muted-foreground">Update your information</p>
          </div>
        </div>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" value={userProfile.age} />
              </div>
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input id="height" type="number" value={userProfile.height} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Current Weight (kg)</Label>
                <Input id="weight" type="number" value={userProfile.weight} />
              </div>
              <div>
                <Label htmlFor="target">Target Weight (kg)</Label>
                <Input id="target" type="number" value={userProfile.targetWeight} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity & Experience */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activity & Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Activity Level</Label>
              <Select value={userProfile.activityLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(activityLevels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Experience Level</Label>
              <Select value={userProfile.experience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                  <SelectItem value="advanced">Advanced (3+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="workoutDays">Workout Days per Week</Label>
              <Input id="workoutDays" type="number" min="1" max="7" value={userProfile.workoutDays} />
            </div>
          </CardContent>
        </Card>

        {/* Health & Restrictions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Health Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="injuries">Injuries or Limitations</Label>
              <Textarea
                id="injuries"
                placeholder="Describe any injuries, limitations, or areas to avoid..."
                value={userProfile.injuries}
                className="min-h-[80px]"
              />
            </div>
            <div>
              <Label>Dietary Restrictions</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Paleo"].map((restriction) => (
                  <Badge
                    key={restriction}
                    variant={userProfile.dietaryRestrictions.includes(restriction) ? "default" : "secondary"}
                    className="cursor-pointer"
                  >
                    {restriction}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button className="w-full" onClick={() => setCurrentView("overview")}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-bold">Profile</h2>
          <p className="text-sm text-muted-foreground">Your fitness journey</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setCurrentView("edit")}>
          <Edit3 className="w-4 h-4" />
        </Button>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {userProfile.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold">{userProfile.age}</div>
              <div className="text-xs text-muted-foreground">Years old</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold">{userProfile.height}cm</div>
              <div className="text-xs text-muted-foreground">Height</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold">{userProfile.weight}kg</div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <div className="text-lg font-bold text-primary">{userProfile.targetWeight}kg</div>
              <div className="text-xs text-muted-foreground">Target</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
              <div className="text-lg font-bold">BMI: {calculateBMI()}</div>
              <div className="text-xs text-muted-foreground mb-1">Current</div>
              <div className={`text-xs ${getBMICategory(Number.parseFloat(calculateBMI())).color}`}>
                {getBMICategory(Number.parseFloat(calculateBMI())).category}
              </div>
            </div>
            <div className="text-center p-3 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-lg">
              <div className="text-lg font-bold">BMI: {calculateGoalBMI()}</div>
              <div className="text-xs text-muted-foreground mb-1">Goal</div>
              <div className={`text-xs ${getBMICategory(Number.parseFloat(calculateGoalBMI())).color}`}>
                {getBMICategory(Number.parseFloat(calculateGoalBMI())).category}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fitness Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Fitness Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Experience Level</span>
            <Badge className={getExperienceColor(userProfile.experience)}>{userProfile.experience}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Workout Days</span>
            <Badge variant="secondary">{userProfile.workoutDays} days/week</Badge>
          </div>

          <div>
            <span className="text-sm font-medium">Activity Level</span>
            <p className="text-xs text-muted-foreground mt-1">{activityLevels[userProfile.activityLevel]}</p>
          </div>

          <div>
            <span className="text-sm font-medium">Preferred Workouts</span>
            <div className="flex flex-wrap gap-1 mt-2">
              {userProfile.preferredWorkouts.map((workout) => (
                <Badge key={workout} variant="secondary" className="text-xs">
                  {workout}
                </Badge>
              ))}
            </div>
          </div>

          {userProfile.dietaryRestrictions.length > 0 && (
            <div>
              <span className="text-sm font-medium">Dietary Restrictions</span>
              <div className="flex flex-wrap gap-1 mt-2">
                {userProfile.dietaryRestrictions.map((restriction) => (
                  <Badge key={restriction} variant="outline" className="text-xs">
                    {restriction}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Goals Overview */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView("goals")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Current Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
            <div className="font-semibold text-primary">{fitnessGoals.primary}</div>
            <div className="text-xs text-muted-foreground mt-1">Primary Goal</div>
          </div>

          <div className="flex flex-wrap gap-1">
            {fitnessGoals.secondary.map((goal) => (
              <Badge key={goal} variant="secondary" className="text-xs">
                {goal}
              </Badge>
            ))}
          </div>

          <Button variant="ghost" className="w-full text-xs">
            View Detailed Goals →
          </Button>
        </CardContent>
      </Card>

      {/* Health Notes */}
      {userProfile.injuries && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-lg text-yellow-700">Health Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-600">{userProfile.injuries}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
