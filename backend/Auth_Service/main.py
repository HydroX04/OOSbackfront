from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth
from database import init_db

app = FastAPI(title="OOS Auth Service")

# CORS Origins: Frontend + Other Microservices
origins = [
    # Frontend
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://192.168.100.10:3001",  # For lnetwork testingocal 
    # Microservices - both localhost and 127.0.0.1 for reliability
    "http://localhost:7000", "http://127.0.0.1:7000",  # Auth Service
    "http://localhost:7001", "http://127.0.0.1:7001",  # Delivery Service
    "http://localhost:7002", "http://127.0.0.1:7002",  # Menu Service
    "http://localhost:7003", "http://127.0.0.1:7003",  # Notification Service
    "http://localhost:7004", "http://127.0.0.1:7004",  # Ordering Service
    "http://localhost:7005", "http://127.0.0.1:7005",  # Payment Service
    "http://localhost:7006", "http://127.0.0.1:7006",  # User Service
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB on startup
@app.on_event("startup")
async def on_startup():
    await init_db()

# Root route for testing
@app.get("/")
def read_root():
    return {"message": "Auth Service is working!"}

# Auth router
app.include_router(auth.router)

# Run the app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=7000, reload=True)
