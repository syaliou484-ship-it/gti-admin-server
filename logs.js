// logs.js
renderSidebar('logs');

const currentUser = Auth.getUser();
if (currentUser?.role !== 'admin') {
  document.querySelector('.main').innerHTML = `
    <div class="empty-state" style="margin-top:60px">Accès réservé aux administrateurs.</div>`;
} else {
  loadLogs();
}

async function loadLogs() {
  const tbody = document.getElementById('logsBody');
  try {
    const logs = await apiFetch('/logs');
    if (logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">Aucune action enregistrée.</div></td></tr>`;
      return;
    }
    tbody.innerHTML = logs.map(l => `
      <tr>
        <td>${formatDate(l.createdAt)}</td>
        <td>${escapeHtml(l.userName)}</td>
        <td><strong>${l.action}</strong></td>
        <td>${escapeHtml(l.target)}</td>
        <td>${escapeHtml(l.details || '')}</td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">Erreur de chargement.</div></td></tr>`;
    showToast(err.message, 'error');
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}
