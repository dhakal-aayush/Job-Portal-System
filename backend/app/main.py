from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.middleware import setup_middleware

# =========================
# Import Routers
# =========================
from app.module.auth.router import router as auth_router
from app.module.users.router import router as users_router
from app.module.companies.router import router as companies_router
from app.module.jobs.router import router as jobs_router
from app.module.resumes.router import router as resumes_router
from app.module.applications.router import router as applications_router
from app.module.ai_engine.router import router as ai_router

# =========================
# Create FastAPI App
# =========================
app = FastAPI(
    title="Online Job Portal API",
    description="Job Portal Management System with AI Recommendation",
    version="1.0.0",
)

# =========================
# Middleware (single source of truth)
# =========================
setup_middleware(app)

# =========================
# Static files (resume downloads)
# =========================
app.mount("/uploads", StaticFiles(directory="app/uploads"), name="uploads")


# =========================
# Global Exception Handlers
# =========================
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=exc.headers,
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# =========================
# Root Endpoint
# =========================
@app.get("/")
def home():
    return {
        "message": "Welcome to Online Job Portal API",
        "version": "1.0.0",
    }


# =========================
# Include Routers
# =========================
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(companies_router)
app.include_router(jobs_router)
app.include_router(resumes_router)
app.include_router(applications_router)
app.include_router(ai_router)
