const express = require('express');
const router = express.Router();
const db = require('../database/database');

// Get all bills
router.get('/', (req, res) => {
    const sql = `
        SELECT bills.*, customers.name as customer_name 
        FROM bills 
        LEFT JOIN customers ON bills.customer_id = customers.id
        ORDER BY bill_date DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: rows
        });
    });
});

// Get single bill with items
router.get('/:id', (req, res) => {
    const billSql = `
        SELECT bills.*, customers.name as customer_name, customers.phone as customer_phone, customers.email as customer_email
        FROM bills 
        LEFT JOIN customers ON bills.customer_id = customers.id
        WHERE bill_id = ?
    `;

    const itemsSql = `
        SELECT bill_items.*, products.name as product_name 
        FROM bill_items 
        LEFT JOIN products ON bill_items.product_id = products.id
        WHERE bill_id = ?
    `;

    db.get(billSql, [req.params.id], (err, bill) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (!bill) {
            res.status(404).json({ error: 'Bill not found' });
            return;
        }

        db.all(itemsSql, [req.params.id], (err, items) => {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json({
                message: 'success',
                data: { ...bill, items }
            });
        });
    });
});

// Create new bill
router.post('/', (req, res) => {
    const { customer_id, sub_total, discount, grand_total, items } = req.body;

    // Start transaction (serialized)
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const insertBillSql = 'INSERT INTO bills (customer_id, sub_total, discount, grand_total) VALUES (?,?,?,?)';
        db.run(insertBillSql, [customer_id, sub_total, discount, grand_total], function (err) {
            if (err) {
                db.run('ROLLBACK');
                res.status(400).json({ error: err.message });
                return;
            }

            const billId = this.lastID;
            const insertItemSql = 'INSERT INTO bill_items (bill_id, product_id, quantity, price, total) VALUES (?,?,?,?,?)';
            const updateStockSql = 'UPDATE products SET stock = stock - ? WHERE id = ?';

            let completed = 0;
            let hasError = false;

            items.forEach(item => {
                if (hasError) return;

                // Insert item
                db.run(insertItemSql, [billId, item.product_id, item.quantity, item.price, item.total], (err) => {
                    if (err) {
                        hasError = true;
                        db.run('ROLLBACK');
                        if (!res.headersSent) res.status(400).json({ error: err.message });
                        return;
                    }

                    // Update stock
                    db.run(updateStockSql, [item.quantity, item.product_id], (err) => {
                        if (err) {
                            hasError = true;
                            db.run('ROLLBACK');
                            if (!res.headersSent) res.status(400).json({ error: err.message });
                            return;
                        }

                        completed++;
                        if (completed === items.length) {
                            db.run('COMMIT');
                            res.json({
                                message: 'success',
                                data: { bill_id: billId }
                            });
                        }
                    });
                });
            });
        });
    });
});

module.exports = router;
