import os
import google.auth
from google.adk.agents import Agent
from google.adk.tools.tool_context import ToolContext
from google import genai
from google.genai import types
from google.cloud import storage
import datetime

_, project_id = google.auth.default()
os.environ.setdefault("GOOGLE_CLOUD_PROJECT", project_id)
os.environ.setdefault("GOOGLE_CLOUD_LOCATION", "global")
os.environ.setdefault("GOOGLE_GENAI_USE_VERTEXAI", "True")


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