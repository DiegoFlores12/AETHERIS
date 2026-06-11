if(!getToken()) location.href='login.html';

async function loadAccount(){
  const user = await api('/auth/me');
  hello.textContent = `Hola, ${user.name.split(' ')[0]}`;
  progress.textContent = `${user.progress_percent}%`;
  water.style.height = `${user.progress_percent}%`;
  impactKg.textContent = `${(user.progress_percent * 0.12).toFixed(1)} kg`;

  const donations = await api('/donations/summary');
  myMoney.textContent = money(donations.myMoney);
  myPlastic.textContent = `${Number(donations.myPlasticKg).toFixed(2)} kg`;

  const orders = await api('/products/orders/mine');
  orderHistory.innerHTML = orders.length ? `
    <table class="table"><thead><tr><th>Imagen</th><th>Producto</th><th>Fecha</th><th>Total</th><th>Plástico</th><th>Estado</th></tr></thead><tbody>
      ${orders.map(o=>`<tr><td><img src="${o.image_url || ''}" onerror="this.style.display='none'"></td><td>${o.product_name}<br><small>${o.material}</small></td><td>${new Date(o.created_at).toLocaleDateString('es-CL')}</td><td>${money(o.total)}</td><td>${Number(o.plastic_kg || 0).toFixed(2)} kg</td><td><span class="status">${o.status}</span></td></tr>`).join('')}
    </tbody></table>` : '<p class="muted">Aún no tienes productos comprados.</p>';

  const news = await api('/news');
  newsList.innerHTML = news.map(n=>`<div class="card"><img class="news-img" src="${n.image_url || 'img/impacto.jpg'}" onerror="this.style.display='none'"><h3>${n.title}</h3><p>${n.content}</p><div class="reaction-row"><button onclick="react(${n.id},'enojo')">😠</button><button onclick="react(${n.id},'asombro')">😮</button><button onclick="react(${n.id},'contento')">😊</button></div><small>Reacciones: ${JSON.stringify(n.reactions)}</small></div>`).join('');
}
async function scanQr(){
  try{const r=await api('/progress/scan',{method:'POST',body:JSON.stringify({qrCode:qrCode.value})});scanMsg.className='ok';scanMsg.textContent=r.message;loadAccount();}catch(e){scanMsg.className='error';scanMsg.textContent=e.message;}
}
async function react(id,reaction){
  try{await api(`/news/${id}/reactions`,{method:'POST',body:JSON.stringify({reaction})});loadAccount();}catch(e){alert(e.message);}
}
loadAccount().catch(e=>alert(e.message));
