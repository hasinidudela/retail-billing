CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    price REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE,
    email TEXT
);

CREATE TABLE IF NOT EXISTS bills (
    bill_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    bill_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    sub_total REAL,
    discount REAL,
    grand_total REAL,
    FOREIGN KEY(customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS bill_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price REAL,
    total REAL,
    FOREIGN KEY(bill_id) REFERENCES bills(bill_id),
    FOREIGN KEY(product_id) REFERENCES products(id)
);
