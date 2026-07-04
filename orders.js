// orders.js
renderSidebar('orders');

const user = Auth.getUser();
const canChangeStatus = ['admin', 'employe'].includes(user?.role);

const STATUS_OPTIONS = [
  { value: 'en_attente', label: 'En attente' },
  { value: 'validee', label: 'Validée' },
  { value: 'livree', label: 'Livrée' },
];

async function changeStatus(id, newStatus) {
  try {
    await apiFetch(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
    showToast('Statut mis à jour.');
    loadOrders();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadOrders() {
  const tbody = document.getElementById('ordersBody');
  try {
    const orders = await apiFetch('/orders');
    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">Aucune commande pour le moment.</div></td></tr>`;
      return;
    }
    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><strong>#${o.id}</strong></td>
        <td>${escapeHtml(o.customerName || 'N/A')}</td>
        <td>${formatFcfa(o.total)}</td>
        <td><span class="badge badge-${o.status}">${orderStatusLabel(o.status)}</span></td>
        <td>${formatDate(o.createdAt)}</td>
        <td>
          ${canChangeStatus ? `
            <select onchange="changeStatus(${o.id}, this.value)" style="width:auto;padding:6px 8px;font-size:12px">
              ${STATUS_OPTIONS.map(s => `<option value="${s.value}" ${s.value === o.status ? 'selected' : ''}>${s.label}</option>`).join('')}
            </select>
          ` : ''}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">Erreur de chargement.</div></td></tr>`;
    showToast(err.message, 'error');
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

loadOrders();
