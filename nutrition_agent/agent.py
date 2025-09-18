import os
import google.auth
from google.adk.agents import Agent
from nutrition_agent.sub_agents.diet_planner_agent import diet_planner_agent
from nutrition_agent.sub_agents.diet_image_agent import diet_image_agent

_, project_id = google.auth.default()
os.environ.setdefault("GOOGLE_CLOUD_PROJECT", project_id)
os.environ.setdefault("GOOGLE_CLOUD_LOCATION", "global")
os.environ.setdefault("GOOGLE_GENAI_USE_VERTEXAI", "True")


# Create the nutrition root agent with sub-agents
root_agent = Agent(
    name="nutrition_agent",
    model="gemini-2.5-flash",
    instruction="""You are a nutrition coordinator that delegates diet planning tasks to specialized sub-agents.

When users ask about:
- Diet plans, nutrition advice, meal planning → Delegate to diet_planner_agent
- Diet plan images, meal visuals, nutrition infographics → Delegate to diet_image_agent

For general nutrition questions, you can handle them directly.""",
    description="Nutrition coordinator agent that delegates to specialized diet planning and visualization sub-agents.",
    tools=[],
    sub_agents=[diet_planner_agent, diet_image_agent],
)