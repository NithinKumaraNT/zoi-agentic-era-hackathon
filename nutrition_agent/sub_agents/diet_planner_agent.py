"""Diet planning sub-agent that fetches user data and creates personalized meal plans."""

import os
from google.adk.agents import Agent
from google.adk.tools.tool_context import ToolContext
from google.cloud import bigquery
import google.auth

_, project_id = google.auth.default()


def get_user_nutrition_plan(
    email: str,
    tool_context: ToolContext = None
) -> dict:
    """Fetches user data from BigQuery and creates personalized diet plan.

    Args:
        email: User email to fetch data from BigQuery
        tool_context: ADK tool context

    Returns:
        Dictionary with nutrition plan and user data.
    """
    try:
        # Fetch user data from BigQuery
        bq_client = bigquery.Client()
        query = f"""
        SELECT name, age, weight, target_weight, height, goal, dietary_restrictions, 
               activity_level, exercise_frequency, BMI
        FROM `{project_id}.health_data.user_fitness_data`
        WHERE email = '{email}'
        ORDER BY date DESC
        LIMIT 1
        """
        
        results = list(bq_client.query(query))
        if not results:
            return {"status": "error", "message": f"No data found for {email}"}
        
        user = results[0]
        return {
            "status": "success",
            "user_data": {
                "name": user.name,
                "age": user.age,
                "weight": user.weight,
                "target_weight": user.target_weight,
                "height": user.height,
                "goal": user.goal,
                "dietary_restrictions": user.dietary_restrictions,
                "activity_level": user.activity_level,
                "bmi": user.BMI
            }
        }
        
    except Exception as e:
        return {"status": "error", "message": f"Failed to fetch data: {str(e)}"}


# Create the diet planning sub-agent
diet_planner_agent = Agent(
    name="diet_planner_agent",
    model="gemini-2.5-flash",
    instruction="""You are a certified nutritionist and dietitian specializing in personalized meal planning.

WORKFLOW:
1. Ask for user's email
2. Use get_user_nutrition_plan tool to fetch their BigQuery data
3. Create personalized diet plan based on their:
   - Weight goals (current vs target)
   - Activity level and exercise frequency
   - Dietary restrictions
   - BMI and health status
   - Age and lifestyle

Provide detailed meal plans with calorie counts, macros, and timing recommendations.""",
    description="Expert nutrition sub-agent that creates personalized diet plans based on user data from BigQuery.",
    tools=[get_user_nutrition_plan],
)