let products = [];
let customers = [];
let cart = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    setupEventListeners();
});

async function loadData() {
    const prodResponse = await api.get('/products');
    if (prodResponse.message === 'success') {
        products = prodResponse.data;
    }

    const custResponse = await api.get('/customers');
    if (custResponse.message === 'success') {
        customers = custResponse.data;
        const select = document.getElementById('customer-select');
        customers.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = c.name;
            select.appendChild(option);
        });
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById('product-search');
    const searchResults = document.getElementById('search-results');
    const discountInput = document.getElementById('discount');
    const checkoutBtn = document.getElementById('checkout-btn');

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length < 1) {
            searchResults.style.display = 'none';
            return;
        }

        const matches = products.filter(p =>
            p.name.toLowerCase().includes(query) ||
            (p.category && p.category.toLowerCase().includes(query))
        );

        searchResults.innerHTML = '';
        if (matches.length > 0) {
            searchResults.style.display = 'block';
            matches.forEach(p => {
                const div = document.createElement('div');
                div.className = 'search-item';
                div.innerHTML = `${p.name} - $${p.price} (Stock: ${p.stock})`;
                div.onclick = () => addToCart(p);
                searchResults.appendChild(div);
            });
        } else {
            searchResults.style.display = 'none';
        }
    });

    // Hide search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.product-search')) {
            searchResults.style.display = 'none';
        }
    });

    discountInput.addEventListener('input', updateTotals);
    checkoutBtn.addEventListener('click', checkout);
}

function addToCart(product) {
    if (product.stock <= 0) {
        alert('Product is out of stock!');
        return;
    }

    const existingItem = cart.find(item => item.product_id === product.id);
    if (existingItem) {
        if (existingItem.quantity >= product.stock) {
            alert('Not enough stock available!');
            return;
        }
        existingItem.quantity++;
        existingItem.total = existingItem.quantity * existingItem.price;
    } else {
        cart.push({
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            total: product.price
        });
    }

    updateCartUI();
    document.getElementById('product-search').value = '';
    document.getElementById('search-results').style.display = 'none';
}

function updateCartUI() {
    const tbody = document.getElementById('cart-items');
    tbody.innerHTML = '';

    cart.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>
                <input type="number" min="1" value="${item.quantity}" 
                       onchange="updateQuantity(${index}, this.value)" style="width: 60px;">
            </td>
            <td>$${item.total.toFixed(2)}</td>
            <td><button class="btn btn-danger" onclick="removeFromCart(${index})">X</button></td>
        `;
        tbody.appendChild(row);
    });

    updateTotals();
}

window.updateQuantity = (index, qty) => {
    const item = cart[index];
    const product = products.find(p => p.id === item.product_id);

    qty = parseInt(qty);
    if (qty < 1) qty = 1;
    if (qty > product.stock) {
        alert(`Only ${product.stock} items in stock!`);
        qty = product.stock;
    }

    item.quantity = qty;
    item.total = item.quantity * item.price;
    updateCartUI();
};

window.removeFromCart = (index) => {
    cart.splice(index, 1);
    updateCartUI();
};

function updateTotals() {
    const subTotal = cart.reduce((sum, item) => sum + item.total, 0);
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const grandTotal = Math.max(0, subTotal - discount);

    document.getElementById('sub-total').textContent = '₹' + subTotal.toFixed(2);
    document.getElementById('grand-total').textContent = '₹' + grandTotal.toFixed(2);
}

async function checkout() {
    if (cart.length === 0) {
        alert('Cart is empty!');
        return;
    }

    const customerId = document.getElementById('customer-select').value;
    if (!customerId) {
        alert('Please select a customer!');
        return;
    }

    const subTotal = cart.reduce((sum, item) => sum + item.total, 0);
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const grandTotal = Math.max(0, subTotal - discount);

    const billData = {
        customer_id: customerId,
        sub_total: subTotal,
        discount: discount,
        grand_total: grandTotal,
        items: cart
    };

    const response = await api.post('/bills', billData);

    if (response.message === 'success') {
        alert('Bill created successfully!');
        printInvoice(response.data.bill_id, billData);

        // Reset
        cart = [];
        updateCartUI();
        document.getElementById('discount').value = 0;
        loadData(); // Reload products to update stock
    } else {
        alert('Checkout failed: ' + (response.error || 'Unknown error'));
    }
}

function printInvoice(billId, data) {
    const customerName = document.getElementById('customer-select').options[document.getElementById('customer-select').selectedIndex].text;

    document.getElementById('inv-bill-id').textContent = billId;
    document.getElementById('inv-date').textContent = new Date().toLocaleString();
    document.getElementById('inv-customer').textContent = customerName;

    const tbody = document.getElementById('inv-items');
    tbody.innerHTML = '';

    data.items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>$${item.total.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById('inv-sub-total').textContent = '₹' + data.sub_total.toFixed(2);
    document.getElementById('inv-discount').textContent = '₹' + data.discount.toFixed(2);
    document.getElementById('inv-grand-total').textContent = '₹' + data.grand_total.toFixed(2);

    window.print();
}
