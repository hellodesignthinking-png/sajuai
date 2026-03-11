from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import os
import io
import base64
from google import genai
from google.genai import types

router = APIRouter(prefix="/generate-image", tags=["image"])

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "YOUR_ACTUAL_API_KEY_HERE")
client = genai.Client(api_key=GEMINI_API_KEY)

class ImageRequest(BaseModel):
    prompt: str
    faceImageBase64: Optional[str] = None
    faceMimeType: Optional[str] = "image/jpeg"

@router.post("")
async def generate_image(request: ImageRequest):
    try:
        # Generate an image using Imagen 3
        # Reference: https://github.com/google-gemini/cookbook/blob/main/quickstarts/Image_Generation.ipynb
        result = client.models.generate_images(
            model='imagen-4.0-fast-generate-001',
            prompt=request.prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                output_mime_type="image/jpeg",
                person_generation="allow_adult"
            )
        )
        
        # Get the first image generated
        generated_image = result.generated_images[0]
        
        # Build a response data structure
        img_byte_arr = io.BytesIO(generated_image.image.image_bytes)
        img_base64 = base64.b64encode(img_byte_arr.getvalue()).decode('utf-8')
        image_url = f"data:{generated_image.image.mime_type};base64,{img_base64}"
        
        return {"imageUrl": image_url}
        
    except Exception as e:
        # Fallback to a placeholder if the generation fails (e.g. if access to Imagen 3 is restricted)
        import random
        return {
            "imageUrl": f"https://picsum.photos/seed/{random.randint(1,1000)}/400/600",
            "message": f"이미지 생성 실패. 기본 이미지를 제공합니다. (Error: {str(e)})"
        }
