"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, User, Activity, Heart, Target, Loader2 } from "lucide-react"
import { apiService, OnboardingData as ApiOnboardingData } from "@/lib/api"

interface OnboardingData {
  // Personal Info
  email: string
  age: string
  gender: string
  height: string
  currentWeight: string
  goalWeight: string

  // Fitness Profile
  experienceLevel: string
  workoutDays: string
  preferredWorkoutTypes: string[]
  fitnessGoals: string[]

  // Health Notes
  healthNotes: string
}

interface ValidationErrors {
  email?: string
  age?: string
  height?: string
  currentWeight?: string
  goalWeight?: string
}

export function OnboardingQuestionnaire({ onComplete }: { onComplete: (data: OnboardingData) => void }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<OnboardingData>({
    email: "",
    age: "",
    gender: "",
    height: "",
    currentWeight: "",
    goalWeight: "",
    experienceLevel: "",
    workoutDays: "",
    preferredWorkoutTypes: [],
    fitnessGoals: [],
    healthNotes: "",
  })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const calculateBMI = () => {
    if (formData.height && formData.currentWeight) {
      const heightInM = Number.parseFloat(formData.height) / 100
      const weight = Number.parseFloat(formData.currentWeight)
      return (weight / (heightInM * heightInM)).toFixed(1)
    }
    return null
  }

  const calculateGoalBMI = () => {
    if (formData.height && formData.goalWeight) {
      const heightInM = Number.parseFloat(formData.height) / 100
      const weight = Number.parseFloat(formData.goalWeight)
      return (weight / (heightInM * heightInM)).toFixed(1)
    }
    return null
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-600" }
    if (bmi < 25) return { category: "Normal", color: "text-green-600" }
    if (bmi < 30) return { category: "Overweight", color: "text-yellow-600" }
    return { category: "Obese", color: "text-red-600" }
  }

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email) return "Email is required"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return "Please enter a valid email address"
    return undefined
  }

  const validateAge = (age: string): string | undefined => {
    if (!age) return "Age is required"
    const ageNum = Number.parseFloat(age)
    if (isNaN(ageNum) || !Number.isInteger(ageNum)) return "Age must be a whole number"
    if (ageNum < 1) return "Age must be at least 1"
    if (ageNum > 120) return "Age must be 120 or less"
    return undefined
  }

  const validateHeight = (height: string): string | undefined => {
    if (!height) return "Height is required"
    const heightNum = Number.parseFloat(height)
    if (isNaN(heightNum)) return "Height must be a valid number"
    if (heightNum <= 0) return "Height must be positive"
    if (heightNum < 50) return "Height must be at least 50cm"
    if (heightNum > 300) return "Height must be 300cm or less"
    return undefined
  }

  const validateWeight = (weight: string, fieldName: string): string | undefined => {
    if (!weight) return `${fieldName} is required`
    const weightNum = Number.parseFloat(weight)
    if (isNaN(weightNum)) return `${fieldName} must be a valid number`
    if (weightNum <= 0) return `${fieldName} must be greater than 0`
    if (weightNum < 20) return `${fieldName} must be at least 20kg`
    if (weightNum > 500) return `${fieldName} must be 500kg or less`
    return undefined
  }

  const validateField = (field: keyof ValidationErrors, value: string) => {
    let error: string | undefined
    switch (field) {
      case "email":
        error = validateEmail(value)
        break
      case "age":
        error = validateAge(value)
        break
      case "height":
        error = validateHeight(value)
        break
      case "currentWeight":
        error = validateWeight(value, "Current Weight")
        break
      case "goalWeight":
        error = validateWeight(value, "Goal Weight")
        break
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }))
    
    return error === undefined
  }

  const handleOnboardingComplete = async (data: OnboardingData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Generate a unique user ID based on email
      const userId = `user_${data.email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`
      
      // Convert form data to API format
      const apiData: ApiOnboardingData = {
        email: data.email,
        age: data.age,
        gender: data.gender,
        height: data.height,
        currentWeight: data.currentWeight,
        goalWeight: data.goalWeight,
        experienceLevel: data.experienceLevel,
        workoutDays: data.workoutDays,
        preferredWorkoutTypes: data.preferredWorkoutTypes,
        fitnessGoals: data.fitnessGoals,
        healthNotes: data.healthNotes,
      }

      // Register user with backend agent
      const result = await apiService.registerUser(userId, apiData)

      if (result.success) {
        // Call the original onComplete callback with the form data
        onComplete(data)
      } else {
        throw new Error(result.error || 'Failed to register user')
      }
    } catch (error) {
      console.error('Error during user registration:', error)
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      handleOnboardingComplete(formData)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateFormData = (field: keyof OnboardingData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Validate the field if it's one that needs validation
    if (field === "email" || field === "age" || field === "height" || field === "currentWeight" || field === "goalWeight") {
      validateField(field as keyof ValidationErrors, value)
    }
  }

  const toggleArrayItem = (field: "preferredWorkoutTypes" | "fitnessGoals", item: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(item) ? prev[field].filter((i) => i !== item) : [...prev[field], item],
    }))
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.email && 
          formData.age && 
          formData.gender && 
          formData.height && 
          formData.currentWeight && 
          formData.goalWeight &&
          !validationErrors.email &&
          !validationErrors.age &&
          !validationErrors.height &&
          !validationErrors.currentWeight &&
          !validationErrors.goalWeight
        )
      case 2:
        return formData.experienceLevel && formData.workoutDays
      case 3:
        return formData.preferredWorkoutTypes.length > 0 && formData.fitnessGoals.length > 0
      case 4:
        return true // Health notes are optional
      default:
        return false
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Welcome to AI Wellness Coach</h1>
          <div className="text-sm text-muted-foreground">
            {currentStep}/{totalSteps}
          </div>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">Let's personalize your fitness journey</p>
      </div>

      {/* Step 1: Personal Information */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                className={validationErrors.email ? "border-red-500 focus:border-red-500" : ""}
              />
              {validationErrors.email && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  value={formData.age}
                  onChange={(e) => updateFormData("age", e.target.value)}
                  className={validationErrors.age ? "border-red-500 focus:border-red-500" : ""}
                  min="1"
                  max="120"
                />
                {validationErrors.age && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.age}</p>
                )}
              </div>
              <div>
                <Label>Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => updateFormData("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="175"
                value={formData.height}
                onChange={(e) => updateFormData("height", e.target.value)}
                className={validationErrors.height ? "border-red-500 focus:border-red-500" : ""}
                min="50"
                max="300"
                step="0.1"
              />
              {validationErrors.height && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.height}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentWeight">Current Weight (kg)</Label>
                <Input
                  id="currentWeight"
                  type="number"
                  placeholder="70"
                  value={formData.currentWeight}
                  onChange={(e) => updateFormData("currentWeight", e.target.value)}
                  className={validationErrors.currentWeight ? "border-red-500 focus:border-red-500" : ""}
                  min="20"
                  max="500"
                  step="0.1"
                />
                {validationErrors.currentWeight && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.currentWeight}</p>
                )}
              </div>
              <div>
                <Label htmlFor="goalWeight">Goal Weight (kg)</Label>
                <Input
                  id="goalWeight"
                  type="number"
                  placeholder="75"
                  value={formData.goalWeight}
                  onChange={(e) => updateFormData("goalWeight", e.target.value)}
                  className={validationErrors.goalWeight ? "border-red-500 focus:border-red-500" : ""}
                  min="20"
                  max="500"
                  step="0.1"
                />
                {validationErrors.goalWeight && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.goalWeight}</p>
                )}
              </div>
            </div>

            {/* BMI Display */}
            {calculateBMI() && calculateGoalBMI() && (
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg text-center">
                  <div className="text-lg font-bold">Current BMI: {calculateBMI()}</div>
                  <div className={`text-sm ${getBMICategory(Number.parseFloat(calculateBMI()!)).color}`}>
                    {getBMICategory(Number.parseFloat(calculateBMI()!)).category}
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-lg text-center">
                  <div className="text-lg font-bold">Goal BMI: {calculateGoalBMI()}</div>
                  <div className={`text-sm ${getBMICategory(Number.parseFloat(calculateGoalBMI()!)).color}`}>
                    {getBMICategory(Number.parseFloat(calculateGoalBMI()!)).category}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Fitness Profile */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Fitness Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium">Experience Level</Label>
              <RadioGroup
                value={formData.experienceLevel}
                onValueChange={(value) => updateFormData("experienceLevel", value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="beginner" id="beginner" />
                  <Label htmlFor="beginner" className="flex-1 cursor-pointer">
                    <div className="font-medium">Beginner</div>
                    <div className="text-sm text-muted-foreground">0-1 years of experience</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="intermediate" id="intermediate" />
                  <Label htmlFor="intermediate" className="flex-1 cursor-pointer">
                    <div className="font-medium">Intermediate</div>
                    <div className="text-sm text-muted-foreground">1-3 years of experience</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="advanced" id="advanced" />
                  <Label htmlFor="advanced" className="flex-1 cursor-pointer">
                    <div className="font-medium">Advanced</div>
                    <div className="text-sm text-muted-foreground">3+ years of experience</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Workout Days per Week</Label>
              <Select value={formData.workoutDays} onValueChange={(value) => updateFormData("workoutDays", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="2">2 days</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="4">4 days</SelectItem>
                  <SelectItem value="5">5 days</SelectItem>
                  <SelectItem value="6">6 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Workout Preferences & Goals */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Preferences & Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium">Preferred Workout Types</Label>
              <p className="text-sm text-muted-foreground mb-3">Select all that apply</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Strength Training",
                  "Cardio",
                  "HIIT",
                  "Yoga",
                  "Pilates",
                  "Swimming",
                  "Running",
                  "Cycling",
                  "Boxing",
                  "Dance",
                  "Martial Arts",
                  "Calisthenics",
                ].map((workout) => (
                  <div key={workout} className="flex items-center space-x-2 p-2 border rounded-lg">
                    <Checkbox
                      id={workout}
                      checked={formData.preferredWorkoutTypes.includes(workout)}
                      onCheckedChange={() => toggleArrayItem("preferredWorkoutTypes", workout)}
                    />
                    <Label htmlFor={workout} className="text-sm cursor-pointer">
                      {workout}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Fitness Goals</Label>
              <p className="text-sm text-muted-foreground mb-3">What do you want to achieve?</p>
              <div className="space-y-2">
                {[
                  "Build Muscle",
                  "Lose Weight",
                  "Get Stronger",
                  "Improve Endurance",
                  "Better Flexibility",
                  "Improve Recovery",
                  "Increase Energy",
                  "Better Sleep",
                  "Reduce Stress",
                  "General Fitness",
                ].map((goal) => (
                  <div key={goal} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Checkbox
                      id={goal}
                      checked={formData.fitnessGoals.includes(goal)}
                      onCheckedChange={() => toggleArrayItem("fitnessGoals", goal)}
                    />
                    <Label htmlFor={goal} className="cursor-pointer">
                      {goal}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Health Notes */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Health Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="healthNotes">Health Notes (Optional)</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Tell us about any injuries, limitations, or health conditions we should know about
              </p>
              <Textarea
                id="healthNotes"
                placeholder="e.g., I have back pain, avoid heavy deadlifts..."
                value={formData.healthNotes}
                onChange={(e) => updateFormData("healthNotes", e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Privacy & Safety</h4>
              <p className="text-sm text-blue-700">
                Your health information is kept private and secure. This helps us create safer, more personalized
                workout recommendations for you.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {submitError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-red-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Registration Failed</h3>
              <p className="text-sm text-red-700 mt-1">{submitError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 || isSubmitting}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button onClick={handleNext} disabled={!isStepValid() || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {currentStep === totalSteps ? "Registering..." : "Processing..."}
            </>
          ) : (
            <>
              {currentStep === totalSteps ? "Complete Setup" : "Next"}
              {currentStep < totalSteps && <ArrowRight className="w-4 h-4 ml-2" />}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
