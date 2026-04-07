🛒 E-commerce API

A scalable and modular RESTful API for an e-commerce platform built using Node.js, Express, Sequelize, and MySQL.

🚀 Overview
This project provides a complete backend solution for an e-commerce system with role-based access control and full order lifecycle management including cart, checkout, payment, and shipping.

👥 Roles
Admin → Full system control
Seller → Manage own products and orders
Customer → Browse, purchase, and interact

✨ Features

🔐 Authentication
Signup / Login
Email verification
Forgot & Reset password
JWT (Access & Refresh Tokens)

👤 Users
Get all users (Admin)
Get user by ID (Admin)
Get current user
Update profile
Delete account

🛍️ Products & Categories
CRUD products (Admin / Seller)
Product search & filtering
Categories management

🛒 Cart System
Add/remove/update items
Persistent user cart

📍 Addresses
Create / update / delete address
Set default address
Multiple addresses per user

📦 Orders System
Create order from cart
Order items snapshot
Order status management

💳 Payments
Create payment per order
Payment status tracking
Supports multiple payment methods

🚚 Shipping
Automatically created after successful payment
Status tracking (pending, shipped, delivered)

⭐ Reviews & Favorites
Add/update/delete reviews
Manage favorites list

🌍 Location System
Countries / States / Cities (Admin managed)
🧠 System Design
🔥 Key Concepts
Thin Client, Fat Server
Server handles all calculations and business logic
Client sends minimal data only
🔄 Order Lifecycle

Cart → Address → Order → Payment → Shipping → Delivery

📊 Status Flow
Order:

pending → paid → shipped → delivered
↓
canceled

Payment:

pending → completed / failed

Shipping:

pending → shipped → delivered

🛠️ Tech Stack
Node.js
Express.js
Sequelize ORM
MySQL
JWT Authentication
Supabase (for image storage)

📂 Project Structure

src/
│
├── config/ # Database config
├── models/ # Sequelize models
├── modules/ # Feature modules
├── middlewares/ # Auth & role middlewares
├── services/ # Business logic
├── utils/ # Helpers
├── app.js
└── server.js

⚙️ Setup & Installation
Clone repository
git clone <repo-link>
cd ecommerce-api
Install dependencies
npm install

Create .env file
DB_NAME=ecommerce
DB_USER=root
DB_PASS=your_password
DB_HOST=localhost
JWT_SECRET=your_secret

Run project
npm run dev

📌 API Design Principles
RESTful API structure
Role-based access control
Separation of concerns
Scalable architecture
Secure authentication flow

🔮 Future Enhancements
Seller analytics dashboard
Notification system
Multi-currency support
Performance optimization (caching)
OAuth

👨‍💻 Author
Mohamed Ahmed El-Oraby
