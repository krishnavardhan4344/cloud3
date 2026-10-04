document.getElementById('regForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value;
  const confirm = document.getElementById('confirm').value;

  // Client-side validation
  if (!name || !email || !phone || !password || !confirm) return showAlert('msg', 'Please fill in all fields.');
  if (!/^\S+@\S+\.\S+$/.test(email)) return showAlert('msg', 'Enter a valid email address.');
  if (!/^\d{10}$/.test(phone)) return showAlert('msg', 'Phone number must be exactly 10 digits.');
  if (password.length < 6) return showAlert('msg', 'Password must be at least 6 characters.');
  if (password !== confirm) return showAlert('msg', 'Passwords do not match.');

  try {
    const data = await apiFetch('/auth/register', { method: 'POST', body: { name, email, phone, password } });
    showAlert('msg', data.message + ' Redirecting...', 'success');
    setTimeout(() => (window.location.href = 'login.html'), 1500);
  } catch (err) { showAlert('msg', err.message); }
});
