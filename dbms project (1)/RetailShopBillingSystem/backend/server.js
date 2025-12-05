const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
const productsRoutes = require('./routes/products');
const customersRoutes = require('./routes/customers');
const billsRoutes = require('./routes/bills');
const dashboardRoutes = require('./routes/dashboard');

app.use('/api/products', productsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/bills', billsRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
