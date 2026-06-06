import asyncio
from contextlib import asynccontextmanager

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
from app.routers.feedback import router as feedback_router
from app.routers.payments import router as payments_router
from app.routers.subscription import router as subscription_router
from app.routers.email_admin import router as email_admin_router
from app.middleware.subscription_middleware import SubscriptionMiddleware
from app.gql.schema import graphql_router


@asynccontextmanager
async def lifespan(app_: FastAPI):
    from app.config import settings

    if settings.run_migrations:
        print("RUN_MIGRATIONS=true — running migrations before startup...")
        from scripts.run_migrations import run as run_migrations
        await asyncio.to_thread(run_migrations)
        print("Migrations complete — starting app.")

    from app.scheduler import run_scheduler
    task = asyncio.create_task(run_scheduler())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(title="Smartaquaph API", version="0.1.0", lifespan=lifespan)

# CORSMiddleware must be outermost (added last — Starlette uses LIFO ordering)
app.add_middleware(SubscriptionMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://smartaquaph-nu-ten.vercel.app", "https://smartaquaph.jessej3000.workers.dev", "https://smartaquaph.com", "http://localhost:3000", "http://localhost:5173"],
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
app.include_router(feedback_router)
app.include_router(payments_router)
app.include_router(subscription_router)
app.include_router(email_admin_router)
app.include_router(graphql_router, prefix="/gql")
