from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from database import get_db_connection
import httpx
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:4000/auth/token")

async def validate_token_and_roles(token: str, allowed_roles: List[str]):
    USER_SERVICE_ME_URL = "http://localhost:4000/auth/users/me"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(USER_SERVICE_ME_URL, headers={"Authorization": f"Bearer {token}"})
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            error_detail = f"Auth service error: {e.response.status_code} - {e.response.text}"
            logger.error(error_detail)
            raise HTTPException(status_code=e.response.status_code, detail=error_detail)
        except httpx.RequestError as e:
            logger.error(f"Auth service unavailable: {e}")
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Auth service unavailable: {e}")

    user_data = response.json()
    if user_data.get("userRole") not in allowed_roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

# Pydantic models
class CartItem(BaseModel):
    username: str
    product_id: int
    product_name: str
    quantity: int
    price: float
    size: Optional[str] = None
    type: Optional[str] = None
    sugar_level: Optional[str] = None
    add_ons: Optional[str] = None  # You may convert this to List[str] if you use JSON
    order_type: str

class CartResponse(BaseModel):
    cart_id: int
    product_id: int
    product_name: str
    quantity: int
    price: float
    size: Optional[str]
    type: Optional[str]
    sugar_level: Optional[str]
    add_ons: Optional[str]
    order_type: str
    status: str
    created_at: str

# GET: Retrieve user's cart
@router.get("/{username}", response_model=List[CartResponse])
async def get_cart(username: str, token: str = Depends(oauth2_scheme)):
    await validate_token_and_roles(token, ["user", "admin", "staff"])
    conn = await get_db_connection()
    cursor = await conn.cursor()
    await cursor.execute("""
        SELECT CartID, ProductID, ProductName, Quantity, Price, Size, Type, SugarLevel, AddOns, OrderType, Status, CreatedAt
        FROM Cart
        WHERE Username = ? AND Status = 'in_cart'
    """, (username,))
    rows = await cursor.fetchall()
    await cursor.close()
    await conn.close()

    cart = []
    for row in rows:
        cart.append(CartResponse(
            cart_id=row[0],
            product_id=row[1],
            product_name=row[2],
            quantity=row[3],
            price=row[4],
            size=row[5],
            type=row[6],
            sugar_level=row[7],
            add_ons=row[8],
            order_type=row[9],
            status=row[10],
            created_at=row[11].strftime("%Y-%m-%d %H:%M:%S")
        ))
    return cart

# POST: Add to cart
@router.post("/", status_code=status.HTTP_201_CREATED)
async def add_to_cart(item: CartItem, token: str = Depends(oauth2_scheme)):
    await validate_token_and_roles(token, ["user", "admin", "staff"])
    conn = await get_db_connection()
    cursor = await conn.cursor()
    try:
        logger.info(f"Adding to cart: {item}")
        from datetime import datetime
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        await cursor.execute("""
            INSERT INTO Cart (Username, ProductID, ProductName, Quantity, Price, Size, Type, SugarLevel, AddOns, OrderType, Status, CreatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'in_cart', ?)
        """, (
            item.username,
            item.product_id,
            item.product_name,
            item.quantity,
            item.price,
            item.size,
            item.type,
            item.sugar_level,
            item.add_ons,
            item.order_type,
            current_time
        ))
        await conn.commit()
    except Exception as e:
        logger.error(f"Error adding to cart: {e}")
        raise HTTPException(status_code=500, detail="Failed to add item to cart")
    finally:
        await cursor.close()
        await conn.close()
    return {"message": "Item added to cart"}

# DELETE: Remove from cart
@router.delete("/{cart_id}", status_code=status.HTTP_200_OK)
async def remove_from_cart(cart_id: int, token: str = Depends(oauth2_scheme)):
    await validate_token_and_roles(token, ["user", "admin", "staff"])
    conn = await get_db_connection()
    cursor = await conn.cursor()
    try:
        logger.info(f"Removing from cart: {cart_id}")
        await cursor.execute("DELETE FROM Cart WHERE CartID = ?", (cart_id,))
        await conn.commit()
    except Exception as e:
        logger.error(f"Error removing from cart: {e}")
        raise HTTPException(status_code=500, detail="Failed to remove item from cart")
    finally:
        await cursor.close()
        await conn.close()
    return {"message": "Item removed from cart"}
