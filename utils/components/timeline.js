export const createTimeline = (events) => {
  return `
    <div class="timeline-container my-8">
      ${events.map((event, index) => `
        <div class="timeline-item mb-4 pl-6 border-l-2 border-blue-500">
          <div class="timeline-dot"></div>
          <div class="mb-1">
            <span class="font-bold text-blue-600">${event.year}</span>
          </div>
          <div class="text-gray-700">${event.description}</div>
        </div>
      `).join('')}
    </div>
  `;
};