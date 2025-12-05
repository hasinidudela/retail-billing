const express = require('express');
const router = express.Router();
const db = require('../database/database');

// Get all customers
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM customers';
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

// Create customer
router.post('/', (req, res) => {
    const { name, phone, email } = req.body;
    const sql = 'INSERT INTO customers (name, phone, email) VALUES (?,?,?)';
    const params = [name, phone, email];
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

// Update customer
router.put('/:id', (req, res) => {
    const { name, phone, email } = req.body;
    const sql = 'UPDATE customers SET name = ?, phone = ?, email = ? WHERE id = ?';
    const params = [name, phone, email, req.params.id];
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

// Delete customer
router.delete('/:id', (req, res) => {
    const sql = 'DELETE FROM customers WHERE id = ?';
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
