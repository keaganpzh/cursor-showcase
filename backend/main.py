from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from routes import browser

load_dotenv()

app = FastAPI(title="WebOS Browser Backend", version="1.0.0")

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(browser.router, prefix="/api/browser", tags=["browser"])

@app.get("/")
async def root():
    return {"message": "WebOS Browser Backend API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

