async function loadFeatured() {
    const box = document.getElementById('featured');
    const products = await api('/products');
    box.innerHTML = products.slice(0, 3).map(p => `
    <article class="card">
      <div class="product-img"><img src="${p.image_url || 'img/placeholder.jpg'}" onerror="this.style.display='none'"></div>
      <h3>${p.name}</h3><p>${p.type} · ${p.material}</p>
      <p><strong>Reciclado:</strong> ${p.recycled_percent}%</p>
      <a class="btn full" href="catalogo.html">Ver catálogo</a>
    </article>`).join('');
    const impact = await api('/donations/summary');
    const homePlastic = document.getElementById('homePlastic');
    if (homePlastic) homePlastic.textContent = `${Number(impact.totalPlasticKg).toFixed(1)} kg`;
}
loadFeatured().catch (()=> {
});
