# Shopora — Modern E-Commerce Platform

Shopora is a full-stack e-commerce application built with the MERN stack (MongoDB, Express, React, Node.js), plus a dedicated **Python recommendation microservice**. It features a sleek customer storefront, a robust admin dashboard, and a secure backend API.

## 🚀 Features

- **Customer Storefront** — browse products, multi-field search, category/type filters, persistent cart, profile management, change password.
- **Admin Dashboard** — manage inventory, edit product price/description, track orders, browse registered users, view recommendation analytics.
- **Smart Recommendation Engine** — personalized "For You" picks, trending products, similar items, and "frequently bought together" suggestions (content-based + collaborative filtering).
- **Secure Authentication** — JWT auth (7-day expiry) for users and admins; bcrypt-hashed passwords.
- **Payment** — Cash on Delivery (Stripe / Razorpay scaffolded).
- **Cloud Media** — product images on Cloudinary.
- Prices shown in **INR (₹)**.

## 🎯 Recommendation System

The recommendation **model runs as a separate Python (FastAPI) microservice** in `/recommendation-service`. The Node backend does not compute recommendations — its `/api/recommendations/*` routes are thin proxies that forward to the Python service, which reads the shared MongoDB. Auth is enforced by the Node middleware, and a shared secret (`RECO_SERVICE_KEY`) ensures only the backend can call the service.

```
frontend / admin  ──axios──▶  Node backend (proxy)  ──fetch──▶  Python service  ──▶  MongoDB
```

### Strategies

| Strategy | Where it Appears | How it Works |
|---|---|---|
| **Similar Products** | Product page, Cart | TF-IDF cosine similarity + category/price/bestseller scoring |
| **Frequently Bought Together** | Product page | Co-occurrence analysis across order history |
| **Picked For You** | Home page (logged-in) | Weighted by the user's past purchases, bestseller fallback |
| **Trending Now** | Home page | Most-ordered products in the last 30 days, "Newly Arrived" fallback |

### API Endpoints

```
POST  /api/recommendations/similar              { productId }
POST  /api/recommendations/bought-together      { productId }
POST  /api/recommendations/personalized         (user auth)
GET   /api/recommendations/trending
GET   /api/recommendations/analytics/trending   (admin)
GET   /api/recommendations/analytics/copurchase (admin)
```

## 🛠️ Tech Stack

- **Frontend / Admin**: React, Vite, Tailwind CSS, React Router, React Toastify
- **Backend**: Node.js, Express, Mongoose
- **Recommendation Service**: Python, FastAPI, Uvicorn
- **Database**: MongoDB

## 📂 Project Structure

- `/frontend` — customer-facing React app
- `/admin` — management dashboard
- `/backend` — Node.js API server (recommendation routes proxy to the Python service)
- `/recommendation-service` — Python FastAPI recommendation model (see its own `README.md`)
- `render.yaml` — Render Blueprint for the backend + recommendation service

## 🛠️ Setup & Installation

### Prerequisites

- Node.js & npm
- Python 3.10+ & pip (for the recommendation service)
- MongoDB (local or Atlas)

### Getting Started

1. **Clone & install dependencies**:
   ```bash
   git clone https://github.com/realkeshav08/Shopora.git
   cd Shopora && npm install
   ```

2. **Set up the recommendation service**:
   ```bash
   cd recommendation-service
   python -m venv venv
   venv\Scripts\activate        # Windows  (macOS/Linux: source venv/bin/activate)
   pip install -r requirements.txt
   cd ..
   ```

3. **Configure environment variables** (see below).

4. **Run everything**:
   ```bash
   npm run dev
   ```
   Starts the backend, frontend, admin panel, and Python recommendation service concurrently.

### Environment Variables

**`backend/.env`**
```
MONGODB_URI_DEV=mongodb://localhost:27017
MONGODB_URI_PROD=<atlas connection string>
NODE_ENV=development
JWT_SECRET=<long random string>
CLOUDINARY_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_SECRET_KEY=...
ADMIN_EMAIL=...
ADMIN_PASSWORD=<strong password>
EMAIL_PASS=<gmail app password>
SENDER_EMAIL=<gmail address>
RECOMMENDATION_SERVICE_URL=http://localhost:8000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
RECO_SERVICE_KEY=<shared secret with the recommendation service>
```

**`frontend/.env`** and **`admin/.env`**
```
VITE_BACKEND_URL=http://localhost:4000
```

> The recommendation service reads MongoDB credentials and `RECO_SERVICE_KEY` from `backend/.env` in local development. In production it uses its own environment variables (`MONGODB_URI_OVERRIDE`, `RECO_SERVICE_KEY`).

## 🌱 Seeding the Catalog

`backend/seedCatalog.js` fixes sync issues in existing products and generates a large product catalog (realistic INR prices, category-matched Cloudinary images — no new uploads).

```bash
cd backend
node seedCatalog.js dev 500 wipe    # wipe + seed the local/dev database with 500 products
node seedCatalog.js prod 500 wipe   # same, for production (needs a real MONGODB_URI_PROD)
```

`backend/refreshImages.js` re-assigns colour-varied images to all products. `seed.js` seeds **dummy users for development only** — never run it against production.

## ☁️ Deployment

The storefront and admin deploy to **Vercel**; the backend and recommendation service deploy to **Render**.

1. **MongoDB Atlas** — create a cluster, allow access from `0.0.0.0/0`, and copy the connection string.
2. **Render** — New → Blueprint → select the repo. `render.yaml` provisions `shopora-backend` and `shopora-recommendations`; fill the prompted secrets (DB URI, JWT secret, Cloudinary, admin, mail, `RECO_SERVICE_KEY`).
3. **Vercel** — create two projects with root directories `frontend` and `admin`; set `VITE_BACKEND_URL` to the Render backend URL. `vercel.json` handles SPA routing.
4. **Wire back** — on the Render backend, set `ALLOWED_ORIGINS` to the Vercel URLs and `RECOMMENDATION_SERVICE_URL` to the recommendation service URL.
5. **Seed** — run `node seedCatalog.js prod 500 wipe` once (products only; no dummy users in production).

## 📝 License

This project is licensed under the MIT License.
