# Shopora - Modern E-Commerce Platform

Shopora is a full-stack e-commerce application built with the MERN stack (MongoDB, Express, React, Node.js). It features a sleek customer storefront, a robust admin dashboard, and a secure backend API.

## 🚀 Features

- **Customer Storefront**: Browse products, filter by categories, and manage a shopping cart.
- **Admin Dashboard**: Manage inventory, track orders, and update product details.
- **Secure Authentication**: JWT-based auth for users and admins.
- **Payment Integration**: Supports Stripe and Razorpay.
- **Cloud Media**: Product images hosted on Cloudinary.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, React Router, React Toastify.
- **Backend**: Node.js, Express, Mongoose.
- **Database**: MongoDB.
- **Design**: Modern, responsive UI with premium aesthetics.

## 📂 Project Structure

- `/frontend`: Customer-facing React application.
- `/admin`: Management dashboard for shop owners.
- `/backend`: Node.js API server.

## 🛠️ Setup & Installation

### Prerequisites

- Node.js & npm
- MongoDB (Running locally or on Atlas)

### Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/realkeshav08/Shopora.git
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create a .env file with MONGODB_URI, JWT_SECRET, etc.
   npm run server
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   # Create a .env file with VITE_BACKEND_URL
   npm run dev
   ```

4. **Admin Setup**:
   ```bash
   cd admin
   npm install
   # Create a .env file with VITE_BACKEND_URL
   npm run dev
   ```

## 📝 License

This project is licensed under the MIT License.
