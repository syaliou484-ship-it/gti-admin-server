// products.js
renderSidebar('products');

const user = Auth.getUser();
const canWrite = ['admin', 'employe'].includes(user?.role);
const canDelete = user?.role === 'admin';

let categoriesCache = [];

const modal = document.getElementById('productModal');
const form = document.getElementById('productForm');

function openModal(product = null) {
  document.getElementById('modalTitle').textContent = product ? 'Modifier le produit' : 'Ajouter un produit';
  document.getElementById('productId').value = product?.id || '';
  document.getElementById('name').value = product?.name || '';
  document.getElementById('description').value = product?.description || '';
  document.getElementById('price').value = product?.price ?? '';
  document.getElementById('stock').value = product?.stock ?? '';
  document.getElementById('categoryId').value = product?.categoryId || '';
  modal.classList.add('open');
}
function closeModal() { modal.classList.remove('open'); }

document.getElementById('addProductBtn').addEventListener('click', () => openModal());
document.getElementById('cancelBtn').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('productId').value;
  const payload = {
    name: document.getElementById('name').value.trim(),
    description: document.getElementById('description').value.trim(),
    price: Number(document.getElementById('price').value),
    stock: Number(document.getElementById('stock').value),
    categoryId: document.getElementById('categoryId').value || null,
  };

  try {
    if (id) {
      await apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Produit mis à jour.');
    } else {
      await apiFetch('/products', { method: 'POST', body: JSON.stringify(payload) });
      showToast('Produit ajouté.');
    }
    closeModal();
    loadProducts();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

async function deleteProduct(id, name) {
  if (!confirm(`Supprimer le produit "${name}" ? Cette action est irréversible.`)) return;
  try {
    await apiFetch(`/products/${id}`, { method: 'DELETE' });
    showToast('Produit supprimé.');
    loadProducts();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function categoryName(id) {
  const cat = categoriesCache.find(c => c.id === Number(id));
  return cat ? cat.name : '—';
}

async function loadProducts() {
  const tbody = document.getElementById('productsBody');
  try {
    const [products, categories] = await Promise.all([
      apiFetch('/products'),
      apiFetch('/categories'),
    ]);
    categoriesCache = categories;

    const select = document.getElementById('categoryId');
    select.innerHTML = '<option value="">Aucune</option>' +
      categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

    if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">Aucun produit pour le moment.</div></td></tr>`;
      return;
    }

    tbody.innerHTML = products.map(p => `
      <tr>
        <td><strong>${escapeHtml(p.name)}</strong></td>
        <td>${escapeHtml(categoryName(p.categoryId))}</td>
        <td>${formatFcfa(p.price)}</td>
        <td>${p.stock}</td>
        <td style="white-space:nowrap">
          ${canWrite ? `<button class="btn btn-ghost btn-sm" onclick='editProduct(${p.id})'>Modifier</button>` : ''}
          ${canDelete ? `<button class="btn btn-danger btn-sm" onclick='deleteProduct(${p.id}, ${JSON.stringify(p.name)})'>Supprimer</button>` : ''}
        </td>
      </tr>
    `).join('');

    window._productsCache = products;
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">Erreur de chargement.</div></td></tr>`;
    showToast(err.message, 'error');
  }
}

function editProduct(id) {
  const product = (window._productsCache || []).find(p => p.id === id);
  if (product) openModal(product);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

if (!canWrite) document.getElementById('addProductBtn').style.display = 'none';

loadProducts();
