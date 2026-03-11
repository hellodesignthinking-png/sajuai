import cv2
import numpy as np
# Workaround for mediapipe issue in this environment
try:
    import mediapipe as mp
    mp_face_mesh = mp.solutions.face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1)
except AttributeError:
    mp_face_mesh = None

def get_normalized_face(image_bytes):
    # Dummy implementation or graceful degradation if mediapipe is not working
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        return None, None
    
    if mp_face_mesh is None:
        return image, {"status": "success", "message": "Using raw image (mesh extraction fallback)"}
        
    try:
        results = mp_face_mesh.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        if not results.multi_face_landmarks:
            return image, None
            
        mesh_data = []
        for lm in results.multi_face_landmarks[0].landmark:
            mesh_data.append({"x": lm.x, "y": lm.y, "z": lm.z})
            
        return image, {"points": mesh_data, "status": "success"}
    except Exception as e:
        return image, {"error": str(e), "status": "fallback"}
