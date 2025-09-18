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

"""Video generation agent using Veo 3 technology."""

import datetime
import os
import time
from typing import Optional

import google.auth
from google.adk.tools.tool_context import ToolContext
from google import genai
from google.genai import types
from google.cloud import storage
from google.adk.agents import Agent

_, project_id = google.auth.default()
os.environ.setdefault("GOOGLE_CLOUD_PROJECT", project_id)
os.environ.setdefault("GOOGLE_CLOUD_LOCATION", "global")
os.environ.setdefault("GOOGLE_GENAI_USE_VERTEXAI", "True")

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
