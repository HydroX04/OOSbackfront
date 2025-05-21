from fastapi import APIRouter, HTTPException, Depends, status, Query
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from database import get_db_connection

load_dotenv()
router = APIRouter()

# --- JWT config ---
SECRET_KEY = os.getenv("SECRET_KEY", "GVd3U5v4hz7dHLXYtZGZYu6D4P2jQm6UjK9hFCt3ErA=")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# --- Password hashing ---
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain, hashed)

# --- Request and response models ---
class UserCreate(BaseModel):
    username: str
    password: str
    first_name: str = None
    last_name: str = None
    middle_name: str = None
    phone: str
    email: str


class ResetPasswordRequest(BaseModel):
    email: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class PasswordResetRequest(BaseModel):
    email: EmailStr
    new_password: str

# --- Register route ---
@router.post("/register")
async def register(user: UserCreate):
    conn = await get_db_connection()
    cursor = await conn.cursor()

    await cursor.execute("SELECT * FROM users WHERE username = ?", (user.username,))
    existing_user = await cursor.fetchone()
    if existing_user:
        await conn.close()
        raise HTTPException(status_code=400, detail="Username already exists")
        

    hashed_pw = hash_password(user.password)
    await cursor.execute(
        "INSERT INTO users (username, password, first_name, last_name, middle_name, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (user.username, hashed_pw, user.first_name, user.last_name, user.middle_name, user.phone, user.email)
    )
    await conn.commit()
    await conn.close()
    return {"message": "User registered successfully"}

# --- Login route ---
@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    LOCKOUT_THRESHOLD = 5
    LOCKOUT_DURATION = timedelta(minutes=15)

    conn = await get_db_connection()
    cursor = await conn.cursor()

    # Check lockout status
    await cursor.execute("SELECT failed_attempts, last_failed_at FROM login_attempts WHERE username = ?", (form_data.username,))
    attempt_row = await cursor.fetchone()

    if attempt_row:
        failed_attempts, last_failed_at = attempt_row
        if last_failed_at:
            # Fix: last_failed_at may already be datetime, so check type before parsing
            if isinstance(last_failed_at, str):
                last_failed_at_dt = datetime.strptime(last_failed_at, "%Y-%m-%d %H:%M:%S")
            else:
                last_failed_at_dt = last_failed_at
            if failed_attempts >= LOCKOUT_THRESHOLD and datetime.utcnow() - last_failed_at_dt < LOCKOUT_DURATION:
                await conn.close()
                raise HTTPException(status_code=403, detail="Account locked due to too many failed login attempts. Please try again later.")

    await cursor.execute("SELECT * FROM users WHERE username = ?", (form_data.username,))
    row = await cursor.fetchone()

    if not row:
        # Update failed attempts
        if attempt_row:
            new_failed_attempts = failed_attempts + 1
            await cursor.execute("UPDATE login_attempts SET failed_attempts = ?, last_failed_at = ? WHERE username = ?", (new_failed_attempts, datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"), form_data.username))
        else:
            await cursor.execute("INSERT INTO login_attempts (username, failed_attempts, last_failed_at) VALUES (?, ?, ?)", (form_data.username, 1, datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")))
        await conn.commit()
        await conn.close()
        raise HTTPException(status_code=401, detail="Invalid credentials")

    db_username = row[1]
    db_password = row[2]

    if not verify_password(form_data.password, db_password):
        # Update failed attempts
        if attempt_row:
            new_failed_attempts = failed_attempts + 1
            await cursor.execute("UPDATE login_attempts SET failed_attempts = ?, last_failed_at = ? WHERE username = ?", (new_failed_attempts, datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"), form_data.username))
        else:
            await cursor.execute("INSERT INTO login_attempts (username, failed_attempts, last_failed_at) VALUES (?, ?, ?)", (form_data.username, 1, datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")))
        await conn.commit()
        await conn.close()
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Reset failed attempts on successful login
    if attempt_row:
        # Instead of deleting, reset failed_attempts to max (5)
        await cursor.execute("UPDATE login_attempts SET failed_attempts = 0, last_failed_at = NULL WHERE username = ?", (form_data.username,))
        await conn.commit()

    payload = {
        "sub": db_username,
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    await conn.close()
    return {"access_token": token, "token_type": "bearer"}

# --- New endpoint to get lockout status ---
@router.get("/lockout-status")
async def get_lockout_status(username: str = Query(...)):
    LOCKOUT_THRESHOLD = 5
    LOCKOUT_DURATION = timedelta(minutes=15)

    conn = await get_db_connection()
    cursor = await conn.cursor()

    await cursor.execute("SELECT failed_attempts, last_failed_at FROM login_attempts WHERE username = ?", (username,))
    attempt_row = await cursor.fetchone()

    if attempt_row:
        failed_attempts, last_failed_at = attempt_row
        if last_failed_at:
            if isinstance(last_failed_at, str):
                last_failed_at_dt = datetime.strptime(last_failed_at, "%Y-%m-%d %H:%M:%S")
            else:
                last_failed_at_dt = last_failed_at
            time_since_last_fail = datetime.utcnow() - last_failed_at_dt
            if failed_attempts >= LOCKOUT_THRESHOLD and time_since_last_fail < LOCKOUT_DURATION:
                remaining = LOCKOUT_DURATION - time_since_last_fail
                return {"locked": True, "remaining_seconds": int(remaining.total_seconds())}
    await conn.close()
    return {"locked": False, "remaining_seconds": 0}

# --- Auth dependency ---
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    conn = await get_db_connection()
    cursor = await conn.cursor()
    await cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = await cursor.fetchone()
    await conn.close()

    if user is None:
        raise credentials_exception
    return user

# --- Protected route ---
@router.get("/me")
async def read_users_me(current_user: tuple = Depends(get_current_user)):
    return {"username": current_user[0]}

# --- Reset password route ---
@router.post("/auth/reset-password")
async def reset_password(data: PasswordResetRequest):
    conn = await get_db_connection()
    cursor = await conn.cursor()

    await cursor.execute("SELECT * FROM users WHERE email = ?", (data.email,))
    user = await cursor.fetchone()

    if not user:
        await conn.close()
        raise HTTPException(status_code=404, detail="Email not found")

    hashed_pw = hash_password(data.new_password)
    await cursor.execute("UPDATE users SET password = ? WHERE email = ?", (hashed_pw, data.email))
    await conn.commit()
    await conn.close()

    return {"message": "Password has been reset successfully"}

# --- Check username availability route ---
@router.get("/check-username")
async def check_username(username: str = Query(..., min_length=3, max_length=30)):
    conn = await get_db_connection()
    cursor = await conn.cursor()

    await cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = await cursor.fetchone()
    await conn.close()

    if user:
        return {"available": False}
    else:
        return {"available": True}
