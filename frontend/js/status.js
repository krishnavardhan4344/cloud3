if (requireLogin('user')) load();

async function load() {
  try {
    const list = await apiFetch('/verification/status');
    document.getElementById('list').innerHTML = list.length ? list.map(v => `
      <div class="col-md-6"><div class="card p-3 h-100">
        <div class="d-flex justify-content-between"><h5>${esc(v.documentType)}</h5>${badge(v.status)}</div>
        <div class="small text-muted mb-2">No: ${esc(v.documentNumber)}</div>
        <div><b>Submitted:</b> ${fmtDate(v.submittedAt)}</div>
        <div><b>Reviewed:</b> ${fmtDate(v.reviewedAt)}</div>
        <div><b>Admin remarks:</b> ${esc(v.adminRemarks) || '-'}</div>
      </div></div>`).join('')
      : '<p class="text-muted">You have not submitted any request yet.</p>';
  } catch (err) { showAlert('msg', err.message); }
}
