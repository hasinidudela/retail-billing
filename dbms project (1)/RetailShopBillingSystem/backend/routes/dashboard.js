const express = require('express');
const router = express.Router();
const db = require('../database/database');

router.get('/stats', (req, res) => {
    const stats = {};

    // Use Promise-like structure with callbacks to gather all data
    db.get('SELECT COUNT(*) as count FROM customers', [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.total_customers = row.count;

        db.get('SELECT COUNT(*) as count FROM products', [], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.total_products = row.count;

            db.get('SELECT SUM(grand_total) as total FROM bills', [], (err, row) => {
                if (err) return res.status(500).json({ error: err.message });
                stats.total_revenue = row.total || 0;

                db.all('SELECT * FROM products WHERE stock < 10', [], (err, rows) => {
                    if (err) return res.status(500).json({ error: err.message });
                    stats.low_stock_products = rows;

                    res.json({
                        message: 'success',
                        data: stats
                    });
                });
            });
        });
    });
});

module.exports = router;
