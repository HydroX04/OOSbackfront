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
    order_item_id: int
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

# GET: Retrieve user's cart (Pending order and its items)
@router.get("/{username}", response_model=List[CartResponse])
async def get_cart(username: str, token: str = Depends(oauth2_scheme)):
    await validate_token_and_roles(token, ["user", "admin", "staff"])
    conn = await get_db_connection()
    cursor = await conn.cursor()
    # Find pending order for user
    await cursor.execute("""
        SELECT OrderID, OrderDate, Status
        FROM Orders
        WHERE UserName = ? AND Status = 'Pending'
        ORDER BY OrderDate DESC
        OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY
    """, (username,))
    order = await cursor.fetchone()
    if not order:
        await cursor.close()
        await conn.close()
        return []  # No pending order means empty cart

    order_id = order[0]

    # Get order items for the pending order
    await cursor.execute("""
        SELECT OrderItemID, ProductName, Quantity, Price
        FROM OrderItems
        WHERE OrderID = ?
    """, (order_id,))
    items = await cursor.fetchall()
    await cursor.close()
    await conn.close()

    cart = []
    for item in items:
        cart.append(CartResponse(
            order_item_id=item[0],
            product_id=None,  # product_id not stored in new schema, can be None or handled differently
            product_name=item[1],
            quantity=item[2],
            price=float(item[3]),
            size=None,
            type=None,
            sugar_level=None,
            add_ons=None,
            order_type=order[2],  # Using order status as order_type placeholder
            status=order[2],
            created_at=order[1].strftime("%Y-%m-%d %H:%M:%S")
        ))
    return cart

# POST: Add to cart (Add item to pending order or create new order)
@router.post("/", status_code=status.HTTP_201_CREATED)
async def add_to_cart(item: CartItem, token: str = Depends(oauth2_scheme)):
    await validate_token_and_roles(token, ["user", "admin", "staff"])
    conn = await get_db_connection()
    cursor = await conn.cursor()
    try:
        # Check for existing pending order
        await cursor.execute("""
            SELECT OrderID
            FROM Orders
            WHERE UserName = ? AND Status = 'Pending'
            ORDER BY OrderDate DESC
            OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY
        """, (item.username,))
        order = await cursor.fetchone()

        if order:
            order_id = order[0]
        else:
            # Create new order
            await cursor.execute("""
                INSERT INTO Orders (UserName, OrderType, PaymentMethod, Subtotal, DeliveryFee, TotalAmount, DeliveryNotes, Status)
                OUTPUT INSERTED.OrderID
                VALUES (?, ?, ?, 0, 0, 0, '', 'Pending')
            """, (item.username, item.order_type, 'Cash'))
            row = await cursor.fetchone()
            order_id = row[0] if row else None

        # Insert order item
        await cursor.execute("""
            INSERT INTO OrderItems (OrderID, ProductName, ProductType, Category, Quantity, Price)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            order_id,
            item.product_name,
            item.type or '',
            '',  # Category not provided in CartItem, set empty or extend model
            item.quantity,
            item.price
        ))

        # TODO: Update order totals (Subtotal, TotalAmount) - can be done here or in separate process

        await conn.commit()
    except Exception as e:
        logger.error(f"Error adding to cart: {e}")
        raise HTTPException(status_code=500, detail="Failed to add item to cart")
    finally:
        await cursor.close()
        await conn.close()
    return {"message": "Item added to cart"}

# DELETE: Remove from cart (Remove order item)
@router.delete("/{order_item_id}", status_code=status.HTTP_200_OK)
async def remove_from_cart(order_item_id: int, token: str = Depends(oauth2_scheme)):
    await validate_token_and_roles(token, ["user", "admin", "staff"])
    conn = await get_db_connection()
    cursor = await conn.cursor()
    try:
        logger.info(f"Removing from cart: {order_item_id}")
        await cursor.execute("DELETE FROM OrderItems WHERE OrderItemID = ?", (order_item_id,))
        await conn.commit()
    except Exception as e:
        logger.error(f"Error removing from cart: {e}")
        raise HTTPException(status_code=500, detail="Failed to remove item from cart")
    finally:
        await cursor.close()
        await conn.close()
    return {"message": "Item removed from cart"}
