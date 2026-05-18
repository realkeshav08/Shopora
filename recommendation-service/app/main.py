"""Shopora Recommendation Service (FastAPI).

The Node backend proxies every `/api/recommendations/*` request here. This
service owns the recommendation model and talks to the same MongoDB the Node
backend uses. Response shapes intentionally mirror the original Node controller
so the frontend / admin panel need no changes.
"""

import os

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .db import get_orders, get_products, ping
from .recommender import RecommendationEngine
from .schemas import ProductIdRequest, UserIdRequest


# Shared-secret guard: only the Node backend (which sends x-internal-key) may
# call the data endpoints. If RECO_SERVICE_KEY is unset, the check is skipped
# (local development convenience).
def verify_internal_key(x_internal_key: str | None = Header(default=None)):
    expected = os.getenv("RECO_SERVICE_KEY")
    if expected and x_internal_key != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")


app = FastAPI(title="Shopora Recommendation Service", version="1.0.0")

# This service is internal — only the Node backend should reach it. CORS is
# kept closed; the shared-secret guard above is the real access control.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _engine() -> RecommendationEngine:
    """Build a fresh engine from the current DB snapshot (always up to date)."""
    return RecommendationEngine(get_products(), get_orders())


# GET + HEAD so uptime monitors (which often send HEAD) don't get a 405.
@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {"service": "Shopora Recommendation Service", "status": "running"}


@app.api_route("/health", methods=["GET", "HEAD"])
def health():
    try:
        ping()
        return {"success": True, "db": "connected"}
    except Exception as error:  # noqa: BLE001
        return {"success": False, "db": "unreachable", "message": str(error)}


@app.post("/similar", dependencies=[Depends(verify_internal_key)])
def similar(req: ProductIdRequest):
    try:
        products = _engine().similar(req.productId)
        if products is None:
            return {"success": False, "message": "Product not found"}
        return {"success": True, "products": products}
    except Exception as error:  # noqa: BLE001
        return {"success": False, "message": str(error)}


@app.post("/bought-together", dependencies=[Depends(verify_internal_key)])
def bought_together(req: ProductIdRequest):
    try:
        products, fallback = _engine().bought_together(req.productId)
        return {"success": True, "products": products, "fallback": fallback}
    except Exception as error:  # noqa: BLE001
        return {"success": False, "message": str(error)}


@app.post("/personalized", dependencies=[Depends(verify_internal_key)])
def personalized(req: UserIdRequest):
    try:
        products, kind = _engine().personalized(req.userId)
        return {"success": True, "products": products, "type": kind}
    except Exception as error:  # noqa: BLE001
        return {"success": False, "message": str(error)}


@app.get("/trending", dependencies=[Depends(verify_internal_key)])
def trending():
    try:
        products, kind = _engine().trending()
        return {"success": True, "products": products, "type": kind}
    except Exception as error:  # noqa: BLE001
        return {"success": False, "message": str(error)}


@app.get("/analytics/trending", dependencies=[Depends(verify_internal_key)])
def analytics_trending():
    try:
        trending_list, total_orders = _engine().trending_analytics()
        return {"success": True, "trending": trending_list, "totalOrders": total_orders}
    except Exception as error:  # noqa: BLE001
        return {"success": False, "message": str(error)}


@app.get("/analytics/copurchase", dependencies=[Depends(verify_internal_key)])
def analytics_copurchase():
    try:
        return {"success": True, "pairs": _engine().copurchase_analytics()}
    except Exception as error:  # noqa: BLE001
        return {"success": False, "message": str(error)}
