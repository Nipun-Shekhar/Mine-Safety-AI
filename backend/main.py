"""
Mine Agent - Backend API
FastAPI application serving analytics, incidents, AI chat, and ML predictions.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import incidents, analytics, chat, ml_routes

app = FastAPI(
    title="Mine Agent API",
    description="AI-Driven Accident Intelligence & Safety Dashboard for Indian Mining",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(incidents.router, prefix="/api/incidents", tags=["Incidents"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(chat.router, prefix="/api/chat", tags=["AI Chat"])
app.include_router(ml_routes.router, prefix="/api/ml", tags=["ML"])

@app.get("/")
def root():
    return {"message": "Mine Agent API v2.0", "docs": "/docs"}
