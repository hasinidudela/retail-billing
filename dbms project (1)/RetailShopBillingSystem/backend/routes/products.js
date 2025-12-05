const express = require('express');
const router = express.Router();
const db = require('../database/database');

// Get all products
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM products';
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

// Get single product
router.get('/:id', (req, res) => {
    const sql = 'SELECT * FROM products WHERE id = ?';
    const params = [req.params.id];
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: row
        });
    });
});

// Create product
router.post('/', (req, res) => {
    const { name, category, price, stock } = req.body;
    const sql = 'INSERT INTO products (name, category, price, stock) VALUES (?,?,?,?)';
    const params = [name, category, price, stock];
    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: { id: this.lastID, ...req.body }
        });
    });
});

// Update product
router.put('/:id', (req, res) => {
    const { name, category, price, stock } = req.body;
    const sql = 'UPDATE products SET name = ?, category = ?, price = ?, stock = ? WHERE id = ?';
    const params = [name, category, price, stock, req.params.id];
    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            changes: this.changes
        });
    });
});

// Delete product
router.delete('/:id', (req, res) => {
    const sql = 'DELETE FROM products WHERE id = ?';
    const params = [req.params.id];
    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'deleted',
            changes: this.changes
        });
    });
});

module.exports = router;
