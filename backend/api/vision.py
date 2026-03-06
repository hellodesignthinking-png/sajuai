from fastapi import APIRouter, UploadFile, File
from .vision_engine import VisionAnalyzer

router = APIRouter(prefix="/vision", tags=["vision"])
analyzer = VisionAnalyzer()

@router.post("/face/analyze")
async def analyze_face(file: UploadFile = File(...)):
    contents = await file.read()
    result = analyzer.analyze_face(contents)
    return result

@router.post("/palm/preprocess")
async def preprocess_palm(file: UploadFile = File(...)):
    contents = await file.read()
    result = analyzer.preprocess_palm(contents)
    return result
