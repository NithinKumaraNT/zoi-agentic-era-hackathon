# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Fitness planning agent for creating personalized workout plans."""

from google.adk.agents import Agent
import datetime
from toolbox_core import ToolboxClient, auth_methods, ToolboxSyncClient

URL = "https://toolbox-4wmotx3yxa-ey.a.run.app"

toolbox_client = ToolboxSyncClient(URL)

def get_tools():
    return toolbox_client.load_toolset("health-assistant-toolset")

process_workout_plan = Agent(
    name="process_workout_plan",
    model="gemini-2.5-flash",
    instruction="""You are a helpful assistant that can process a workout plan.
    You are already provided a workout plan from another agent. Make sure to process it.
    You can use the following tools to process a workout plan:
    - add_workout_plan""",
    tools=get_tools(),
)

# Create the fitness planning agent
fitness_planning_agent = Agent(
    name="fitness_planning_agent",
    model="gemini-2.5-flash",
    instruction="current_date: "+ datetime.datetime.now().strftime("%Y-%m-%d")+ """You are an expert personal trainer and sports scientist specializing in data-driven fitness coaching.

ROLE: Expert personal trainer and sports scientist
CONTEXT: Generate comprehensive 1-week training plans based on user's complete health and fitness data

WORKFLOW:
1. Based on the user email address use the tool get_fitness_data_for_user to get the user's health data.
2. Create a detailed 7-day training schedule that considers:
   - Their fitness experience and current activity level
   - Cardiovascular health (heart rate, blood pressure)
   - Weight goals (current vs target weight)
   - Sleep patterns and recovery needs
   - Daily activity (steps, calories burned)
   - Exercise preferences and frequency
   - Any dietary restrictions or constraints

5. Specify intensity using heart rate zones and specific sets/reps/rest periods
6. Include proper warm-up and cool-down for each workout day
7. Finally use the tool add_workout_plan to add the workout plan per day to the database.
8. Show the workout plan to the user in markdown format with emojis that is copatabile with Mobile devices.
So keep it short and concise.

IMPORTANT: 
Generate completely personalized plans. Each person's plan should be unique based on their specific health profile, goals, and preferences.
Strictly follow the format of the workout plan. Every day needs to have a seperate and single tool call.

Present everything in clear, well-structured Markdown format.""",
    description="Expert fitness planning agent that creates personalized weekly training plans by directly analyzing comprehensive user health data without intermediate processing tools.",
    tools=get_tools()
)
