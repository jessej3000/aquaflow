from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.auth import router as auth_router
from app.routers.branches import router as branches_router
from app.routers.customers import router as customers_router
from app.routers.inventories import router as inventories_router
from app.routers.maintenance import router as maintenance_router
from app.routers.orders import router as orders_router
from app.routers.sales import router as sales_router
from app.routers.users import router as users_router
from app.routers.products import router as products_router
from app.gql.schema import graphql_router

app = FastAPI(title="Watermaster API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://aquaflow-nu-ten.vercel.app","http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth_router)
app.include_router(branches_router)
app.include_router(customers_router)
app.include_router(inventories_router)
app.include_router(maintenance_router)
app.include_router(orders_router)
app.include_router(sales_router)
app.include_router(users_router)
app.include_router(products_router)
app.include_router(graphql_router, prefix="/gql")
