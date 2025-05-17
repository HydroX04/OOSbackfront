from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth

app = FastAPI()

# CORS settings - allow frontend on localhost:3000
origins = [
    "http://localhost:3000", # frontend URL
    "http://127.0.0.1:3000"  # backend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # Change to ["*"] to allow all origins (not recommended for production)
    allow_credentials=True,
    allow_methods=["*"],            # Allow all HTTP methods
    allow_headers=["*"],            # Allow all headers
)

@app.get("/")
def read_root():
    return {"message": "Auth Service is working!"}

# Register the auth router
app.include_router(auth.router)
