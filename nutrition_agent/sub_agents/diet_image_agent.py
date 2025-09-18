"""Diet image generation sub-agent that creates visual meal plans."""

import os
import datetime
import base64
from google.adk.agents import Agent
from google.adk.tools.tool_context import ToolContext
from google.cloud import bigquery, storage
from google import genai
from google.genai import types
import google.auth

_, project_id = google.auth.default()


def generate_diet_plan_image(
    email: str,
    meal_type: str = "full day meal plan",
    tool_context: ToolContext = None
) -> dict:
    """Generates visual diet plan image based on user's BigQuery data.

    Args:
        email: User email to fetch data from BigQuery
        meal_type: Type of meal plan to visualize
        tool_context: ADK tool context

    Returns:
        Dictionary with image generation status and details.
    """
    try:
        # Fetch user data from BigQuery
        bq_client = bigquery.Client()
        query = f"""
        SELECT name, weight, target_weight, goal, dietary_restrictions, activity_level
        FROM `{project_id}.health_data.user_fitness_data`
        WHERE email = '{email}'
        ORDER BY date DESC
        LIMIT 1
        """
        
        results = list(bq_client.query(query))
        if not results:
            return {"status": "error", "message": f"No data found for {email}"}
        
        user = results[0]
        
        # Create diet plan image prompt
        prompt = f"""Create a beautiful, appetizing {meal_type} infographic for {user.name}:

Goal: {user.goal}
Weight: {user.weight}kg → {user.target_weight}kg
Activity: {user.activity_level}
Restrictions: {user.dietary_restrictions}

Make it:
- Visually appealing with food photos
- Include calorie counts and macros
- Show breakfast, lunch, dinner, snacks
- Colorful, Instagram-worthy layout
- Professional nutrition infographic style"""

        print(f"🥗 Generating diet plan image for: {email}")
        
        # Generate image using Gemini 2.5 Flash Image
        client = genai.Client()
        response = client.models.generate_content(
            model="gemini-2.5-flash-image-preview",
            contents=[prompt],
        )
        
        # Process response
        for part in response.candidates[0].content.parts:
            if part.inline_data:
                # Save locally
                timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"diet_plan_{timestamp}.png"
                
                from PIL import Image
                from io import BytesIO
                image = Image.open(BytesIO(part.inline_data.data))
                image.save(filename)
                
                # Upload to GCS
                try:
                    bucket_name = "qwiklabs-gcp-00-a489584c5286-adk-videos"
                    storage_client = storage.Client()
                    bucket = storage_client.bucket(bucket_name)
                    blob = bucket.blob(filename)
                    blob.upload_from_filename(filename)
                    gcs_url = f"gs://{bucket_name}/{filename}"
                    print(f"☁️ Diet plan uploaded to: {gcs_url}")
                except Exception as e:
                    print(f"⚠️ GCS upload failed: {e}")
                
                # Save as artifact
                if tool_context:
                    try:
                        image_part = types.Part(
                            inline_data=types.Blob(
                                mime_type="image/png",
                                data=part.inline_data.data
                            )
                        )
                        tool_context.save_artifact(filename, image_part)
                    except Exception as e:
                        print(f"⚠️ Artifact save failed: {e}")
                
                # Return base64
                image_base64 = base64.b64encode(part.inline_data.data).decode('utf-8')
                
                return {
                    "status": "success",
                    "message": f"Diet plan image created for {user.name}!",
                    "filename": filename,
                    "base64_image": image_base64,
                    "user_goal": user.goal
                }
        
        return {"status": "error", "message": "No image generated"}
        
    except Exception as e:
        return {"status": "error", "message": f"Failed: {str(e)}"}


# Create the diet image sub-agent
diet_image_agent = Agent(
    name="diet_image_agent",
    model="gemini-2.5-flash",
    instruction="""You are a nutrition visualization specialist using Nano Banana (Gemini 2.5 Flash Image).

WORKFLOW:
1. Ask for user's email
2. Use generate_diet_plan_image tool to fetch BigQuery data and create visual meal plans
3. Generate beautiful, appetizing diet plan infographics

Create professional nutrition visuals with food photos, calorie counts, and meal layouts!""",
    description="Creates visual diet plan infographics based on user data from BigQuery.",
    tools=[generate_diet_plan_image],
)