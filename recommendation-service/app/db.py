"""MongoDB access for the recommendation service.

Credentials are shared with the Node backend: by default we read
`../backend/.env`, using the exact same NODE_ENV / MONGODB_URI_* logic as
`backend/config/mongodb.js`, so both services always talk to the same database.
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

# Project root = .../Shopora (this file is at recommendation-service/app/db.py)
ROOT = Path(__file__).resolve().parents[2]

# Service-specific overrides first (optional), then the shared backend creds.
load_dotenv(ROOT / "recommendation-service" / ".env")
load_dotenv(ROOT / "backend" / ".env")

DB_NAME = "e-commerce"


def _mongo_uri() -> str:
    """Resolve the Mongo connection string the same way the Node backend does."""
    explicit = os.getenv("MONGODB_URI_OVERRIDE")
    if explicit:
        return explicit

    node_env = os.getenv("NODE_ENV", "development")
    if node_env == "production":
        base = os.getenv("MONGODB_URI_PROD")
    else:
        base = os.getenv("MONGODB_URI_DEV") or os.getenv("MONGODB_URI")

    if not base:
        raise RuntimeError(
            "MongoDB URI not configured. Set MONGODB_URI_DEV/PROD in backend/.env "
            "or MONGODB_URI_OVERRIDE in recommendation-service/.env"
        )
    return f"{base.rstrip('/')}/{DB_NAME}"


_client: MongoClient | None = None


def get_db():
    """Return a cached handle to the `e-commerce` database."""
    global _client
    if _client is None:
        _client = MongoClient(_mongo_uri(), serverSelectionTimeoutMS=8000)
    # Select the database by name explicitly — robust to connection strings
    # that carry no path / a ?appName=... query.
    return _client[DB_NAME]


def ping() -> bool:
    """Lightweight connectivity check used by /health."""
    get_db().command("ping")
    return True


def get_products() -> list[dict]:
    """All products, with `_id` stringified for JSON serialisation."""
    products = list(get_db().products.find({}))
    for p in products:
        p["_id"] = str(p["_id"])
    return products


def get_orders() -> list[dict]:
    """All orders, with `_id` stringified. `date` stays a datetime for filtering."""
    orders = list(get_db().orders.find({}))
    for o in orders:
        o["_id"] = str(o["_id"])
    return orders
