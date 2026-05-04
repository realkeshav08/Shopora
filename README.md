# Shopora - Modern E-Commerce Platform

Shopora is a full-stack e-commerce application built with the MERN stack (MongoDB, Express, React, Node.js). It features a sleek customer storefront, a robust admin dashboard, and a secure backend API.

## 🚀 Features

- **Customer Storefront**: Browse products, filter by categories, and manage a shopping cart.
- **Admin Dashboard**: Manage inventory, track orders, view recommendation analytics, and update product details.
- **Smart Recommendation Engine**: Personalized "For You" picks, trending products, similar items, and "frequently bought together" suggestions powered by content-based and collaborative filtering.
- **Secure Authentication**: JWT-based auth for users and admins.
- **Payment Integration**: Supports Stripe and Razorpay.
- **Cloud Media**: Product images hosted on Cloudinary.

## 🎯 Recommendation System

Shopora ships with a built-in recommendation engine that surfaces relevant products across the storefront and exposes analytics to admins.

### Strategies

| Strategy | Where it Appears | How it Works |
|---|---|---|
| **Similar Products** | Product page, Cart "You Might Also Like" | Content-based scoring on category, sub-category, price range, and bestseller status |
| **Frequently Bought Together** | Product page | Co-occurrence analysis across the order history |
| **Picked For You** | Home page (logged-in users) | Weighted by the user's past purchases, with bestseller fallback for new shoppers |
| **Trending Now** | Home page | Most-ordered products in the last 30 days, with a "Newly Arrived" fallback |

### API Endpoints

```
POST  /api/recommendations/similar              { productId }
POST  /api/recommendations/bought-together      { productId }
POST  /api/recommendations/personalized         (auth required)
GET   /api/recommendations/trending
GET   /api/recommendations/analytics/trending   (admin)
GET   /api/recommendations/analytics/copurchase (admin)
```

### Admin Insights

The admin panel includes an **Insights** page that shows:
- Top trending products (last 30 days) with units ordered
- Frequently co-purchased product pairs
- Headline stats (orders, trending count, pair count)

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, React Router, React Toastify.
- **Backend**: Node.js, Express, Mongoose.
- **Database**: MongoDB.
- **Design**: Modern, responsive UI with premium aesthetics.

## 📂 Project Structure

- `/frontend`: Customer-facing React application.
- `/admin`: Management dashboard for shop owners.
- `/backend`: Node.js API server, including the recommendation engine (`controllers/recommendationController.js`).

## 🛠️ Setup & Installation

### Prerequisites

- Node.js & npm
- MongoDB (Running locally or on Atlas)

### Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/realkeshav08/Shopora.git
   ```

2. **Setup all dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create `.env` files in `backend/`, `frontend/`, and `admin/` using the provided samples.

4. **Run the entire project**:
   ```bash
   npm run dev
   ```
   This will start the Backend, Frontend, and Admin Panel concurrently.

## 📝 License

This project is licensed under the MIT License.
