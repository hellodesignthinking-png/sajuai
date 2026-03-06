from backend.api.saju import router as saju_router
from backend.api.vision import router as vision_router
from backend.api.synergy import router as synergy_router
from backend.api.story import router as story_router
from backend.api.matching import router as matching_router

app = FastAPI(title="Fate-Sync API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(saju_router, prefix="/api")
app.include_router(vision_router, prefix="/api")
app.include_router(synergy_router, prefix="/api")
app.include_router(story_router, prefix="/api")
app.include_router(matching_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to Fate-Sync API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
