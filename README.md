# Pibery Website Builder & E-Commerce Suite

> A modern, scalable, and feature-rich web development and store-building platform designed to streamline website creation, inventory tracking, order management, and customer loyalty programs.

---

## 🚀 Key Features

* **Interactive Builder Studio:** Drag-and-drop or click-based component injector (Hero sections, feature grids, pricing tables, contact forms).
* **Real-Time Order Management:** Seamlessly receive, process, and manage incoming customer orders.
* **Smart Inventory Control:** Accurate stock tracking synchronized automatically with sales transactions.
* **Order Fulfillment Tracking:** Monitor the complete pipeline from Pending to Delivered/Cancelled.
* **Custom Receipt Printing:** Generate professional, printable invoices and receipts for every transaction.
* **Customer Loyalty Program:** Automatically calculate and reward repeat customers based on their purchase amounts.
* **Dynamic Theme Toggle:** Real-time Dark and Light theme switcher for a personalized workspace experience.
* **Secure & Scalable:** Built with modern web security standards and modular architecture, ideal for small to medium-sized businesses.

---

## 🛠️ Tech Stack & Architecture

### 1. Frontend Architecture
* **Markup & Styling:** HTML5, CSS3, Google Fonts (*Inter*), FontAwesome Icons
* **Scripting:** Vanilla JavaScript (ES6+) for dynamic UI interactions and component rendering
* **Template Engine:** Embedded JavaScript (EJS) for server-side rendering views

### 2. Backend Architecture
* **Runtime:** Node.js
* **Framework:** Express.js
* **Modules & Routing:**
  * Authentication (`/api/auth`)
  * Shop Management (`/api/shop`)
  * Product & Inventory (`/api/product`)
  * Business & Commerce Suite (`/api/business`)

### 3. Database Architecture
* **Database:** MongoDB
* **ODM:** Mongoose
* **Core Schemas:**
  * **User Schema:** Manages user credentials and access roles (`admin`, `merchant`, `customer`).
  * **Shop Schema:** Handles merchant store profiles, subdomains, and templates.
  * **Product Schema:** Tracks individual item specifications, prices, and stock levels.
  * **Order Schema:** Stores transaction details, customer records, fulfillment status, and loyalty points.

---

## 📁 Project Directory Structure

```text
Pibery-Website-Builder/
│
├── config/
│   └── db.js                 # Database connection setup (Mongoose)
├── controllers/
│   ├── authController.js     # User authentication logic
│   ├── shopController.js     # E-commerce shop creation & management
│   ├── productController.js  # Inventory & product handling
│   └── businessController.js # Order management, receipts & loyalty logic
├── models/
│   ├── User.js               # User database schema
│   ├── Shop.js               # Shop database schema
│   ├── Product.js            # Product/Inventory database schema
│   └── Order.js              # Order tracking database schema
├── public/
│   ├── css/
│   │   └── style.css         # Global styles & dark/light themes
│   └── js/
│       └── main.js           # Frontend interactivity & dynamic builder scripts
├── routes/
│   ├── authRoutes.js
│   ├── shopRoutes.js
│   ├── productRoutes.js
│   └── businessRoutes.js
├── views/
│   ├── partials/
│   │   ├── header.ejs        # Reusable header component
│   │   └── footer.ejs        # Reusable footer component
│   ├── dashboard.ejs         # Main management studio & builder workspace
│   ├── index.html            # Landing page view
│   └── shop-template.ejs     # Dynamic storefront template
│
├── .env                      # Environment variables configuration
├── app.js                    # Main server entry point
├── package.json              # Project dependencies and metadata
└── README.md                 # Project documentation
