# backend/slippage-engine/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import slippage, health
from .config import settings # Load settings from config.py

# Initialize FastAPI app
app = FastAPI(
    title="MEV Weather Slippage Engine",
    description="API for calculating slippage recommendations based on MEV activity.",
    version="1.0.0",
)

# --------------------------------------------------
# CORS Middleware
# Allow requests from your frontend during development
# --------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# Include API routers
# --------------------------------------------------
app.include_router(slippage.router, prefix="/api/slippage")
app.include_router(health.router, prefix="/health")

# --------------------------------------------------
# Root endpoint (optional)
# --------------------------------------------------
@app.get("/")
async def read_root():
    return {
        "message": "Welcome to the MEV Weather Slippage Engine API!",
        "docs_url": "/docs" # Link to interactive API docs
    }

# --------------------------------------------------
# If running directly with uvicorn
# --------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.slippage_api_port)