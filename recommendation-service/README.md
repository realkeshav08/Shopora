# Shopora Recommendation Service

The recommendation model for Shopora, written in **Python (FastAPI)**.

The content-based similarity uses a TF-IDF + cosine-similarity model
implemented in pure Python (`app/text_model.py`) — no native build step, so the
service installs cleanly on any Python version.

The Node backend no longer computes recommendations itself — it proxies every
`/api/recommendations/*` request to this service. Both services share the same
MongoDB, so this service reads the catalogue and orders directly and returns
the same JSON shapes the frontend already expects.

## Architecture

```
frontend / admin
      │  axios -> /api/recommendations/*
      ▼
Node backend (Express)        recommendationController.js = thin HTTP proxy
      │  fetch -> RECOMMENDATION_SERVICE_URL
      ▼
Python service (FastAPI)      recommender.py = the model
      │
      ▼
MongoDB  (e-commerce)         products + orders  ← shared with the backend
```

## Endpoints

| Method | Path                     | Body / Auth        |
|--------|--------------------------|--------------------|
| POST   | `/similar`               | `{ productId }`    |
| POST   | `/bought-together`       | `{ productId }`    |
| POST   | `/personalized`          | `{ userId }`       |
| GET    | `/trending`              | –                  |
| GET    | `/analytics/trending`    | – (admin via Node) |
| GET    | `/analytics/copurchase`  | – (admin via Node) |
| GET    | `/health`                | DB connectivity    |

> Authentication (user JWT / admin) is still enforced by the Node backend
> middleware. This service is internal and only receives the resolved
> `userId`, never tokens.

## Setup

From `recommendation-service/`:

```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

pip install -r requirements.txt
```

MongoDB credentials are read automatically from `../backend/.env`
(`MONGODB_URI_DEV` / `MONGODB_URI_PROD`, selected by `NODE_ENV`).
To override, copy `.env.example` to `.env` and set `MONGODB_URI_OVERRIDE`.

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

Or, from the repo root, `npm run dev` starts the backend, frontend, admin **and**
this service together.

Interactive API docs: <http://localhost:8000/docs>
