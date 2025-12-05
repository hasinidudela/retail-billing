let lowStockProductsCache = [];
let lowStockLoaded = false;

document.addEventListener('DOMContentLoaded', async () => {
    const dashboardFilter = document.getElementById('dashboard-filter');
    if (dashboardFilter) {
        dashboardFilter.addEventListener('input', () => applyLowStockFilter());
    }

    await Promise.all([loadDashboardStats(), loadRecentBills()]);
});

async function loadDashboardStats() {
    const response = await api.get('/dashboard/stats');
    const lowStockTable = document.getElementById('low-stock-table');

    if (response.message !== 'success') {
        console.error('Failed to load stats');
        if (lowStockTable) {
            lowStockTable.innerHTML = '<tr><td colspan="3">Unable to load stock data.</td></tr>';
        }
        return;
    }

    const stats = response.data;
    lowStockProductsCache = stats.low_stock_products || [];
    lowStockLoaded = true;
    const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

    const totalCustomersEl = document.getElementById('total-customers');
    const totalProductsEl = document.getElementById('total-products');
    const totalRevenueEl = document.getElementById('total-revenue');
    const lowStockCountEl = document.getElementById('low-stock-count');
    const lowStockPill = document.getElementById('low-stock-pill');

    if (totalCustomersEl) totalCustomersEl.textContent = stats.total_customers;
    if (totalProductsEl) totalProductsEl.textContent = stats.total_products;
    if (totalRevenueEl) totalRevenueEl.textContent = formatCurrency(stats.total_revenue);

    const lowStockCount = lowStockProductsCache.length;
    if (lowStockCountEl) lowStockCountEl.textContent = lowStockCount;
    if (lowStockPill) lowStockPill.textContent = `${lowStockCount} ${lowStockCount === 1 ? 'item' : 'items'}`;

    applyLowStockFilter();
}

function applyLowStockFilter() {
    const table = document.getElementById('low-stock-table');
    if (!table) return;

    if (!lowStockLoaded) {
        table.innerHTML = '<tr><td colspan="3">Loading inventory...</td></tr>';
        return;
    }

    if (lowStockProductsCache.length === 0) {
        table.innerHTML = '<tr><td colspan="3">Inventory looks healthy. 🎉</td></tr>';
        return;
    }

    const query = (document.getElementById('dashboard-filter')?.value || '').toLowerCase();
    const filtered = lowStockProductsCache.filter(product => {
        return [product.name, product.category]
            .filter(Boolean)
            .some(value => value.toLowerCase().includes(query));
    });

    renderLowStockTable(filtered);
}

function renderLowStockTable(list) {
    const table = document.getElementById('low-stock-table');
    if (!table) return;
    const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

    if (list.length === 0) {
        table.innerHTML = '<tr><td colspan="3">No products match that search.</td></tr>';
        return;
    }

    table.innerHTML = '';
    list.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td style="color: #ef4444; font-weight: 700;">${product.stock}</td>
            <td>${formatCurrency(product.price)}</td>
        `;
        table.appendChild(row);
    });
}

async function loadRecentBills() {
    const list = document.getElementById('recent-bills');
    if (!list) return;

    const response = await api.get('/bills');

    if (response.message !== 'success') {
        list.innerHTML = '<li class="recent-item">Unable to load bills.</li>';
        return;
    }

    const bills = (response.data || []).slice(0, 5);
    if (bills.length === 0) {
        list.innerHTML = '<li class="recent-item">No bills have been created yet.</li>';
        return;
    }

    const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;
    const formatDate = (value) => {
        const date = new Date(value);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    list.innerHTML = '';
    bills.forEach(bill => {
        const item = document.createElement('li');
        item.className = 'recent-item';
        item.innerHTML = `
            <div>
                <strong>${bill.customer_name || 'Walk-in customer'}</strong>
                <p class="subtext">Bill #${bill.bill_id} • ${formatDate(bill.bill_date)}</p>
            </div>
            <div class="recent-meta">
                <span class="amount">${formatCurrency(bill.grand_total)}</span>
                <span class="status-pill subtle">Discount ${formatCurrency(bill.discount)}</span>
            </div>
        `;
        list.appendChild(item);
    });
}
