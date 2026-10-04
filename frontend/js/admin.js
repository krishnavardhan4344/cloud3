if (requireLogin('admin')) { loadVerifications(); loadUsers(); }

async function loadVerifications() {
  try {
    const list = await apiFetch('/admin/verifications');
    document.getElementById('vTable').innerHTML = list.length ? list.map(v => `
      <tr>
        <td>${esc(v.userId ? v.userId.name : 'Deleted user')}<br><small class="text-muted">${esc(v.userId ? v.userId.email : '')}</small></td>
        <td>${esc(v.documentType)}<br><small>${esc(v.documentNumber)}</small><br><small>Name: ${esc(v.fullName)}, DOB: ${new Date(v.dateOfBirth).toLocaleDateString()}</small></td>
        <td>${fmtDate(v.submittedAt)}</td>
        <td>${badge(v.status)}</td>
        <td><input id="rem-${v._id}" class="form-control form-control-sm" value="${esc(v.adminRemarks)}" placeholder="Remarks"></td>
        <td class="text-nowrap">
          <button class="btn btn-sm btn-outline-primary mb-1" onclick="viewDoc('${v._id}')">View Doc</button>
          <button class="btn btn-sm btn-info mb-1" onclick="act('${v._id}','review')">Review</button>
          <button class="btn btn-sm btn-success mb-1" onclick="act('${v._id}','approve')">Approve</button>
          <button class="btn btn-sm btn-danger mb-1" onclick="act('${v._id}','reject')">Reject</button>
        </td>
      </tr>`).join('') : '<tr><td colspan="6" class="text-muted">No requests yet.</td></tr>';
  } catch (err) { showAlert('msg', err.message); }
}

async function loadUsers() {
  try {
    const users = await apiFetch('/admin/users');
    document.getElementById('uTable').innerHTML = users.map(u => `
      <tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${esc(u.phone)}</td><td>${esc(u.role)}</td><td>${fmtDate(u.createdAt)}</td></tr>`).join('');
  } catch (err) { showAlert('msg', err.message); }
}

// Approve / reject / mark under review
async function act(id, action) {
  const remarks = document.getElementById('rem-' + id).value;
  if (action === 'reject' && !remarks.trim()) return showAlert('msg', 'Please add remarks explaining the rejection.', 'warning');
  try {
    const data = await apiFetch(`/admin/verification/${id}/${action}`, { method: 'PUT', body: { remarks } });
    showAlert('msg', data.message, 'success');
    loadVerifications();
  } catch (err) { showAlert('msg', err.message); }
}

// Documents are protected, so fetch with the token and open as a blob
async function viewDoc(id) {
  try {
    const res = await fetch(`${API}/admin/verification/${id}/document`, { headers: { Authorization: 'Bearer ' + getToken() } });
    if (!res.ok) throw new Error((await res.json()).message || 'Could not load document.');
    window.open(URL.createObjectURL(await res.blob()), '_blank');
  } catch (err) { showAlert('msg', err.message); }
}
