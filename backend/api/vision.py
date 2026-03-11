import base64
from fastapi import APIRouter, UploadFile, File
from .vision_engine import VisionAnalyzer
from backend.logic.warping import get_normalized_face

router = APIRouter(prefix="/vision", tags=["vision"])
analyzer = VisionAnalyzer()

@router.post("/face/analyze")
async def analyze_face(file: UploadFile = File(...)):
    contents = await file.read()
    
    # 1. 3D Warping (V28 고도화: 사진 정규화 및 메시 추출)
    warped_img, mesh_data = get_normalized_face(contents)
    warped_base64 = None
    if warped_img is not None:
        import cv2
        _, buffer = cv2.imencode('.jpg', warped_img)
        warped_base64 = base64.b64encode(buffer).decode('utf-8')
    
    # 2. 기존 분석 수행
    result = analyzer.analyze_face(contents)
    
    # 3. 결과에 V28 데이터 추가
    if warped_base64:
        result["warped_image"] = f"data:image/jpeg;base64,{warped_base64}"
    if mesh_data:
        result["mesh_data"] = mesh_data
        
    return result

@router.post("/palm/preprocess")
async def preprocess_palm(file: UploadFile = File(...)):
    contents = await file.read()
    result = analyzer.preprocess_palm(contents)
    return result
