from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter()

@router.get("/products")
async def get_products_from_ims():
    ims_url = "http://localhost:8001/is_products/products/"

    # Get IMS token using credentials
    ims_token_url = "http://localhost:4000/auth/token"
    ims_auth_data = {
        "username": "managerIMS",
        "password": "manager123"
    }
    ims_token = None
    try:
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        async with httpx.AsyncClient() as client:
            token_response = await client.post(ims_token_url, data=ims_auth_data, headers=headers)
            if token_response.status_code == 200:
                ims_token = token_response.json().get("access_token")
            else:
                raise HTTPException(
                    status_code=token_response.status_code,
                    detail="Failed to authenticate with IMS Auth Service"
                )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500,
            detail=f"IMS Auth service request failed: {str(e)}"
        )

    if not ims_token:
        raise HTTPException(
            status_code=500,
            detail="Failed to obtain IMS token"
        )

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(ims_url, headers={"Authorization": f"Bearer {ims_token}"})

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail="Failed to fetch products from IMS"
            )

        return response.json()

    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Request error: {str(e)}"
        )
