from fastapi import APIRouter

from app.api.routes import auth, data, integrations, multibagger, research, testing

api_router = APIRouter()
api_router.include_router(data.router)
api_router.include_router(research.router)
api_router.include_router(multibagger.router)
api_router.include_router(testing.router)
api_router.include_router(integrations.router)
api_router.include_router(auth.router)
