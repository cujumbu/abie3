export const createChart = (title, data) => {
  const chartId = `chart-${Math.random().toString(36).substring(2, 9)}`;
  const colors = [
    'rgba(16, 185, 129, 0.5)',  // Emerald
    'rgba(245, 158, 11, 0.5)',  // Amber
    'rgba(236, 72, 153, 0.5)',  // Pink
    'rgba(139, 92, 246, 0.5)',  // Purple
    'rgba(239, 68, 68, 0.5)'    // Red
  ];
  
  const borderColors = [
    'rgb(16, 185, 129)',  // Emerald
    'rgb(245, 158, 11)',  // Amber
    'rgb(236, 72, 153)',  // Pink
    'rgb(139, 92, 246)',  // Purple
    'rgb(239, 68, 68)'    // Red
  ];

  const config = {
    type: 'bar',
    data: {
      labels: data.map(d => d.label),
      datasets: [{
        label: title,
        data: data.map(d => d.value),
        backgroundColor: data.map((_, i) => colors[i % colors.length]),
        borderColor: data.map((_, i) => borderColors[i % borderColors.length]),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  };
  
  return `
    <div class="chart-container my-8 p-6 bg-white rounded-lg shadow-lg">
      <h3 class="text-xl font-bold mb-4">${title}</h3>
      <canvas id="${chartId}" data-chart='${JSON.stringify(config)}'></canvas>
    </div>
  `;
};