let customerDirectory = [];

document.addEventListener('DOMContentLoaded', () => {
    loadCustomers();

    const modal = document.getElementById('customer-modal');
    const addBtn = document.getElementById('add-customer-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const form = document.getElementById('customer-form');
    const filterInput = document.getElementById('customer-filter');

    if (filterInput) {
        filterInput.addEventListener('input', () => applyCustomerFilter());
    }

    addBtn.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Add Customer';
        document.getElementById('customer-id').value = '';
        form.reset();
        modal.style.display = 'flex';
    });

    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('customer-id').value;
        const data = {
            name: document.getElementById('customer-name').value,
            phone: document.getElementById('customer-phone').value,
            email: document.getElementById('customer-email').value
        };

        let response;
        if (id) {
            response = await api.put(`/customers/${id}`, data);
        } else {
            response = await api.post('/customers', data);
        }

        if (response.message === 'success') {
            modal.style.display = 'none';
            loadCustomers();
        } else {
            alert('Error saving customer: ' + (response.error || 'Unknown error'));
        }
    });
});

async function loadCustomers() {
    const response = await api.get('/customers');

    if (response.message === 'success') {
        customerDirectory = response.data;
        applyCustomerFilter();
    } else {
        customerDirectory = [];
        renderCustomers([]);
    }
}

function applyCustomerFilter() {
    const query = (document.getElementById('customer-filter')?.value || '').toLowerCase();
    const filtered = customerDirectory.filter(customer => {
        return [customer.name, customer.phone, customer.email]
            .filter(value => value !== undefined && value !== null)
            .some(value => value.toString().toLowerCase().includes(query));
    });

    renderCustomers(filtered);
}

function renderCustomers(list) {
    const tbody = document.getElementById('customers-table');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (list.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="5">No customers match your filter.</td>';
        tbody.appendChild(emptyRow);
    } else {
        list.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.id}</td>
                <td>${customer.name}</td>
                <td>${customer.phone}</td>
                <td>${customer.email || '-'}</td>
                <td>
                    <button class="btn btn-primary" onclick="editCustomer(${customer.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteCustomer(${customer.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateCustomerCounter(list.length, customerDirectory.length);
}

function updateCustomerCounter(current, total) {
    const counter = document.getElementById('customer-counter');
    if (!counter) return;

    if (total === 0) {
        counter.textContent = 'No customers';
        return;
    }

    counter.textContent = current === total
        ? `${total} customer${total === 1 ? '' : 's'}`
        : `${current} of ${total} shown`;
}

window.editCustomer = (id) => {
    const customer = customerDirectory.find(c => c.id === id);
    if (!customer) return;

    document.getElementById('customer-id').value = customer.id;
    document.getElementById('customer-name').value = customer.name;
    document.getElementById('customer-phone').value = customer.phone;
    document.getElementById('customer-email').value = customer.email || '';

    document.getElementById('modal-title').textContent = 'Edit Customer';
    document.getElementById('customer-modal').style.display = 'flex';
};

window.deleteCustomer = async (id) => {
    if (confirm('Are you sure you want to delete this customer?')) {
        const response = await api.delete(`/customers/${id}`);
        if (response.message === 'deleted') {
            loadCustomers();
        } else {
            alert('Error deleting customer');
        }
    }
};
