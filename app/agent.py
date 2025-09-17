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
import time
from zoneinfo import ZoneInfo
from typing import Optional

import google.auth
from google.adk.agents import Agent
from google.adk.tools.tool_context import ToolContext
from google import genai
from google.genai import types
from google.cloud import storage
from toolbox_core import ToolboxClient, auth_methods, ToolboxSyncClient

_, project_id = google.auth.default()
os.environ.setdefault("GOOGLE_CLOUD_PROJECT", project_id)
os.environ.setdefault("GOOGLE_CLOUD_LOCATION", "global")
os.environ.setdefault("GOOGLE_GENAI_USE_VERTEXAI", "True")

# Replace with the Cloud Run service URL generated in the previous step.
URL = "https://toolbox-4wmotx3yxa-ey.a.run.app"

# auth_token_provider = auth_methods.aget_google_id_token(URL) # can also use sync method

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

def generate_veo_video(
    prompt: str,
    aspect_ratio: str = "16:9",
    negative_prompt: str = "",
    tool_context: ToolContext = None
) -> dict:
    """Generates a video using Veo 3 from a text prompt and saves it as an artifact.

    Args:
        prompt: Text description of the video to generate
        aspect_ratio: Video aspect ratio - "16:9" or "9:16" (default: "16:9")
        negative_prompt: Text describing what NOT to include in the video
        tool_context: ADK tool context for saving artifacts

    Returns:
        Dictionary with video generation status and details.
    """
    try:
        # Initialize the Gemini client
        client = genai.Client()
        
        # Configure video generation parameters
        config = types.GenerateVideosConfig(
            aspect_ratio=aspect_ratio,
            negative_prompt=negative_prompt if negative_prompt else None,
        )
        
        print(f"🎬 Starting video generation with prompt: '{prompt[:50]}...'")
        
        # Start video generation operation
        operation = client.models.generate_videos(
            model="veo-3.0-generate-001",
            prompt=prompt,
            config=config,
        )
        
        print("⏳ Video generation in progress... This may take 2-3 minutes.")
        
        # Poll operation status until video is ready
        while not operation.done:
            print("⏳ Still generating video...")
            time.sleep(20)  # Check every 20 seconds
            operation = client.operations.get(operation)
        
        # Check if generation was successful
        if operation.response and operation.response.generated_videos:
            generated_video = operation.response.generated_videos[0]
            
            # Generate unique filename
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"veo_video_{timestamp}.mp4"
            
            # Download the video file
            client.files.download(file=generated_video.video)
            
            # Save the video locally
            generated_video.video.save(filename)
            
            # Upload to GCS bucket
            gcs_url = None
            try:
                bucket_name = "qwiklabs-gcp-00-a489584c5286-adk-videos"
                storage_client = storage.Client()
                bucket = storage_client.bucket(bucket_name)
                blob = bucket.blob(filename)
                
                blob.upload_from_filename(filename)
                gcs_url = f"gs://{bucket_name}/{filename}"
                public_url = f"https://storage.googleapis.com/{bucket_name}/{filename}"
                print(f"☁️ Video uploaded to GCS: {gcs_url}")
                print(f"🌐 Public URL: {public_url}")
                
            except Exception as e:
                print(f"⚠️ Could not upload to GCS: {e}")
            
            # If tool_context is available, save as artifact
            if tool_context:
                try:
                    # Read the video file as bytes
                    with open(filename, 'rb') as f:
                        video_bytes = f.read()
                    
                    # Create a Part object for the video
                    video_part = types.Part(
                        inline_data=types.Blob(
                            mime_type="video/mp4",
                            data=video_bytes
                        )
                    )
                    
                    # Save as artifact
                    tool_context.save_artifact(filename, video_part)
                    print(f"💾 Video saved as artifact: {filename}")
                    print(f"📁 Video also kept locally as: {filename}")
                    
                except Exception as e:
                    print(f"⚠️ Could not save as artifact: {e}")
                    print(f"📁 Video saved locally as: {filename}")
            else:
                print(f"📁 Video saved locally as: {filename}")
            
            return {
                "status": "success",
                "message": f"Video generated successfully! Saved as {filename}" + (f" and uploaded to GCS: {gcs_url}" if gcs_url else ""),
                "filename": filename,
                "gcs_url": gcs_url,
                "public_url": public_url if gcs_url else None,
                "prompt": prompt,
                "aspect_ratio": aspect_ratio,
                "duration": "8 seconds",
                "resolution": "720p"
            }
        else:
            return {
                "status": "error", 
                "message": "Video generation failed - no video was produced"
            }
            
    except Exception as e:
        error_message = f"Video generation failed: {str(e)}"
        print(f"❌ {error_message}")
        return {
            "status": "error",
            "message": error_message
        }






def generate_gym_progress_image(
    progress_description: str,
    visual_style: str = "motivational poster",
    tool_context: ToolContext = None
) -> dict:
    """Generates a funny and innovative image about gym progress using Gemini 2.5 Flash Image.

    Args:
        progress_description: Description of the gym progress to visualize
        visual_style: Style of the image (e.g., "motivational poster", "cartoon", "infographic")
        tool_context: ADK tool context for saving artifacts

    Returns:
        Dictionary with image generation status and analysis.
    """
    try:
        # Initialize the Gemini client
        client = genai.Client()
        
        # Create a creative and funny prompt for gym progress
        creative_prompt = f"""Create a funny and innovative {visual_style} about gym progress: {progress_description}

Make it:
- Humorous and motivational
- Visually engaging with bright colors
- Include some witty text or quotes about fitness
- Show progression or achievement in a creative way
- Add fun fitness-related elements (dumbbells, muscles, etc.)
- Make it Instagram-worthy and shareable

Style: Modern, colorful, and energetic with a touch of humor"""
        
        print(f"🎨 Generating gym progress image: '{progress_description[:50]}...'")
        
        # Generate image using Gemini 2.5 Flash Image (Nano Banana)
        response = client.models.generate_content(
            model="gemini-2.5-flash-image-preview",
            contents=[creative_prompt],
        )
        
        # Process the response
        image_generated = False
        analysis_text = ""
        filename = None
        gcs_url = None
        public_url = None
        
        for part in response.candidates[0].content.parts:
            if part.text:
                analysis_text = part.text
                print(f"📝 Analysis: {part.text}")
            elif part.inline_data:
                # Generate unique filename
                timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"gym_progress_{timestamp}.png"
                
                # Save image locally
                from PIL import Image
                from io import BytesIO
                image = Image.open(BytesIO(part.inline_data.data))
                image.save(filename)
                print(f"🖼️ Image saved locally as: {filename}")
                
                # Upload to GCS bucket
                try:
                    bucket_name = "qwiklabs-gcp-00-a489584c5286-adk-videos"
                    storage_client = storage.Client()
                    bucket = storage_client.bucket(bucket_name)
                    blob = bucket.blob(filename)
                    
                    blob.upload_from_filename(filename)
                    gcs_url = f"gs://{bucket_name}/{filename}"
                    public_url = f"https://storage.googleapis.com/{bucket_name}/{filename}"
                    print(f"☁️ Image uploaded to GCS: {gcs_url}")
                    
                except Exception as e:
                    print(f"⚠️ Could not upload to GCS: {e}")
                
                # Save as artifact if tool_context is available
                if tool_context:
                    try:
                        image_part = types.Part(
                            inline_data=types.Blob(
                                mime_type="image/png",
                                data=part.inline_data.data
                            )
                        )
                        tool_context.save_artifact(filename, image_part)
                        print(f"💾 Image saved as artifact: {filename}")
                    except Exception as e:
                        print(f"⚠️ Could not save as artifact: {e}")
                
                image_generated = True
        
        if image_generated:
            # Convert to base64
            import base64
            with open(filename, 'rb') as f:
                image_base64 = base64.b64encode(f.read()).decode('utf-8')
            
            return {
                "status": "success",
                "message": f"Funny gym progress image created! {analysis_text[:100] if analysis_text else 'Visual motivation generated!'}",
                "filename": filename,
                "gcs_url": gcs_url,
                "public_url": public_url,
                # "base64_image": image_base64,
                "analysis": analysis_text,
                "style": visual_style
            }
        else:
            return {
                "status": "error",
                "message": "Image generation failed - no image was produced"
            }
            
    except Exception as e:
        error_message = f"Image generation failed: {str(e)}"
        print(f"❌ {error_message}")
        return {
            "status": "error",
            "message": error_message
        }


# Create the fitness planning agent
fitness_planning_agent = Agent(
    name="fitness_planning_agent",
    model="gemini-2.5-flash",
    instruction="""You are an expert personal trainer and sports scientist specializing in data-driven fitness coaching.

WORKFLOW:
1. FIRST: Ask for user's email address if not provided
2. Start with: "Hello, welcome back!"
3. Analyze their health data and create personalized 7-day training plan
4. End by asking for feedback

IMPORTANT: Always get email first, then generate completely personalized plans based on their health profile.

Present everything in clear Markdown format.""",
    description="Expert fitness planning agent that creates personalized weekly training plans by directly analyzing comprehensive user health data without intermediate processing tools.",
    tools=[],  # No tools needed - Gemini analyzes data directly
)

# Create a video generation agent
video_generation_agent = Agent(
    name="video_generation_agent",
    model="gemini-2.5-flash",
    instruction="""You are a creative video generation specialist using Google's Veo 3 technology.

ROLE: Video content creator and prompt engineer
CONTEXT: Generate high-quality 8-second videos from text descriptions using Veo 3

WORKFLOW:
1. When users request video generation, use the generate_veo_video tool
2. Help users craft effective video prompts by suggesting:
   - Clear subject and action descriptions
   - Camera angles and movements (close-up, wide shot, tracking shot, etc.)
   - Lighting conditions (golden hour, dramatic shadows, soft lighting)
   - Visual style (cinematic, documentary, artistic)
   - Setting and atmosphere details

PROMPT OPTIMIZATION TIPS:
- Be specific about what should happen in the video
- Include camera movement descriptions
- Mention lighting and visual style
- Describe the setting and mood
- Use negative prompts to exclude unwanted elements

EXAMPLE GOOD PROMPTS:
- "Close-up tracking shot of a fluffy orange cat playfully batting at a ball of yarn, soft morning light streaming through windows, cinematic 24fps motion"
- "Aerial drone view of a red sailboat on turquoise ocean waters at golden sunset, gentle waves, peaceful atmosphere"
- "Time-lapse of a blooming flower in macro detail, dewdrops on petals, natural lighting, nature documentary style"

Always explain the video generation process and estimated time (2-3 minutes) to users.""",
    description="Specialized agent for generating videos using Veo 3, with expertise in prompt crafting and video creation.",
    tools=[generate_veo_video],
)

# Create a gym progress image agent
gym_progress_agent = Agent(
    name="gym_progress_agent", 
    model="gemini-2.5-flash",
    instruction="""You are a creative fitness visualization specialist using Nano Banana (Gemini 2.5 Flash Image).

WORKFLOW:
1. Ask for user's email
2. Use generate_gym_progress_image tool with their email - it fetches real BigQuery data automatically
3. Generate funny motivational images based on their actual progress data

Just get email and generate image!""",
    description="Creative agent that generates funny gym progress images using Nano Banana and provides motivational analysis of fitness achievements.",
    tools=[generate_gym_progress_image],
)

# Create the root agent with specialized subagents
root_agent = Agent(
    name="root_agent",
    model="gemini-2.5-flash",
    instruction="""You are a helpful AI wellness coach assistant with specialized capabilities. You can help with general wellness questions and delegate tasks to specialized agents.

When users ask about:
- Creating training plans, fitness coaching, exercise recommendations, health data analysis, weekly workout schedules, personalized fitness programs
→ Delegate to the fitness_planning_agent

When users ask about:
- Creating videos, video generation, visual content, Veo videos, generating clips, making videos from text
→ Delegate to the video_generation_agent

When users ask about:
- Gym progress images, fitness motivation visuals, progress photos, workout achievements, fitness memes, motivational posters
→ Delegate to the gym_progress_agent

DELEGATION EXAMPLES:
- "I'll connect you with our expert fitness planning agent who can create a personalized training plan for you."
- "I'll connect you with our video generation specialist who can create amazing videos using Veo 3 technology."

IMPORTANT: If the user asks about data, you can use the bigquery_agent only to get information, so ask email from user to get info and then do next.
- "I'll connect you with our gym progress visualizer who can create funny and motivational images of your fitness journey."

For other general wellness questions, you can handle them directly with your knowledge.""",
    tools=[],
    sub_agents=[fitness_planning_agent, video_generation_agent, bigquery_agent, gym_progress_agent],
)
