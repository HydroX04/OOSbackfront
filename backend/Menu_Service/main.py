from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import menu  # Ensure routes/__init__.py exists

app = FastAPI(
    title="OOS Menu Service",
    description="Menu Service of OOS with token-based authentication.",
    version="1.0.0"
)

# CORS configuration
origins = [
    # DO NOT TOUCH THIS PLS
    "http://127.0.0.1:4002", # ums frontend
    "http://localhost:4002",  # ums frontend
    "http://localhost:3001",      #OOS frontend
    "http://127.0.0.1:3001",      #OOS frontend (localhost IP)
    "http://localhost:8001",      # IMS Product Service
    "http://127.0.0.1:8001",
    "http://127.0.0.1:4000",  # auth service
    "http://localhost:4000",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register menu router
app.include_router(menu.router, prefix="/menu", tags=["menu"])

@app.get("/")
def root():
    return {"message": "Menu Service is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", port=7002, host="127.0.0.1", reload=True)
