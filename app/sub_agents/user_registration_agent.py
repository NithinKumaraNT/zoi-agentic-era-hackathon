"""User registration agent for user registration."""

import os
import google.auth
from google.adk.agents import Agent
from toolbox_core import ToolboxClient, auth_methods, ToolboxSyncClient

_, project_id = google.auth.default()
os.environ.setdefault("GOOGLE_CLOUD_PROJECT", project_id)
os.environ.setdefault("GOOGLE_CLOUD_LOCATION", "global")
os.environ.setdefault("GOOGLE_GENAI_USE_VERTEXAI", "True")

def get_tools():
    URL = "https://toolbox-4wmotx3yxa-ey.a.run.app"
    toolbox_client = ToolboxSyncClient(URL)
    return toolbox_client.load_toolset("health-assistant-toolset")

# Create the user registration agent
user_registration_agent = Agent(
    name="user_registration_agent",
    model="gemini-2.5-flash",
    instruction="""You are a helpful assistant that can register a new user.
    Make sure to check if the user is already registered before registering a new user.
    You can use the following tools to register a new user:
    - list_distinct_users
    - register_user""",
    tools=get_tools(),
)