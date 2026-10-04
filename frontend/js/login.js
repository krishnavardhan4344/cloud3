document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  if (!email || !password) return showAlert('msg', 'Enter email and password.');

  try {
    const data = await apiFetch('/auth/login', { method: 'POST', body: { email, password } });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = data.user.role === 'admin' ? 'admin.html' : 'dashboard.html';
  } catch (err) { showAlert('msg', err.message); }
});
