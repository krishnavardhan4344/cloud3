// Shared helpers used by every page

// Backend URL: same origin when served by Express (port 5000), otherwise localhost:5000
const API = location.port === '5000' ? '/api' : 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');
const getUser = () => JSON.parse(localStorage.getItem('user') || 'null');

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Redirects to login if not logged in (or wrong role)
function requireLogin(role) {
  const user = getUser();
  if (!getToken() || !user) { window.location.href = 'login.html'; return null; }
  if (role && user.role !== role) { window.location.href = user.role === 'admin' ? 'admin.html' : 'dashboard.html'; return null; }
  return user;
}

// fetch() wrapper: adds token, parses JSON, handles 401 and network errors
async function apiFetch(path, options = {}) {
  options.headers = options.headers || {};
  if (getToken()) options.headers['Authorization'] = 'Bearer ' + getToken();
  if (options.body && !(options.body instanceof FormData)) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }
  let res;
  try { res = await fetch(API + path, options); }
  catch (e) { throw new Error('Cannot reach the server. Is the backend running?'); }
  if (res.status === 401 && getToken()) { logout(); throw new Error('Session expired. Please log in again.'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
}

function showAlert(id, message, type = 'danger') {
  const box = document.getElementById(id);
  box.innerHTML = `<div class="alert alert-${type} py-2">${message}</div>`;
}

// Coloured status badge
function badge(status) {
  const cls = 'st-' + (status || 'None').split(' ')[0];
  return `<span class="badge-status ${cls}">${status || 'Not Submitted'}</span>`;
}

const fmtDate = (d) => d ? new Date(d).toLocaleString() : '-';

// Prevents HTML injection when printing user-entered text
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// Builds the top navigation bar depending on login state
function renderNav() {
  const user = getUser();
  let links = '';
  if (user && getToken()) {
    if (user.role === 'admin') {
      links = `<li class="nav-item"><a class="nav-link" href="admin.html">Admin Panel</a></li>`;
    } else {
      links = `<li class="nav-item"><a class="nav-link" href="dashboard.html">Dashboard</a></li>
               <li class="nav-item"><a class="nav-link" href="verification.html">Verify</a></li>
               <li class="nav-item"><a class="nav-link" href="status.html">Status</a></li>`;
    }
    links += `<li class="nav-item"><button class="btn btn-light btn-sm ms-lg-2" onclick="logout()">Logout</button></li>`;
  } else {
    links = `<li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>
             <li class="nav-item"><a class="btn btn-light btn-sm ms-lg-2" href="register.html">Register</a></li>`;
  }
  document.getElementById('nav').innerHTML = `
  <nav class="navbar navbar-expand-lg navbar-dark bg-brand">
    <div class="container">
      <a class="navbar-brand" href="index.html">&#9729; CloudID Verify</a>
      <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#menu"><span class="navbar-toggler-icon"></span></button>
      <div class="collapse navbar-collapse" id="menu"><ul class="navbar-nav ms-auto align-items-lg-center">${links}</ul></div>
    </div>
  </nav>`;
}
