// categories.js
renderSidebar('categories');

const user = Auth.getUser();
const canWrite = ['admin', 'employe'].includes(user?.role);
const canDelete = user?.role === 'admin';

const modal = document.getElementById('catModal');
const form = document.getElementById('catForm');

function openModal(cat = null) {
  document.getElementById('catModalTitle').textContent = cat ? 'Modifier la catégorie' : 'Ajouter une catégorie';
  document.getElementById('catId').value = cat?.id || '';
  document.getElementById('catName').value = cat?.name || '';
  modal.classList.add('open');
}
function closeModal() { modal.classList.remove('open'); }

document.getElementById('addCatBtn').addEventListener('click', () => openModal());
document.getElementById('catCancelBtn').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('catId').value;
  const name = document.getElementById('catName').value.trim();
  try {
    if (id) {
      await apiFetch(`/categories/${id}`, { method: 'PUT', body: JSON.stringify({ name }) });
      showToast('Catégorie mise à jour.');
    } else {
      await apiFetch('/categories', { method: 'POST', body: JSON.stringify({ name }) });
      showToast('Catégorie ajoutée.');
    }
    closeModal();
    loadCategories();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

async function deleteCategory(id, name) {
  if (!confirm(`Supprimer la catégorie "${name}" ?`)) return;
  try {
    await apiFetch(`/categories/${id}`, { method: 'DELETE' });
    showToast('Catégorie supprimée.');
    loadCategories();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadCategories() {
  const tbody = document.getElementById('catBody');
  try {
    const categories = await apiFetch('/categories');
    if (categories.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3"><div class="empty-state">Aucune catégorie.</div></td></tr>`;
      return;
    }
    window._catCache = categories;
    tbody.innerHTML = categories.map(c => `
      <tr>
        <td><strong>${c.name}</strong></td>
        <td>${formatDate(c.createdAt)}</td>
        <td style="white-space:nowrap">
          ${canWrite ? `<button class="btn btn-ghost btn-sm" onclick='editCategory(${c.id})'>Modifier</button>` : ''}
          ${canDelete ? `<button class="btn btn-danger btn-sm" onclick='deleteCategory(${c.id}, ${JSON.stringify(c.name)})'>Supprimer</button>` : ''}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="3"><div class="empty-state">Erreur de chargement.</div></td></tr>`;
    showToast(err.message, 'error');
  }
}

function editCategory(id) {
  const cat = (window._catCache || []).find(c => c.id === id);
  if (cat) openModal(cat);
}

if (!canWrite) document.getElementById('addCatBtn').style.display = 'none';

loadCategories();
