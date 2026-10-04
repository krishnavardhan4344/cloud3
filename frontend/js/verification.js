requireLogin('user');
const fileInput = document.getElementById('file');
const MAX = 5 * 1024 * 1024;

// Show file name and check it as soon as it is chosen
fileInput.addEventListener('change', () => {
  const f = fileInput.files[0];
  document.getElementById('fileName').textContent = f ? f.name : 'No file chosen';
  document.getElementById('upStatus').textContent = f ? 'Ready to upload' : 'Not uploaded';
  if (f && !/\.(pdf|jpe?g|png)$/i.test(f.name)) {
    showAlert('msg', 'Only PDF, JPG, JPEG and PNG files are allowed.'); fileInput.value = '';
    document.getElementById('upStatus').textContent = 'Invalid file';
  } else if (f && f.size > MAX) {
    showAlert('msg', 'File is too large. Maximum size is 5 MB.'); fileInput.value = '';
    document.getElementById('upStatus').textContent = 'Too large';
  } else document.getElementById('msg').innerHTML = '';
});

document.getElementById('vForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fullName = document.getElementById('fullName').value.trim();
  const dob = document.getElementById('dob').value;
  const docType = document.getElementById('docType').value;
  const docNo = document.getElementById('docNo').value.trim();
  const file = fileInput.files[0];

  if (!fullName || !dob || !docType || !docNo || !file) return showAlert('msg', 'Please fill in all fields and choose a document.');

  // FormData is used because we are sending a file
  const fd = new FormData();
  fd.append('fullName', fullName);
  fd.append('dateOfBirth', dob);
  fd.append('documentType', docType);
  fd.append('documentNumber', docNo);
  fd.append('document', file);

  const btn = document.getElementById('submitBtn');
  btn.disabled = true; document.getElementById('upStatus').textContent = 'Uploading...';
  try {
    const data = await apiFetch('/verification/submit', { method: 'POST', body: fd });
    document.getElementById('upStatus').textContent = 'Uploaded';
    showAlert('msg', data.message + ' Redirecting to status page...', 'success');
    setTimeout(() => (window.location.href = 'status.html'), 1500);
  } catch (err) {
    document.getElementById('upStatus').textContent = 'Failed';
    showAlert('msg', err.message); btn.disabled = false;
  }
});
