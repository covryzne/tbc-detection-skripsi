from typing import *

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi_jwt_auth import AuthJWT
from fastapi_jwt_auth.exceptions import AuthJWTException

from src.api_router import router
from .database import database

# Define application
app = FastAPI(
    title="TB Detection App!",
    description="TB Detection App!",
    version="0.1",
)

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.exception_handler(AuthJWTException)
def authjwt_exception_handler(request: Request, exc: AuthJWTException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={"Access-Control-Allow-Origin": "*"}  # CORS tetap dikirim saat error
    ) 

@app.get("/")
def index():
    """Return a welcome message."""
    return {"message": "Welcome to TB Detection app!"}


@app.on_event("startup")
async def startup() -> None:
    """Connect to the database on startup."""

    await database.connect()


@app.on_event("shutdown")
async def shutdown() -> None:
    """Disconnect from the database on shutdown."""
    await database.disconnect()


@app.get("/healthcheck", include_in_schema=False)
async def healthcheck() -> Dict[str, str]:
    return {"status": "ok"}
