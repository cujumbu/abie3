export const createFeatures = (features) => {
  // Clean up feature text by removing markdown-style formatting
  const cleanFeatures = features.map(feature => {
    return feature
      .replace(/^\s*-\s*/, '') // Remove leading dash
      .replace(/\*\*(.*?)\*\*:\s*/, '$1: ') // Convert **text**: to text:
      .trim();
  });

  const featureCards = cleanFeatures.map(feature => `
    <div class="feature-card bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium">${feature}</p>
        </div>
      </div>
    </div>
  `).join('');

  return `
    <div class="features-grid grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
      ${featureCards}
    </div>
  `;
};