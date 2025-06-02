from fastapi import APIRouter, HTTPException, Depends, status, Query, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from database import get_db_connection
import smtplib
from email.message import EmailMessage
import uuid
from fastapi import BackgroundTasks
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

class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    reset_link: str

# --- Email sending helper ---
def send_reset_email(email_to: str, reset_link: str):
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
    SMTP_USERNAME = os.getenv("SMTP_USERNAME", "markregiemagtangob29@gmail.com")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "fiar dxwn amfr kkrp")
    EMAIL_FROM = os.getenv("EMAIL_FROM", "markregiemagtangob29@gmail.com")

    msg = EmailMessage()
    msg['Subject'] = "Password Reset Request"
    msg['From'] = EMAIL_FROM
    msg['To'] = email_to
    msg.set_content(f"Please click the following link to reset your password:\n\n{reset_link}\n\nIf you did not request this, please ignore this email.")

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
    except Exception as e:
        print(f"Error sending email: {e}")



# --- New forgot password route with token ---
@router.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, background_tasks: BackgroundTasks):
    MAX_REQUESTS_PER_HOUR = 5
    COOLDOWN_MINUTES = 10
    TOKEN_EXPIRATION_MINUTES = 15

    conn = await get_db_connection()
    cursor = await conn.cursor()

    await cursor.execute("SELECT * FROM users WHERE email = ?", (request.email,))
    user = await cursor.fetchone()

    if not user:
        await conn.close()
        raise HTTPException(status_code=404, detail="Email not found")

    # Check recent password reset requests count in the last hour
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)
    await cursor.execute(
        "SELECT COUNT(*) FROM password_reset_tokens WHERE email = ? AND expires_at > ?",
        (request.email, one_hour_ago.strftime("%Y-%m-%d %H:%M:%S"))
    )
    (request_count,) = await cursor.fetchone()

    if request_count >= MAX_REQUESTS_PER_HOUR:
        await conn.close()
        raise HTTPException(status_code=429, detail="Too many password reset requests. Please try again later.")

    # Check cooldown timer - last request time
    await cursor.execute(
        "SELECT expires_at FROM password_reset_tokens WHERE email = ? ORDER BY expires_at DESC LIMIT 1",
        (request.email,)
    )
    last_token_row = await cursor.fetchone()
    if last_token_row:
        last_expires_at_str = last_token_row[0]
        last_expires_at = datetime.strptime(last_expires_at_str, "%Y-%m-%d %H:%M:%S")
        cooldown_end = last_expires_at - timedelta(minutes=TOKEN_EXPIRATION_MINUTES - COOLDOWN_MINUTES)
        if datetime.utcnow() < cooldown_end:
            await conn.close()
            raise HTTPException(status_code=429, detail=f"Please wait before requesting another password reset.")

    # Invalidate previous tokens for this email
    await cursor.execute(
        "DELETE FROM password_reset_tokens WHERE email = ?",
        (request.email,)
    )

    # Generate a unique token for password reset
    reset_token = str(uuid.uuid4())

    # Store the token and its expiration in the database
    expires_at = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRATION_MINUTES)
    await cursor.execute(
        "INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (?, ?, ?)",
        (request.email, reset_token, expires_at.strftime("%Y-%m-%d %H:%M:%S"))
    )
    await conn.commit()

    # Construct reset link with token and email
    reset_link_with_token = f"{request.reset_link}?token={reset_token}&email={request.email}"

    # Send reset email in background with tokenized link
    background_tasks.add_task(send_reset_email, request.email, reset_link_with_token)

    await conn.close()
    return {"message": "Password reset email sent with token"}


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
    BASE_LOCKOUT_DURATION = timedelta(minutes=15)

    conn = await get_db_connection()
    cursor = await conn.cursor()

    # Check lockout status
    await cursor.execute("SELECT failed_attempts, last_failed_at FROM login_attempts WHERE username = ?", (form_data.username,))
    attempt_row = await cursor.fetchone()

    if attempt_row:
        failed_attempts, last_failed_at = attempt_row
        if last_failed_at:
            if isinstance(last_failed_at, str):
                last_failed_at_dt = datetime.strptime(last_failed_at, "%Y-%m-%d %H:%M:%S")
            else:
                last_failed_at_dt = last_failed_at
            # Calculate how many times the threshold has been crossed
            lockout_multiplier = (failed_attempts // LOCKOUT_THRESHOLD)
            lockout_duration = BASE_LOCKOUT_DURATION * lockout_multiplier
            time_since_last_fail = datetime.utcnow() - last_failed_at_dt
            if failed_attempts >= LOCKOUT_THRESHOLD and time_since_last_fail < lockout_duration:
                await conn.close()
                raise HTTPException(status_code=403, detail=f"Account locked due to too many failed login attempts. Please try again after {lockout_duration}.")
            elif failed_attempts >= LOCKOUT_THRESHOLD and time_since_last_fail >= lockout_duration:
                # Lockout duration expired, reset failed attempts
                await cursor.execute("UPDATE login_attempts SET failed_attempts = 0, last_failed_at = NULL WHERE username = ?", (form_data.username,))
                await conn.commit()
                failed_attempts = 0

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
    BASE_LOCKOUT_DURATION = timedelta(minutes=15)

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
            lockout_multiplier = (failed_attempts // LOCKOUT_THRESHOLD)
            lockout_duration = BASE_LOCKOUT_DURATION * lockout_multiplier
            if failed_attempts >= LOCKOUT_THRESHOLD and time_since_last_fail < lockout_duration:
                remaining = lockout_duration - time_since_last_fail
                return {"locked": True, "remaining_seconds": int(remaining.total_seconds()), "failed_attempts": failed_attempts}
    await conn.close()
    return {"locked": False, "remaining_seconds": 0, "failed_attempts": 0}

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
