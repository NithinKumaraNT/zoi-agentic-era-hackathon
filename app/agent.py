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

"""Root agent for the wellness coach assistant with specialized sub-agents."""

import os
import google.auth
from google.adk.agents import Agent
import time
from typing import Optional
from google.adk.tools.tool_context import ToolContext
from app.sub_agents.bigquery_agent import bigquery_agent
from app.sub_agents.fitness_planning_agent import fitness_planning_agent
from app.sub_agents.video_generation_agent import video_generation_agent
from app.sub_agents.user_registration_agent import user_registration_agent
from google import genai
from google.genai import types
from google.cloud import storage

_, project_id = google.auth.default()
os.environ.setdefault("GOOGLE_CLOUD_PROJECT", project_id)
os.environ.setdefault("GOOGLE_CLOUD_LOCATION", "global")
os.environ.setdefault("GOOGLE_GENAI_USE_VERTEXAI", "True")


# Create the root agent with specialized subagents
gym_assistant = Agent(
    name="gym_assistant",
    model="gemini-2.5-flash",
    instruction="""You are a helpful AI wellness coach assistant with specialized capabilities. You can help with general wellness questions and delegate tasks to specialized agents.

When users ask about:
- Creating training plans, fitness coaching, exercise recommendations, health data analysis, weekly workout schedules, personalized fitness programs
→ Delegate to the fitness_planning_agent

When users ask about:
- Creating videos, video generation, visual content, Veo videos, generating clips, making videos from text
→ Delegate to the video_generation_agent

DELEGATION EXAMPLES:
- "I'll connect you with our expert fitness planning agent who can create a personalized training plan for you."
- "I'll connect you with our video generation specialist who can create amazing videos using Veo 3 technology."

IMPORTANT: If the user asks about data, you can use the bigquery_agent only to get information.

For other general wellness questions, you can handle them directly with your knowledge.""",
    tools=[],
    sub_agents=[fitness_planning_agent, video_generation_agent, bigquery_agent, user_registration_agent],
)

root_agent = gym_assistant