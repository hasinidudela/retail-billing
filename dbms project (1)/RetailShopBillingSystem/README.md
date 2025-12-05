# Retail Shop Billing System

A complete end-to-end Billing System built with Node.js, Express, SQLite, and Vanilla HTML/CSS/JS.

## Features
- **Dashboard**: View total customers, products, revenue, and low stock alerts.
- **Product Management**: Add, update, delete products.
- **Customer Management**: Add, update, delete customers.
- **Billing**: Search products, add to cart, calculate totals, checkout, and print invoices.
- **Dark Mode**: Toggle between light and dark themes.
- **Responsive Design**: Works on different screen sizes.

## Project Structure
- `backend/`: Node.js server and API routes.
- `backend/database/`: SQLite database file and schema.
- `frontend/`: HTML, CSS, and JavaScript files.

## Prerequisites
- Node.js installed on your system.

## Installation & Setup

1. **Navigate to the backend directory:**
   ```bash
   cd RetailShopBillingSystem/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```
   The server will start on `http://localhost:3000`.
   The database `shop.db` will be automatically created and initialized with the schema on the first run.

4. **Access the Application:**
   Open your browser and go to:
   [http://localhost:3000](http://localhost:3000)

## Usage
1. Go to **Products** page to add some inventory.
2. Go to **Customers** page to add customers.
3. Go to **Billing** page to create a new bill.
   - Select a customer.
   - Search for products and add them to the cart.
   - Click "Checkout & Print" to save the bill and generate an invoice.

## Database
The SQLite database file is located at `backend/database/shop.db`.
The schema script is available at `backend/database/schema.sql`.
