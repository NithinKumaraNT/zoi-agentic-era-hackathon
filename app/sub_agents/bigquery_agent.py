"""BigQuery agent for data analysis and querying."""

import os
import google.auth
from google.adk.agents import Agent
from toolbox_core import ToolboxClient, auth_methods, ToolboxSyncClient

_, project_id = google.auth.default()
os.environ.setdefault("GOOGLE_CLOUD_PROJECT", project_id)
os.environ.setdefault("GOOGLE_CLOUD_LOCATION", "global")
os.environ.setdefault("GOOGLE_GENAI_USE_VERTEXAI", "True")

# Replace with the Cloud Run service URL generated in the previous step.
URL = "https://toolbox-4wmotx3yxa-ey.a.run.app"

toolbox_client = ToolboxSyncClient(URL)

def get_tools():
    return toolbox_client.load_toolset("health-assistant-toolset")

bigquery_agent = Agent(
    name="bigquery_agent",
    model="gemini-2.5-flash",
    instruction="""You are a helpful assistant that can answer questions about data. 
    You can use the following tools to get information:
    - list_distinct_users
    - get_fitness_data_for_user""",
    tools=get_tools(),
)
