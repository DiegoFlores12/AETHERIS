if (!getToken()) {
    location.href = 'login.html';
}

async function loadAdmin() {
    const me = await api('/auth/me');

    if (me.role !== 'admin') {
        location.href = 'cuenta.html';
    }

    const dashboard = await api('/admin/dashboard');

    renderKpis(dashboard);
    renderChart(dashboard.donationChart || []);

    await Promise.all([
        loadUsers(),
        loadOrders(),
        loadProductsAdmin(),
        loadDonations()
    ]);
}

function renderKpis(data) {
    kpis.innerHTML = `
        <div class="card kpi">
            <p>Usuarios</p>
            <strong>${data.users}</strong>
        </div>

        <div class="card kpi">
            <p>Órdenes</p>
            <strong>${data.orders}</strong>
        </div>

        <div class="card kpi">
            <p>Donaciones</p>
            <strong>${money(data.donationMoney)}</strong>
        </div>

        <div class="card kpi">
            <p>Plástico acumulado</p>
            <strong>${Number(data.donationPlasticKg).toFixed(1)} kg</strong>
        </div>

        <div class="card kpi">
            <p>Beneficiarios</p>
            <strong>${data.beneficiaries}</strong>
        </div>

        <div class="card kpi">
            <p>Productos activos</p>
            <strong>${data.inventoryProducts}</strong>
        </div>

        <div class="card kpi">
            <p>Stock total</p>
            <strong>${data.inventoryStock}</strong>
        </div>

        <div class="card kpi">
            <p>QR reciclaje</p>
            <strong>${data.recycledKg} kg</strong>
        </div>
    `;
}

function renderChart(data) {
    if (!data.length) {
        donationChart.innerHTML = '<p class="muted">Sin donaciones todavía.</p>';
        return;
    }

    const max = Math.max(...data.map(item => Number(item.amount)), 1);

    donationChart.innerHTML = data.map(item => {
        const height = Math.max(8, Math.round(Number(item.amount) / max * 170));

        return `
            <div class="bar" style="height: ${height}px">
                <span>${money(item.amount)}</span>
                <small>${item.day.slice(5)}</small>
            </div>
        `;
    }).join('');
}

async function loadUsers() {
    const userList = await api('/admin/users');

    users.innerHTML = `
        <div class="table-wrap">
            <table class="table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Rol</th>
                        <th>Avance</th>
                        <th>Bono</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    ${userList.map(createUserRow).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function createUserRow(user) {
    const beneficiaryBadge = user.is_beneficiary
        ? '<span class="pill-ok">Sí</span>'
        : '<span class="pill-bad">No</span>';

    const actionText = user.is_beneficiary ? 'Quitar' : 'Seleccionar';

    return `
        <tr>
            <td>
                ${user.name}
                <br>
                <small>${user.email}</small>
            </td>
            <td>${user.role}</td>
            <td>${user.progress_percent}%</td>
            <td>${beneficiaryBadge}</td>
            <td>
                <button
                    class="btn small"
                    onclick="toggleBen(${user.id}, ${!user.is_beneficiary})"
                >
                    ${actionText}
                </button>
            </td>
        </tr>
    `;
}

async function loadOrders() {
    const orderList = await api('/admin/orders');

    orders.innerHTML = `
        <div class="table-wrap">
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Usuario</th>
                        <th>Producto</th>
                        <th>Total</th>
                        <th>Plástico</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${orderList.map(createAdminOrderRow).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function createAdminOrderRow(order) {
    return `
        <tr>
            <td>#${order.id}</td>
            <td>
                ${order.user_name || '-'}
                <br>
                <small>${order.user_email || ''}</small>
            </td>
            <td>${order.product_name || '-'}</td>
            <td>${money(order.total)}</td>
            <td>${Number(order.plastic_kg || 0).toFixed(2)} kg</td>
            <td>
                <select onchange="updateOrder(${order.id}, this.value)">
                    <option ${order.status === 'pendiente' ? 'selected' : ''}>pendiente</option>
                    <option ${order.status === 'en_produccion' ? 'selected' : ''}>en_produccion</option>
                    <option ${order.status === 'entregado' ? 'selected' : ''}>entregado</option>
                    <option ${order.status === 'cancelado' ? 'selected' : ''}>cancelado</option>
                </select>
            </td>
        </tr>
    `;
}

async function loadDonations() {
    const donationList = await api('/admin/donations');

    donations.innerHTML = `
        <div class="table-wrap">
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Usuario</th>
                        <th>Monto</th>
                        <th>Plástico</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    ${donationList.map(createDonationRow).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function createDonationRow(donation) {
    return `
        <tr>
            <td>#${donation.id}</td>
            <td>
                ${donation.user_name || 'Invitado'}
                <br>
                <small>${donation.user_email || ''}</small>
            </td>
            <td>${money(donation.amount)}</td>
            <td>${Number(donation.plastic_kg).toFixed(2)} kg</td>
            <td>${new Date(donation.created_at).toLocaleString('es-CL')}</td>
        </tr>
    `;
}

async function loadProductsAdmin() {
    const productList = await api('/products/admin/all');

    productsAdmin.innerHTML = `
        <div class="table-wrap">
            <table class="table">
                <thead>
                    <tr>
                        <th>Imagen</th>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Activo</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    ${productList.map(createProductAdminRow).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function createProductAdminRow(product) {
    const productJson = JSON.stringify(product).replace(/'/g, '&apos;');
    const actionText = product.active ? 'Ocultar' : 'Activar';

    return `
        <tr>
            <td>
                <img
                    src="${product.image_url || ''}"
                    onerror="this.style.display='none'"
                >
            </td>
            <td>
                ${product.name}
                <br>
                <small>${product.category} · ${product.material}</small>
            </td>
            <td>${money(product.price)}</td>
            <td>${product.stock}</td>
            <td>${product.active ? 'Sí' : 'No'}</td>
            <td>
                <button
                    class="btn small"
                    onclick='editProduct(${productJson})'
                >
                    Editar
                </button>

                <button
                    class="btn small danger"
                    onclick="toggleProduct(${product.id}, ${!product.active})"
                >
                    ${actionText}
                </button>
            </td>
        </tr>
    `;
}

function editProduct(product) {
    productId.value = product.id;
    pName.value = product.name;
    pCategory.value = product.category;
    pType.value = product.type;
    pMaterial.value = product.material;
    pRecycled.value = product.recycled_percent;
    pWeight.value = product.weight_grams;
    pPrice.value = product.price;
    pStock.value = product.stock;
    pImage.value = product.image_url || '';
    location.hash = 'inventario';
}

productForm.onsubmit = async event => {
    event.preventDefault();

    const body = {
        name: pName.value,
        category: pCategory.value,
        type: pType.value,
        material: pMaterial.value,
        recycledPercent: Number(pRecycled.value),
        weightGrams: Number(pWeight.value),
        price: Number(pPrice.value),
        stock: Number(pStock.value),
        imageUrl: pImage.value
    };

    try {
        if (productId.value) {
            await api(`/products/${productId.value}`, {
                method: 'PATCH',
                body: JSON.stringify(body)
            });
        } else {
            await api('/products', {
                method: 'POST',
                body: JSON.stringify(body)
            });
        }

        productMsg.className = 'ok';
        productMsg.textContent = 'Producto guardado.';

        productForm.reset();
        productId.value = '';

        await loadProductsAdmin();
    } catch (error) {
        productMsg.className = 'error';
        productMsg.textContent = error.message;
    }
};

async function toggleProduct(id, active) {
    await api(`/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active })
    });

    loadProductsAdmin();
}

async function updateOrder(id, status) {
    await api(`/admin/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    });

    loadOrders();
}

async function toggleBen(id, value) {
    await api(`/admin/users/${id}/beneficiary`, {
        method: 'PATCH',
        body: JSON.stringify({
            isBeneficiary: value
        })
    });

    loadUsers();
}

async function createNews() {
    try {
        await api('/news', {
            method: 'POST',
            body: JSON.stringify({
                title: newsTitle.value,
                content: newsContent.value,
                imageUrl: newsImage.value
            })
        });

        newsMsg.className = 'ok';
        newsMsg.textContent = 'Noticia publicada.';

        newsTitle.value = '';
        newsContent.value = '';
        newsImage.value = '';
    } catch (error) {
        newsMsg.className = 'error';
        newsMsg.textContent = error.message;
    }
}

loadAdmin().catch(error => alert(error.message));
