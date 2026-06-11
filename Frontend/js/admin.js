if(!getToken()) location.href='login.html';

async function loadAdmin(){
  const me = await api('/auth/me');
  if(me.role !== 'admin') location.href='cuenta.html';

  const d = await api('/admin/dashboard');
  kpis.innerHTML = `
    <div class="card kpi"><p>Usuarios</p><strong>${d.users}</strong></div>
    <div class="card kpi"><p>Órdenes</p><strong>${d.orders}</strong></div>
    <div class="card kpi"><p>Donaciones</p><strong>${money(d.donationMoney)}</strong></div>
    <div class="card kpi"><p>Plástico acumulado</p><strong>${Number(d.donationPlasticKg).toFixed(1)} kg</strong></div>
    <div class="card kpi"><p>Beneficiarios</p><strong>${d.beneficiaries}</strong></div>
    <div class="card kpi"><p>Productos activos</p><strong>${d.inventoryProducts}</strong></div>
    <div class="card kpi"><p>Stock total</p><strong>${d.inventoryStock}</strong></div>
    <div class="card kpi"><p>QR reciclaje</p><strong>${d.recycledKg} kg</strong></div>`;

  renderChart(d.donationChart || []);
  await Promise.all([loadUsers(), loadOrders(), loadProductsAdmin(), loadDonations()]);
}

function renderChart(data){
  if(!data.length){ donationChart.innerHTML='<p class="muted">Sin donaciones todavía.</p>'; return; }
  const max = Math.max(...data.map(x=>Number(x.amount)), 1);
  donationChart.innerHTML = data.map(x=>{
    const h = Math.max(8, Math.round(Number(x.amount) / max * 170));
    return `<div class="bar" style="height:${h}px"><span>${money(x.amount)}</span><small>${x.day.slice(5)}</small></div>`;
  }).join('');
}

async function loadUsers(){
  const u = await api('/admin/users');
  users.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Nombre</th><th>Rol</th><th>Avance</th><th>Bono</th><th>Acción</th></tr></thead><tbody>${u.map(x=>`<tr><td>${x.name}<br><small>${x.email}</small></td><td>${x.role}</td><td>${x.progress_percent}%</td><td>${x.is_beneficiary?'<span class="pill-ok">Sí</span>':'<span class="pill-bad">No</span>'}</td><td><button class="btn small" onclick="toggleBen(${x.id},${!x.is_beneficiary})">${x.is_beneficiary?'Quitar':'Seleccionar'}</button></td></tr>`).join('')}</tbody></table></div>`;
}

async function loadOrders(){
  const o = await api('/admin/orders');
  orders.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>ID</th><th>Usuario</th><th>Producto</th><th>Total</th><th>Plástico</th><th>Estado</th></tr></thead><tbody>${o.map(x=>`<tr><td>#${x.id}</td><td>${x.user_name||'-'}<br><small>${x.user_email||''}</small></td><td>${x.product_name||'-'}</td><td>${money(x.total)}</td><td>${Number(x.plastic_kg||0).toFixed(2)} kg</td><td><select onchange="updateOrder(${x.id},this.value)"><option ${x.status==='pendiente'?'selected':''}>pendiente</option><option ${x.status==='en_produccion'?'selected':''}>en_produccion</option><option ${x.status==='entregado'?'selected':''}>entregado</option><option ${x.status==='cancelado'?'selected':''}>cancelado</option></select></td></tr>`).join('')}</tbody></table></div>`;
}

async function loadDonations(){
  const list = await api('/admin/donations');
  donations.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>ID</th><th>Usuario</th><th>Monto</th><th>Plástico</th><th>Fecha</th></tr></thead><tbody>${list.map(d=>`<tr><td>#${d.id}</td><td>${d.user_name || 'Invitado'}<br><small>${d.user_email || ''}</small></td><td>${money(d.amount)}</td><td>${Number(d.plastic_kg).toFixed(2)} kg</td><td>${new Date(d.created_at).toLocaleString('es-CL')}</td></tr>`).join('')}</tbody></table></div>`;
}

async function loadProductsAdmin(){
  const p = await api('/products/admin/all');
  productsAdmin.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Imagen</th><th>Producto</th><th>Precio</th><th>Stock</th><th>Activo</th><th>Acción</th></tr></thead><tbody>${p.map(x=>`<tr><td><img src="${x.image_url || ''}" onerror="this.style.display='none'"></td><td>${x.name}<br><small>${x.category} · ${x.material}</small></td><td>${money(x.price)}</td><td>${x.stock}</td><td>${x.active?'Sí':'No'}</td><td><button class="btn small" onclick='editProduct(${JSON.stringify(x)})'>Editar</button> <button class="btn small danger" onclick="toggleProduct(${x.id},${!x.active})">${x.active?'Ocultar':'Activar'}</button></td></tr>`).join('')}</tbody></table></div>`;
}

function editProduct(p){
  productId.value=p.id;pName.value=p.name;pCategory.value=p.category;pType.value=p.type;pMaterial.value=p.material;pRecycled.value=p.recycled_percent;pWeight.value=p.weight_grams;pPrice.value=p.price;pStock.value=p.stock;pImage.value=p.image_url || '';
  location.hash='inventario';
}

productForm.onsubmit = async(e)=>{
  e.preventDefault();
  const body = {name:pName.value,category:pCategory.value,type:pType.value,material:pMaterial.value,recycledPercent:Number(pRecycled.value),weightGrams:Number(pWeight.value),price:Number(pPrice.value),stock:Number(pStock.value),imageUrl:pImage.value};
  try{
    if(productId.value) await api(`/products/${productId.value}`,{method:'PATCH',body:JSON.stringify(body)});
    else await api('/products',{method:'POST',body:JSON.stringify(body)});
    productMsg.className='ok';productMsg.textContent='Producto guardado.';productForm.reset();productId.value='';await loadProductsAdmin();
  }catch(e){productMsg.className='error';productMsg.textContent=e.message;}
};

async function toggleProduct(id,active){ await api(`/products/${id}`,{method:'PATCH',body:JSON.stringify({active})}); loadProductsAdmin(); }
async function updateOrder(id,status){ await api(`/admin/orders/${id}`,{method:'PATCH',body:JSON.stringify({status})}); loadOrders(); }
async function toggleBen(id,value){ await api(`/admin/users/${id}/beneficiary`,{method:'PATCH',body:JSON.stringify({isBeneficiary:value})}); loadUsers(); }
async function createNews(){ try{await api('/news',{method:'POST',body:JSON.stringify({title:newsTitle.value,content:newsContent.value,imageUrl:newsImage.value})});newsMsg.className='ok';newsMsg.textContent='Noticia publicada.';newsTitle.value='';newsContent.value='';newsImage.value='';}catch(e){newsMsg.className='error';newsMsg.textContent=e.message;} }

loadAdmin().catch(e=>alert(e.message));
