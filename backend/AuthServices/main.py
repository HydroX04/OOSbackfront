from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import os

# routers
from routers import users
from routers import auth

app = FastAPI(title="Retail Auth API")

# include routers
app.include_router(auth.router, prefix='/auth', tags=['auth'])
app.include_router(users.router, prefix='/users', tags=['users'])


# CORS setup to allow frontend and backend 
app.add_middleware(
    CORSMiddleware,
    allow_origins=[

        "http://localhost:4002", # AUTH FRONTEND
        "http://127.0.0.1:4002", # AUTH FRONTEND (localhost IP)
        "http://localhost:4000", "http://127.0.0.1:4000", # Auth Service 

        "http://localhost:3001", # OOS frontend
        "http://127.0.0.1:3001", # OOS frontend (localhost IP)
        "http://192.168.100.10:3001",  # For network testing local 
        
        # Microservices - both localhost and 127.0.0.1 for reliability
        "http://localhost:7001", "http://127.0.0.1:7001",  # Delivery Service
        "http://localhost:7002", "http://127.0.0.1:7002",  # Menu Service
        "http://localhost:7003", "http://127.0.0.1:7003",  # Notification Service
        "http://localhost:7004", "http://127.0.0.1:7004",  # Ordering Service
        "http://localhost:7005", "http://127.0.0.1:7005",  # Payment Service
        "http://localhost:7006", "http://127.0.0.1:7006",  # User Service 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# run app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", port=4000, host="127.0.0.1", reload=True)
