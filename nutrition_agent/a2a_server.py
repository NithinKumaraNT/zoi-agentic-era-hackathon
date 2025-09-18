#!/usr/bin/env python3
"""A2A Server for Nutrition Agent."""

import asyncio
import os
import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from nutrition_agent.agent import root_agent


class NutritionA2AServer:
    """A2A Server for the nutrition agent."""
    
    def __init__(self, port: int = 8080):
        self.port = port
        self.app = FastAPI()
        self.session_service = InMemorySessionService()
        self.runner = Runner(
            agent=root_agent,
            app_name="nutrition_agent",
            session_service=self.session_service
        )
        self._setup_routes()
    
    def _setup_routes(self):
        """Setup A2A protocol routes."""
        
        # Agent discovery endpoint
        @self.app.get("/.well-known/agent.json")
        async def get_agent_card():
            return {
                "name": "Nutrition Agent",
                "displayName": "Nutrition Agent",
                "description": "Expert nutrition agent that creates personalized diet plans based on user data",
                "version": "1.0.0",
                "endpointUrl": f"http://localhost:{self.port}",
                "authentication": {"type": "none"},
                "capabilities": ["streaming"],
                "skills": [
                    {
                        "name": "createDietPlan",
                        "description": "Create personalized diet plan based on user email and BigQuery data",
                        "inputs": [
                            {
                                "name": "email",
                                "type": "string",
                                "description": "User email to fetch data from BigQuery"
                            }
                        ],
                        "outputs": [
                            {
                                "name": "diet_plan",
                                "type": "object",
                                "description": "Personalized diet plan with meals and nutrition info"
                            }
                        ]
                    }
                ]
            }
        
        # A2A task endpoint
        @self.app.post("/tasks/send")
        async def send_task(request: dict):
            """Handle A2A task requests."""
            try:
                # Extract message from A2A request
                message_text = request.get("params", {}).get("message", {}).get("parts", [{}])[0].get("text", "")
                
                # Create session
                session = await self.session_service.create_session(
                    app_name="nutrition_agent",
                    user_id="a2a_user"
                )
                
                # Run agent
                from google.genai import types as genai_types
                response_text = ""
                async for event in self.runner.run_async(
                    user_id="a2a_user",
                    session_id=session.id,
                    new_message=genai_types.Content(
                        role="user",
                        parts=[genai_types.Part.from_text(text=message_text)]
                    ),
                ):
                    if event.is_final_response() and event.content and event.content.parts:
                        response_text = event.content.parts[0].text
                        break
                
                return {
                    "jsonrpc": "2.0",
                    "result": {
                        "taskId": request.get("params", {}).get("taskId", "unknown"),
                        "state": "completed",
                        "messages": [
                            {
                                "role": "agent",
                                "parts": [{"text": response_text}]
                            }
                        ]
                    }
                }
                
            except Exception as e:
                return {
                    "jsonrpc": "2.0",
                    "error": {
                        "code": -1,
                        "message": f"Task failed: {str(e)}"
                    }
                }
    
    async def start(self):
        """Start the A2A server."""
        config = uvicorn.Config(
            app=self.app,
            host="0.0.0.0",
            port=self.port,
            log_level="info"
        )
        server = uvicorn.Server(config)
        print(f"🍎 Nutrition A2A Agent starting on port {self.port}")
        await server.serve()


if __name__ == "__main__":
    server = NutritionA2AServer()
    asyncio.run(server.start())