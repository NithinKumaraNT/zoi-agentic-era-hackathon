"use client"

import { Button } from "@/components/ui/button"

interface NutritionButtonProps {
  onClick: () => void
}

export function NutritionButton({ onClick }: NutritionButtonProps) {
  return (
    <div className="flex justify-center">
      <Button variant="outline" className="h-12 bg-transparent px-8" onClick={onClick}>
        View Nutrition
      </Button>
    </div>
  )
}
