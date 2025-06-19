from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from database import get_db_connection

router = APIRouter()

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
async def get_cart(username: str):
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
async def add_to_cart(item: CartItem):
    conn = await get_db_connection()
    cursor = await conn.cursor()
    await cursor.execute("""
        INSERT INTO Cart (Username, ProductID, ProductName, Quantity, Price, Size, Type, SugarLevel, AddOns, OrderType, Status, CreatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'in_cart', GETDATE())
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
        item.order_type
    ))
    await conn.commit()
    await cursor.close()
    await conn.close()
    return {"message": "Item added to cart"}

# DELETE: Remove from cart
@router.delete("/{cart_id}", status_code=status.HTTP_200_OK)
async def remove_from_cart(cart_id: int):
    conn = await get_db_connection()
    cursor = await conn.cursor()
    await cursor.execute("DELETE FROM Cart WHERE CartID = ?", (cart_id,))
    await conn.commit()
    await cursor.close()
    await conn.close()
    return {"message": "Item removed from cart"}
