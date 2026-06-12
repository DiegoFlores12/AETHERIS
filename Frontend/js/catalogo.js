let allProducts = [];
function selectedValues(name) {
    return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(x=>x.value);
}
function renderProducts() {
    const categories = selectedValues('category');
    const materials = selectedValues('material');
    const filtered = allProducts.filter(p => categories.includes(p.category) || materials.includes(p.material));
    const box = document.getElementById('products');
    box.innerHTML = filtered.map(p => `
    <article class="card">
      <div class="product-img"><img src="${p.image_url || 'img/placeholder.jpg'}" onerror="this.style.display='none'"></div>
      <h3>${p.name} <span class="status">${p.type}</span></h3>
      <p>${p.category} · ${p.material}</p>
      <p>Peso: ${p.weight_grams} g · Reciclado: ${p.recycled_percent}%</p>
      <p><strong>Stock:</strong> ${p.stock}</p>
      <p class="price">${money(p.price)}</p>
      <button class="btn primary full" onclick="orderProduct(${p.id})">Ver detalles / Pedir →</button>
    </article>`).join('') || '<p>No hay productos con esos filtros.</p>';
}
async function loadProducts() {
    allProducts = await api('/products');
    renderProducts();
    document.querySelectorAll('.filters input').forEach(input => input.addEventListener('change', renderProducts));
}
async function orderProduct(id) {
    try {
        if (!getToken()) return location.href='login.html';
        await api('/products/orders', {
            method:'POST', body:JSON.stringify({
                productId:id
            })
        });
        alert('Pedido creado correctamente. Ahora aparecerá en tu historial de productos comprados.');
        loadProducts();
    }
    catch (e) {
        alert(e.message);
    }
}
loadProducts();
