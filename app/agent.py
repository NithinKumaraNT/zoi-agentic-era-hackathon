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

import datetime
import os
from zoneinfo import ZoneInfo
from typing import Optional

import google.auth
from google.adk.agents import Agent
from toolbox_core import ToolboxClient, auth_methods, ToolboxSyncClient

# Replace with the Cloud Run service URL generated in the previous step.
URL = "https://toolbox-4wmotx3yxa-ey.a.run.app"

# Lazy initialization of toolbox client
_toolbox_client: Optional[ToolboxSyncClient] = None


def get_toolbox_client():
    """Get or create the toolbox client with lazy initialization."""
    global _toolbox_client
    if _toolbox_client is None:
        auth_token_provider = auth_methods.aget_google_id_token(URL)
        _toolbox_client = ToolboxSyncClient(
            URL,
            client_headers={"Authorization": auth_token_provider}
        )
    return _toolbox_client


def get_tools():
    """Get tools from the toolbox client with lazy initialization."""
    toolbox_client = get_toolbox_client()
    return toolbox_client.load_toolset("health-assistant-toolset")

_, project_id = google.auth.default()
os.environ.setdefault("GOOGLE_CLOUD_PROJECT", project_id)
os.environ.setdefault("GOOGLE_CLOUD_LOCATION", "global")
os.environ.setdefault("GOOGLE_GENAI_USE_VERTEXAI", "True")


def get_weather(query: str) -> str:
    """Simulates a web search. Use it get information on weather.

    Args:
        query: A string containing the location to get weather information for.

    Returns:
        A string with the simulated weather information for the queried location.
    """
    if "sf" in query.lower() or "san francisco" in query.lower():
        return "It's 60 degrees and foggy."
    return "It's 90 degrees and sunny."


def get_current_time(query: str) -> str:
    """Simulates getting the current time for a city.

    Args:
        city: The name of the city to get the current time for.

    Returns:
        A string with the current time information.
    """
    if "sf" in query.lower() or "san francisco" in query.lower():
        tz_identifier = "America/Los_Angeles"
    else:
        return f"Sorry, I don't have timezone information for query: {query}."

    tz = ZoneInfo(tz_identifier)
    now = datetime.datetime.now(tz)
    return f"The current time for query {query} is {now.strftime('%Y-%m-%d %H:%M:%S %Z%z')}"


root_agent = Agent(
        name="root_agent",
        model="gemini-2.5-flash",
        instruction="""
        You are a helpful AI assistant designed to provide accurate and useful information.
        You can use the following tools to get information:
        - list_distinct_users
        - get_fitness_data_for_user
        """,
        tools=get_tools(),
    )
