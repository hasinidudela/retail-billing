let inventory = [];

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();

    const modal = document.getElementById('product-modal');
    const addBtn = document.getElementById('add-product-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const form = document.getElementById('product-form');
    const filterInput = document.getElementById('product-filter');

    if (filterInput) {
        filterInput.addEventListener('input', () => applyProductFilter());
    }

    addBtn.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Add Product';
        document.getElementById('product-id').value = '';
        form.reset();
        modal.style.display = 'flex';
    });

    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('product-id').value;
        const data = {
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            price: parseFloat(document.getElementById('product-price').value),
            stock: parseInt(document.getElementById('product-stock').value)
        };

        let response;
        if (id) {
            response = await api.put(`/products/${id}`, data);
        } else {
            response = await api.post('/products', data);
        }

        if (response.message === 'success') {
            modal.style.display = 'none';
            loadProducts();
        } else {
            alert('Error saving product: ' + (response.error || 'Unknown error'));
        }
    });
});

async function loadProducts() {
    const response = await api.get('/products');

    if (response.message === 'success') {
        inventory = response.data;
        applyProductFilter();
    } else {
        inventory = [];
        renderProducts([]);
    }
}

function applyProductFilter() {
    const query = (document.getElementById('product-filter')?.value || '').toLowerCase();
    const filtered = inventory.filter(product => {
        return [product.name, product.category, product.price?.toString()]
            .filter(value => value !== undefined && value !== null)
            .some(value => value.toString().toLowerCase().includes(query));
    });

    renderProducts(filtered);
}

function renderProducts(list) {
    const tbody = document.getElementById('products-table');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (list.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="6">No products match your filter.</td>';
        tbody.appendChild(emptyRow);
    } else {
        list.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category || '-'}</td>
                <td>$${Number(product.price).toFixed(2)}</td>
                <td>${product.stock}</td>
                <td>
                    <button class="btn btn-primary" onclick="editProduct(${product.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateProductCounter(list.length, inventory.length);
}

function updateProductCounter(current, total) {
    const counter = document.getElementById('product-counter');
    if (!counter) return;

    if (total === 0) {
        counter.textContent = 'No items';
        return;
    }

    counter.textContent = current === total
        ? `${total} item${total === 1 ? '' : 's'}`
        : `${current} of ${total} shown`;
}

window.editProduct = async (id) => {
    const response = await api.get(`/products/${id}`);
    if (response.message === 'success') {
        const product = response.data;
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock').value = product.stock;

        document.getElementById('modal-title').textContent = 'Edit Product';
        document.getElementById('product-modal').style.display = 'flex';
    }
};

window.deleteProduct = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
        const response = await api.delete(`/products/${id}`);
        if (response.message === 'deleted') {
            loadProducts();
        } else {
            alert('Error deleting product');
        }
    }
};
