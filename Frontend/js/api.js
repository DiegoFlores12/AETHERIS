const API_URL = 'http://localhost:3000/api';

function getToken(){ return localStorage.getItem('token'); }
function getUser(){ try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } }
function setSession(data){ localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); }
function logout(){ localStorage.clear(); location.href='login.html'; }
function money(value){ return `$${Number(value || 0).toLocaleString('es-CL')}`; }

async function api(path, options={}){
  const headers = { 'Content-Type':'application/json', ...(options.headers || {}) };
  const token = getToken();
  if(token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.message || 'Error de servidor');
  return data;
}
