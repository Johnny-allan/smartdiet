from fastapi import APIRouter

from app.analytics.router import router as dashboard_router
from app.assessment.router import router as assessment_router
from app.auth.router import router as auth_router
from app.clinical.router import goals_router, router as clinical_router
from app.core.health.router import router as health_router
from app.diary.router import router as diary_router
from app.etl.router import router as etl_router
from app.foods.router import router as foods_router
from app.nutrition_engine.router import router as nutrition_router
from app.patients.router import router as patients_router
from app.plans.router import router as plans_router
from app.recipes.router import router as recipes_router
from app.reports.router import router as reports_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["health"])
api_router.include_router(auth_router)
api_router.include_router(dashboard_router)
api_router.include_router(patients_router)
api_router.include_router(clinical_router)
api_router.include_router(goals_router)
api_router.include_router(assessment_router)
api_router.include_router(foods_router)
api_router.include_router(nutrition_router)
api_router.include_router(recipes_router)
api_router.include_router(plans_router)
api_router.include_router(diary_router)
api_router.include_router(reports_router)
api_router.include_router(etl_router)
