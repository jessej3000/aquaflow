import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

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
from app.routers.feature_flags import router as feature_flags_router
from app.routers.reports import router as reports_router
from app.routers.expenses import router as expenses_router
from app.middleware.subscription_middleware import SubscriptionMiddleware
from app.gql.schema import graphql_router


@asynccontextmanager
async def lifespan(app_: FastAPI):
    from app.config import settings
    from app.db import init_pool, close_pool

    if settings.run_migrations:
        print("RUN_MIGRATIONS=true — running migrations before startup...")
        from scripts.run_migrations import run as run_migrations
        await asyncio.to_thread(run_migrations)
        print("Migrations complete — starting app.")

    await asyncio.to_thread(init_pool)

    from app.scheduler import run_scheduler
    task = asyncio.create_task(run_scheduler())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass
    finally:
        await asyncio.to_thread(close_pool)


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


@app.middleware("http")
async def graphql_flag_gate(request: Request, call_next):
    if request.url.path.startswith("/gql"):
        from app.lib.feature_flags import is_flag_enabled
        enabled = await asyncio.to_thread(is_flag_enabled, "graphql_enabled")
        if not enabled:
            return JSONResponse({"detail": "Not found"}, status_code=404)
    return await call_next(request)


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
app.include_router(feature_flags_router)
app.include_router(reports_router)
app.include_router(expenses_router)
app.include_router(graphql_router, prefix="/gql")
