"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Clock, Users, ChefHat, Target, Zap, Droplets } from "lucide-react"

interface Recipe {
  id: string
  name: string
  type: "breakfast" | "lunch" | "dinner" | "snack"
  prepTime: number
  servings: number
  calories: number
  protein: number
  carbs: number
  fat: number
  ingredients: string[]
  instructions: string[]
  tags: string[]
  aiReasoning: string
}

interface NutritionPlan {
  date: string
  totalCalories: number
  targetCalories: number
  protein: number
  carbs: number
  fat: number
  meals: Recipe[]
}

export function NutritionSystem({ onBack }: { onBack: () => void }) {
  const [currentView, setCurrentView] = useState<"overview" | "recipe">("overview")
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  // Mock AI-generated nutrition plan based on workout and recovery data
  const todaysPlan: NutritionPlan = {
    date: new Date().toLocaleDateString(),
    totalCalories: 1850,
    targetCalories: 2200,
    protein: 145,
    carbs: 180,
    fat: 65,
    meals: [
      {
        id: "1",
        name: "Power Protein Smoothie Bowl",
        type: "breakfast",
        prepTime: 10,
        servings: 1,
        calories: 420,
        protein: 32,
        carbs: 45,
        fat: 12,
        ingredients: [
          "1 scoop whey protein powder",
          "1 frozen banana",
          "1/2 cup blueberries",
          "1 tbsp almond butter",
          "1/2 cup almond milk",
          "1 tbsp chia seeds",
          "Granola for topping",
        ],
        instructions: [
          "Blend protein powder, banana, blueberries, almond butter, and almond milk until smooth",
          "Pour into bowl and top with chia seeds and granola",
          "Add fresh berries if desired",
        ],
        tags: ["High Protein", "Pre-Workout", "Quick"],
        aiReasoning:
          "High protein content supports muscle recovery after yesterday's strength training. Quick carbs provide energy for today's workout.",
      },
      {
        id: "2",
        name: "Mediterranean Quinoa Bowl",
        type: "lunch",
        prepTime: 25,
        servings: 1,
        calories: 520,
        protein: 28,
        carbs: 65,
        fat: 18,
        ingredients: [
          "3/4 cup cooked quinoa",
          "4 oz grilled chicken breast",
          "1/4 cup chickpeas",
          "1/4 cup cucumber, diced",
          "1/4 cup cherry tomatoes",
          "2 tbsp feta cheese",
          "1 tbsp olive oil",
          "1 tbsp lemon juice",
          "Fresh herbs (parsley, mint)",
        ],
        instructions: [
          "Cook quinoa according to package directions",
          "Grill chicken breast and slice",
          "Combine quinoa, chickpeas, cucumber, and tomatoes in bowl",
          "Top with chicken and feta cheese",
          "Drizzle with olive oil and lemon juice",
          "Garnish with fresh herbs",
        ],
        tags: ["Balanced", "Mediterranean", "Post-Workout"],
        aiReasoning:
          "Balanced macros perfect for post-workout recovery. Complex carbs replenish glycogen while protein aids muscle repair.",
      },
      {
        id: "3",
        name: "Salmon & Sweet Potato",
        type: "dinner",
        prepTime: 30,
        servings: 1,
        calories: 580,
        protein: 42,
        carbs: 35,
        fat: 28,
        ingredients: [
          "5 oz salmon fillet",
          "1 medium roasted sweet potato",
          "2 cups steamed broccoli",
          "1 tbsp olive oil",
          "1 tsp garlic powder",
          "Salt and pepper to taste",
          "Lemon wedge",
        ],
        instructions: [
          "Preheat oven to 400°F",
          "Season salmon with garlic powder, salt, and pepper",
          "Roast sweet potato for 25 minutes",
          "Pan-sear salmon for 4-5 minutes per side",
          "Steam broccoli until tender",
          "Serve with lemon wedge",
        ],
        tags: ["Omega-3", "Anti-inflammatory", "Recovery"],
        aiReasoning:
          "Omega-3 rich salmon reduces inflammation. Sweet potato provides sustained energy and aids glycogen replenishment.",
      },
      {
        id: "4",
        name: "Greek Yogurt Berry Parfait",
        type: "snack",
        prepTime: 5,
        servings: 1,
        calories: 280,
        protein: 20,
        carbs: 32,
        fat: 8,
        ingredients: [
          "1 cup Greek yogurt",
          "1/2 cup mixed berries",
          "2 tbsp honey",
          "1/4 cup granola",
          "1 tbsp chopped almonds",
        ],
        instructions: [
          "Layer half the yogurt in a glass",
          "Add half the berries and drizzle with honey",
          "Add remaining yogurt",
          "Top with remaining berries, granola, and almonds",
        ],
        tags: ["High Protein", "Antioxidants", "Quick"],
        aiReasoning:
          "Perfect pre-bed snack with casein protein for overnight muscle recovery. Antioxidants support recovery.",
      },
    ],
  }

  const getMacroPercentage = (current: number, total: number) => {
    return Math.round((current / total) * 100)
  }

  const getMealTypeIcon = (type: string) => {
    switch (type) {
      case "breakfast":
        return "🌅"
      case "lunch":
        return "☀️"
      case "dinner":
        return "🌙"
      case "snack":
        return "🍎"
      default:
        return "🍽️"
    }
  }

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case "breakfast":
        return "bg-orange-100 text-orange-700"
      case "lunch":
        return "bg-yellow-100 text-yellow-700"
      case "dinner":
        return "bg-blue-100 text-blue-700"
      case "snack":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  if (currentView === "recipe" && selectedRecipe) {
    return (
      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Recipe Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setCurrentView("overview")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{selectedRecipe.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getMealTypeColor(selectedRecipe.type)}>{selectedRecipe.type}</Badge>
              <span className="text-sm text-muted-foreground">{selectedRecipe.calories} cal</span>
            </div>
          </div>
        </div>

        {/* Recipe Info */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <div className="text-sm font-medium">{selectedRecipe.prepTime} min</div>
                <div className="text-xs text-muted-foreground">Prep time</div>
              </div>
              <div>
                <Users className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <div className="text-sm font-medium">{selectedRecipe.servings}</div>
                <div className="text-xs text-muted-foreground">Servings</div>
              </div>
              <div>
                <Target className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <div className="text-sm font-medium">{selectedRecipe.calories}</div>
                <div className="text-xs text-muted-foreground">Calories</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Macros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nutrition Facts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-primary">{selectedRecipe.protein}g</div>
                <div className="text-xs text-muted-foreground">Protein</div>
              </div>
              <div>
                <div className="text-lg font-bold text-secondary">{selectedRecipe.carbs}g</div>
                <div className="text-xs text-muted-foreground">Carbs</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-500">{selectedRecipe.fat}g</div>
                <div className="text-xs text-muted-foreground">Fat</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Insight */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <ChefHat className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Nutrition Insight</h3>
                <p className="text-xs text-muted-foreground mt-1">{selectedRecipe.aiReasoning}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {selectedRecipe.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {selectedRecipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  {ingredient}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {selectedRecipe.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-3 text-sm">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="pt-0.5">{instruction}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
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
          <h2 className="text-xl font-bold">Nutrition Plan</h2>
          <p className="text-sm text-muted-foreground">AI-optimized for your workout</p>
        </div>
      </div>

      {/* Daily Overview */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Today's Targets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Calories</span>
              <span>
                {todaysPlan.totalCalories} / {todaysPlan.targetCalories}
              </span>
            </div>
            <Progress value={getMacroPercentage(todaysPlan.totalCalories, todaysPlan.targetCalories)} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-primary">{todaysPlan.protein}g</div>
              <div className="text-xs text-muted-foreground">Protein</div>
            </div>
            <div>
              <div className="text-lg font-bold text-secondary">{todaysPlan.carbs}g</div>
              <div className="text-xs text-muted-foreground">Carbs</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-500">{todaysPlan.fat}g</div>
              <div className="text-xs text-muted-foreground">Fat</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insight */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Nutrition Strategy</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Your meal plan is optimized for today's upper body workout. Higher protein supports muscle recovery,
                while strategic carb timing fuels your training.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meal Plan */}
      <div className="space-y-3">
        <h3 className="font-semibold">Today's Meals</h3>
        {todaysPlan.meals.map((meal) => (
          <Card
            key={meal.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              setSelectedRecipe(meal)
              setCurrentView("recipe")
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getMealTypeIcon(meal.type)}</span>
                    <Badge className={getMealTypeColor(meal.type)}>{meal.type}</Badge>
                  </div>
                  <h4 className="font-semibold">{meal.name}</h4>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {meal.prepTime} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {meal.calories} cal
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {meal.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{meal.protein}g</div>
                  <div className="text-xs text-muted-foreground">protein</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hydration Reminder */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Droplets className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="font-semibold text-sm text-blue-700">Hydration Goal</h3>
              <p className="text-xs text-blue-600">Aim for 2.5L of water today to support your workout and recovery</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
