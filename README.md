# Pibery Website Builder & E-Commerce Suite

> A modern, scalable, and feature-rich multi-tenant website builder and store-management platform designed to empower merchants to create stunning e-commerce stores with advanced inventory, order processing, and customer loyalty programs.

---

## 🏗️ System Architecture & Feature Breakdown

### 1. Main Platform Architecture (Pibery Core)
* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+), EJS, Google Fonts (*Inter*), FontAwesome.
* **Backend:** Node.js, Express.js RESTful API architecture.
* **Database:** MongoDB with Mongoose ODM (Schemas for Users, Shops, Products, Orders).

---

### 2. Detailed Feature Specification

#### A. Main Platform Level (Pibery Admin & Builder)
* **Website Builder Studio:** Interactive component injector (Hero sections, feature grids, pricing tables, contact forms) allowing users to visually construct pages.
* **Subdomain & Store Provisioning:** Automated creation of unique subdomains and customized storefronts for every registered merchant.
* **Multi-Tenant User Management:** Role-based access control (`admin`, `merchant`, `customer`) for secure platform operations.
* **Global Theme Management:** Real-time dark/light workspace toggle and template selection engine.

---

#### B. Merchant's E-Commerce Store Level (Generated via Builder)

##### 🛠️ Merchant Admin Panel (Store Owner's Dashboard)
* **Online Order Management:** Real-time notification, acceptance, processing, and management of incoming customer orders.
* **Smart Inventory Control:** Automated real-time stock tracking synchronized directly with sales transactions.
* **Order Fulfillment Tracking:** Full pipeline visibility from *Pending*, *Processing*, *Shipped*, to *Delivered* or *Cancelled*.
* **Custom Receipt & Invoice Printing:** Generate professional, printable, and customized transaction receipts for customers.
* **Customer Loyalty Program:** Automated calculation and management of loyalty points to reward repeat buyers.
* **Product & Catalog Management:** Add, update, or remove products, categories, pricing, and images.

##### 🛍️ Storefront User/Customer Side (End-User Shopping Experience)
* **Interactive Storefront:** Clean, responsive, and mobile-friendly shopping layout generated via Pibery templates.
* **Product Catalog & Search:** Browse products, view high-resolution imagery, details, and live stock status.
* **Seamless Checkout Process:** Quick and secure cart management and order placement.
* **Order Tracking & Status:** Customers can view their purchase history and track fulfillment status.
* **Loyalty Points Redemption:** View earned reward points and leverage discounts on repeat purchases.

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
