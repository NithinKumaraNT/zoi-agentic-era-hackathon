"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dumbbell, Clock, Target, Play, CheckCircle, ArrowLeft, Flame } from "lucide-react"
import { WorkoutVideoPlayer } from "./workout-video-player"

interface Exercise {
  id: string
  name: string
  sets: number
  reps: string
  restTime: number
  targetMuscles: string[]
  difficulty: "Easy" | "Medium" | "Hard"
  completed: boolean
}

interface WorkoutPlan {
  id: string
  name: string
  duration: number
  difficulty: "Easy" | "Medium" | "Hard"
  targetZone: string
  exercises: Exercise[]
  aiReasoning: string
}

export function WorkoutSystem({ onBack }: { onBack: () => void }) {
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutPlan | null>(null)
  const [activeExercise, setActiveExercise] = useState<string | null>(null)
  const [workoutStarted, setWorkoutStarted] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [showVideo, setShowVideo] = useState<string | null>(null)

  // Mock AI-generated workout plans based on recovery score
  const workoutPlans: WorkoutPlan[] = [
    {
      id: "1",
      name: "Upper Body Strength",
      duration: 45,
      difficulty: "Hard",
      targetZone: "Strength Building",
      aiReasoning: "Your recovery score of 78% indicates high readiness. Perfect for challenging strength work.",
      exercises: [
        {
          id: "1",
          name: "Push-ups",
          sets: 3,
          reps: "12-15",
          restTime: 60,
          targetMuscles: ["Chest", "Triceps", "Shoulders"],
          difficulty: "Medium",
          completed: false,
        },
        {
          id: "2",
          name: "Pull-ups",
          sets: 3,
          reps: "8-10",
          restTime: 90,
          targetMuscles: ["Back", "Biceps"],
          difficulty: "Hard",
          completed: false,
        },
        {
          id: "3",
          name: "Boxing",
          sets: 3,
          reps: "8-10",
          restTime: 90,
          targetMuscles: ["Shoulders", "Triceps"],
          difficulty: "Hard",
          completed: false,
        }
      ],
    }
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500"
      case "Medium":
        return "bg-yellow-500"
      case "Hard":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const startWorkout = (workout: WorkoutPlan) => {
    setCurrentWorkout(workout)
    setWorkoutStarted(true)
    setTimer(0)
  }

  const completeExercise = (exerciseId: string) => {
    if (!currentWorkout) return

    const updatedExercises = currentWorkout.exercises.map((ex) =>
      ex.id === exerciseId ? { ...ex, completed: true } : ex,
    )

    setCurrentWorkout({
      ...currentWorkout,
      exercises: updatedExercises,
    })

    setActiveExercise(null)
  }

  const getWorkoutProgress = () => {
    if (!currentWorkout) return 0
    const completed = currentWorkout.exercises.filter((ex) => ex.completed).length
    return (completed / currentWorkout.exercises.length) * 100
  }

  if (currentWorkout && workoutStarted) {
    return (
      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Workout Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCurrentWorkout(null)
              setWorkoutStarted(false)
              setShowVideo(null)
              onBack()
            }}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{currentWorkout.name}</h2>
            <p className="text-sm text-muted-foreground">
              {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")} elapsed
            </p>
          </div>
        </div>

        {showVideo && (
          <div className="space-y-4">
            <WorkoutVideoPlayer exerciseName={showVideo} onClose={() => setShowVideo(null)} />
            <Button variant="outline" onClick={() => setShowVideo(null)} className="w-full">
              Close Video
            </Button>
          </div>
        )}

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(getWorkoutProgress())}%</span>
              </div>
              <Progress value={getWorkoutProgress()} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Exercise List */}
        <div className="space-y-3">
          {currentWorkout.exercises.map((exercise, index) => (
            <Card key={exercise.id} className={`${exercise.completed ? "bg-green-50 border-green-200" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Exercise {index + 1}</span>
                      {exercise.completed && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </div>
                    <h3 className="font-semibold text-lg">{exercise.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{exercise.sets} sets</span>
                      <span>{exercise.reps} reps</span>
                      <span>{exercise.restTime}s rest</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {exercise.targetMuscles.map((muscle) => (
                        <Badge key={muscle} variant="secondary" className="text-xs">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={`${getDifficultyColor(exercise.difficulty)} text-white text-xs`}>
                      {exercise.difficulty}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => setShowVideo(exercise.name)} className="text-xs">
                      <Play className="w-3 h-3 mr-1" />
                      Video
                    </Button>
                    {!exercise.completed && (
                      <Button size="sm" onClick={() => completeExercise(exercise.id)} className="text-xs">
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Workout Complete */}
        {getWorkoutProgress() === 100 && (
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-700 mb-2">Workout Complete!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Great job! Your next workout will be adjusted based on today's performance.
              </p>
              <Button
                onClick={() => {
                  setCurrentWorkout(null)
                  setWorkoutStarted(false)
                  setShowVideo(null)
                  onBack()
                }}
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
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
        <div>
          <h2 className="text-xl font-bold">Workout Plans</h2>
          <p className="text-sm text-muted-foreground">AI-personalized for your recovery</p>
        </div>
      </div>

      {/* AI Insight */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Recommendation</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Based on your 78% recovery score and sleep quality, you're ready for high-intensity training today.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workout Plans */}
      <div className="space-y-4">
        {workoutPlans.map((workout) => (
          <Card key={workout.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Dumbbell className="w-5 h-5 text-primary" />
                    {workout.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{workout.targetZone}</p>
                </div>
                <Badge className={`${getDifficultyColor(workout.difficulty)} text-white`}>{workout.difficulty}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {workout.duration} min
                </div>
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4" />
                  {workout.exercises.length} exercises
                </div>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>AI Insight:</strong> {workout.aiReasoning}
                </p>
              </div>

              <Button className="w-full" onClick={() => startWorkout(workout)}>
                <Play className="w-4 h-4 mr-2" />
                Start Workout
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
