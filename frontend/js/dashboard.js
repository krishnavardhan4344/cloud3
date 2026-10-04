const user = requireLogin('user');
if (user) {
  document.getElementById('uname').textContent = user.name;
  loadHistory();
}

async function loadHistory() {
  try {
    const list = await apiFetch('/verification/status');
    document.getElementById('curStatus').innerHTML = badge(list.length ? list[0].status : null);
    document.getElementById('history').innerHTML = list.length
      ? list.map(v => `<tr><td>${esc(v.documentType)}</td><td>${esc(v.documentNumber)}</td>
          <td>${fmtDate(v.submittedAt)}</td><td>${badge(v.status)}</td></tr>`).join('')
      : '<tr><td colspan="4" class="text-muted">No verification requests yet.</td></tr>';
  } catch (err) { showAlert('msg', err.message); }
}
