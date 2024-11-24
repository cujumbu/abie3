export const createTimeline = (events) => {
  const timelineItems = events.map(event => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="font-bold text-xl text-blue-600">${event.year}</div>
        <div class="mt-2 text-gray-700">${event.description}</div>
      </div>
    </div>`).join('\n');

  return `
    <div class="timeline-container">
      ${timelineItems}
    </div>`;
};
