from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from api import auth, income, budget, expenses, investments, insights, bank_integration

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Budget Planner API",
    description="Production-quality financial management with AI insights",
    version="1.0.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth.router)
app.include_router(income.router)
app.include_router(budget.router)
app.include_router(expenses.router)
app.include_router(investments.router)
app.include_router(insights.router)
app.include_router(bank_integration.router)


@app.get("/")
def root():
    return {"message": "AI Budget Planner API is running", "docs": "/docs"}
