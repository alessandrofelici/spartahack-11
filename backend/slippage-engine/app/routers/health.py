# backend/slippage-engine/app/routers/health.py

from fastapi import APIRouter, Depends
from typing import Dict, Any

router = APIRouter()

# Dummy dependency - in a real app, this could check DB connections etc.
async def get_health_status():
    return {"status": "healthy"}

@router.get("/", summary="Health Check")
async def health_check(health_data: Dict[str, Any] = Depends(get_health_status)):
    """
    Checks the health of the Slippage Engine service.
    Returns a confirmation if the service is running.
    """
    return health_data