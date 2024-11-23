export const createStats = (stats) => {
  const statCards = stats.map(stat => `
    <div class="stat-card bg-white p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform">
      <div class="text-3xl font-bold text-blue-600 break-words">${stat.value}</div>
      <div class="text-gray-600 mt-2 text-sm">${stat.label}</div>
    </div>
  `).join('');

  return `
    <div class="stats-grid grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
      ${statCards}
    </div>
  `;
};