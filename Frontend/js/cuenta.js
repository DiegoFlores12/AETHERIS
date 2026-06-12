if (!getToken()) {
    location.href = 'login.html';
}

async function loadAccount() {
    const user = await api('/auth/me');

    hello.textContent = `Hola, ${user.name.split(' ')[0]}`;
    progress.textContent = `${user.progress_percent}%`;
    water.style.height = `${user.progress_percent}%`;
    impactKg.textContent = `${(user.progress_percent * 0.12).toFixed(1)} kg`;

    const donations = await api('/donations/summary');
    myMoney.textContent = money(donations.myMoney);
    myPlastic.textContent = `${Number(donations.myPlasticKg).toFixed(2)} kg`;

    const orders = await api('/products/orders/mine');
    renderOrderHistory(orders);

    const news = await api('/news');
    renderNews(news);
}

function renderOrderHistory(orders) {
    if (!orders.length) {
        orderHistory.innerHTML = '<p class="muted">Aún no tienes productos comprados.</p>';
        return;
    }

    orderHistory.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Imagen</th>
                    <th>Producto</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Plástico</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                ${orders.map(createOrderRow).join('')}
            </tbody>
        </table>
    `;
}

function createOrderRow(order) {
    return `
        <tr>
            <td>
                <img
                    src="${order.image_url || ''}"
                    onerror="this.style.display='none'"
                >
            </td>
            <td>
                ${order.product_name}
                <br>
                <small>${order.material}</small>
            </td>
            <td>
                ${new Date(order.created_at).toLocaleDateString('es-CL')}
            </td>
            <td>
                ${money(order.total)}
            </td>
            <td>
                ${Number(order.plastic_kg || 0).toFixed(2)} kg
            </td>
            <td>
                <span class="status">${order.status}</span>
            </td>
        </tr>
    `;
}

function renderNews(news) {
    newsList.innerHTML = news.map(createNewsCard).join('');
}

function createNewsCard(newsItem) {
    return `
        <div class="card">
            <img
                class="news-img"
                src="${newsItem.image_url || 'img/impacto.jpg'}"
                onerror="this.style.display='none'"
            >
            <h3>${newsItem.title}</h3>
            <p>${newsItem.content}</p>

            <div class="reaction-row">
                <button onclick="react(${newsItem.id}, 'enojo')">😠</button>
                <button onclick="react(${newsItem.id}, 'asombro')">😮</button>
                <button onclick="react(${newsItem.id}, 'contento')">😊</button>
            </div>

            <small>Reacciones: ${JSON.stringify(newsItem.reactions)}</small>
        </div>
    `;
}

async function scanQr() {
    try {
        const response = await api('/progress/scan', {
            method: 'POST',
            body: JSON.stringify({
                qrCode: qrCode.value
            })
        });

        scanMsg.className = 'ok';
        scanMsg.textContent = response.message;

        loadAccount();
    } catch (error) {
        scanMsg.className = 'error';
        scanMsg.textContent = error.message;
    }
}

async function react(id, reaction) {
    try {
        await api(`/news/${id}/reactions`, {
            method: 'POST',
            body: JSON.stringify({ reaction })
        });

        loadAccount();
    } catch (error) {
        alert(error.message);
    }
}

loadAccount().catch(error => alert(error.message));
