// dashboard.js
renderSidebar('dashboard');

(async function loadDashboard() {
  try {
    const stats = await apiFetch('/dashboard/stats');

    const cards = document.querySelectorAll('#statsGrid .stat-value');
    cards[0].textContent = stats.totals.products;
    cards[1].textContent = stats.totals.orders;
    cards[2].textContent = stats.totals.pendingOrders;
    cards[3].textContent = stats.totals.users;

    const activityCanvas = document.getElementById('activityChart');
    drawBarChart(
      activityCanvas,
      stats.activity7d.map(d => d.date.slice(5)),
      stats.activity7d.map(d => d.count)
    );

    const donutCanvas = document.getElementById('statusDonut');
    const rev = stats.revenueByStatus || {};
    drawDonut(donutCanvas, [
      { label: 'En attente', value: rev.en_attente || 0, color: '#F0A202' },
      { label: 'Validée', value: rev.validee || 0, color: '#1B4A82' },
      { label: 'Livrée', value: rev.livree || 0, color: '#3C7A4E' },
    ]);
  } catch (err) {
    showToast(err.message, 'error');
  }
})();
