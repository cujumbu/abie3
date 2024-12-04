// SVG Components for Maritime Diagrams
export const createVesselDiagram = (type) => {
  const diagrams = {
    container: `
      <svg viewBox="0 0 800 400" class="w-full h-auto">
        <rect x="100" y="150" width="600" height="200" fill="#e5e7eb" stroke="#374151" stroke-width="2"/>
        <rect x="150" y="100" width="500" height="50" fill="#e5e7eb" stroke="#374151" stroke-width="2"/>
        <rect x="250" y="50" width="300" height="50" fill="#e5e7eb" stroke="#374151" stroke-width="2"/>
        <!-- Containers -->
        <rect x="120" y="170" width="80" height="60" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>
        <rect x="220" y="170" width="80" height="60" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>
        <rect x="320" y="170" width="80" height="60" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>
        <!-- Labels -->
        <text x="400" y="380" text-anchor="middle" class="text-sm">Container Vessel Cross Section</text>
      </svg>
    `,
    tanker: `
      <svg viewBox="0 0 800 400" class="w-full h-auto">
        <path d="M100,200 Q400,150 700,200" fill="none" stroke="#374151" stroke-width="2"/>
        <path d="M100,200 Q400,250 700,200" fill="#e5e7eb" stroke="#374151" stroke-width="2"/>
        <!-- Tanks -->
        <rect x="150" y="180" width="100" height="40" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>
        <rect x="350" y="180" width="100" height="40" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>
        <rect x="550" y="180" width="100" height="40" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>
        <!-- Labels -->
        <text x="400" y="380" text-anchor="middle" class="text-sm">Tanker Vessel Profile</text>
      </svg>
    `,
    bulker: `
      <svg viewBox="0 0 800 400" class="w-full h-auto">
        <path d="M100,200 L700,200" stroke="#374151" stroke-width="2"/>
        <path d="M150,200 Q400,300 650,200" fill="#e5e7eb" stroke="#374151" stroke-width="2"/>
        <!-- Holds -->
        <path d="M200,200 L250,250 L350,250 L400,200" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>
        <path d="M450,200 L500,250 L600,250 L650,200" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>
        <!-- Labels -->
        <text x="400" y="380" text-anchor="middle" class="text-sm">Bulk Carrier Profile</text>
      </svg>
    `
  };

  return `
    <div class="diagram-container my-8 p-6 bg-white rounded-lg shadow-lg">
      ${diagrams[type] || diagrams.container}
    </div>
  `;
};

export const createPortLayout = () => `
  <div class="diagram-container my-8 p-6 bg-white rounded-lg shadow-lg">
    <svg viewBox="0 0 800 600" class="w-full h-auto">
      <!-- Water -->
      <rect x="0" y="0" width="800" height="600" fill="#dbeafe"/>
      
      <!-- Main Berth -->
      <rect x="50" y="50" width="700" height="100" fill="#e5e7eb" stroke="#374151" stroke-width="2"/>
      
      <!-- Container Terminal -->
      <rect x="50" y="150" width="300" height="200" fill="#bfdbfe" stroke="#374151" stroke-width="2"/>
      <text x="200" y="250" text-anchor="middle" class="text-sm">Container Terminal</text>
      
      <!-- Bulk Terminal -->
      <rect x="450" y="150" width="300" height="200" fill="#93c5fd" stroke="#374151" stroke-width="2"/>
      <text x="600" y="250" text-anchor="middle" class="text-sm">Bulk Terminal</text>
      
      <!-- Storage Areas -->
      <rect x="50" y="400" width="700" height="150" fill="#60a5fa" stroke="#374151" stroke-width="2"/>
      <text x="400" y="475" text-anchor="middle" class="text-sm">Storage Area</text>
    </svg>
  </div>
`;

export const createEquipmentSchematic = (equipment) => {
  const schematics = {
    radar: `
      <svg viewBox="0 0 400 400" class="w-full h-auto">
        <!-- Radar Display -->
        <circle cx="200" cy="200" r="150" fill="none" stroke="#374151" stroke-width="2"/>
        <circle cx="200" cy="200" r="100" fill="none" stroke="#374151" stroke-width="1"/>
        <circle cx="200" cy="200" r="50" fill="none" stroke="#374151" stroke-width="1"/>
        
        <!-- Sweep Line -->
        <line x1="200" y1="200" x2="350" y2="200" stroke="#3b82f6" stroke-width="2">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 200 200"
            to="360 200 200"
            dur="4s"
            repeatCount="indefinite"/>
        </line>
        
        <!-- Markers -->
        <circle cx="300" cy="150" r="5" fill="#ef4444"/>
        <circle cx="250" cy="300" r="5" fill="#ef4444"/>
        
        <text x="200" y="380" text-anchor="middle" class="text-sm">Radar Display</text>
      </svg>
    `,
    engine: `
      <svg viewBox="0 0 400 400" class="w-full h-auto">
        <!-- Engine Block -->
        <rect x="100" y="50" width="200" height="300" fill="#e5e7eb" stroke="#374151" stroke-width="2"/>
        
        <!-- Cylinders -->
        <circle cx="150" cy="100" r="25" fill="none" stroke="#374151" stroke-width="2"/>
        <circle cx="250" cy="100" r="25" fill="none" stroke="#374151" stroke-width="2"/>
        <circle cx="150" cy="200" r="25" fill="none" stroke="#374151" stroke-width="2"/>
        <circle cx="250" cy="200" r="25" fill="none" stroke="#374151" stroke-width="2"/>
        <circle cx="150" cy="300" r="25" fill="none" stroke="#374151" stroke-width="2"/>
        <circle cx="250" cy="300" r="25" fill="none" stroke="#374151" stroke-width="2"/>
        
        <text x="200" y="380" text-anchor="middle" class="text-sm">Engine Schematic</text>
      </svg>
    `,
    propulsion: `
      <svg viewBox="0 0 400 400" class="w-full h-auto">
        <!-- Shaft -->
        <line x1="50" y1="200" x2="350" y2="200" stroke="#374151" stroke-width="4"/>
        
        <!-- Propeller -->
        <path d="M300,200 L350,150 L350,250 Z" fill="#3b82f6" stroke="#1e40af" stroke-width="2">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 300 200"
            to="360 300 200"
            dur="2s"
            repeatCount="indefinite"/>
        </path>
        
        <text x="200" y="380" text-anchor="middle" class="text-sm">Propulsion System</text>
      </svg>
    `
  };

  return `
    <div class="schematic-container my-8 p-6 bg-white rounded-lg shadow-lg">
      ${schematics[equipment] || ''}
    </div>
  `;
};
