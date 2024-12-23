export const createSpeedCalculator = () => `
  <div class="calculator-container my-8 p-6 bg-white rounded-lg shadow-lg">
    <h3 class="text-xl font-bold mb-4">Maritime Speed Calculator</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Distance (nautical miles)</label>
        <input type="number" id="distance" class="w-full p-2 border rounded" min="0">
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Time (hours)</label>
        <input type="number" id="time" class="w-full p-2 border rounded" min="0">
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Speed (knots)</label>
        <input type="number" id="speed" class="w-full p-2 border rounded" min="0">
      </div>
    </div>
    <div class="mt-4">
      <button onclick="calculateSpeed()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Calculate
      </button>
    </div>
    <div id="speed-result" class="mt-4 text-lg font-semibold hidden"></div>
  </div>
  <script>
    function calculateSpeed() {
      const distance = parseFloat(document.getElementById('distance').value);
      const time = parseFloat(document.getElementById('time').value);
      const speed = parseFloat(document.getElementById('speed').value);
      const result = document.getElementById('speed-result');
      
      result.classList.remove('hidden');
      
      if (distance && time && !speed) {
        const calculatedSpeed = (distance / time).toFixed(2);
        result.textContent = \`Speed: \${calculatedSpeed} knots\`;
      } else if (distance && speed && !time) {
        const calculatedTime = (distance / speed).toFixed(2);
        result.textContent = \`Time: \${calculatedTime} hours\`;
      } else if (speed && time && !distance) {
        const calculatedDistance = (speed * time).toFixed(2);
        result.textContent = \`Distance: \${calculatedDistance} nautical miles\`;
      } else {
        result.textContent = 'Please enter exactly two values to calculate the third';
      }
    }
  </script>`;

export const createFuelCalculator = () => `
  <div class="calculator-container my-8 p-6 bg-white rounded-lg shadow-lg">
    <h3 class="text-xl font-bold mb-4">Fuel Consumption Calculator</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Distance (nautical miles)</label>
        <input type="number" id="fuel-distance" class="w-full p-2 border rounded" min="0">
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Speed (knots)</label>
        <input type="number" id="fuel-speed" class="w-full p-2 border rounded" min="0">
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Consumption Rate (tons/day)</label>
        <input type="number" id="fuel-rate" class="w-full p-2 border rounded" min="0">
      </div>
    </div>
    <div class="mt-4">
      <button onclick="calculateFuel()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Calculate
      </button>
    </div>
    <div id="fuel-result" class="mt-4 text-lg font-semibold hidden"></div>
  </div>
  <script>
    function calculateFuel() {
      const distance = parseFloat(document.getElementById('fuel-distance').value);
      const speed = parseFloat(document.getElementById('fuel-speed').value);
      const rate = parseFloat(document.getElementById('fuel-rate').value);
      const result = document.getElementById('fuel-result');
      
      if (!distance || !speed || !rate) {
        result.textContent = 'Please enter all values';
        result.classList.remove('hidden');
        return;
      }
      
      const time = distance / speed; // Time in hours
      const fuelConsumption = (rate * time / 24).toFixed(2); // Convert daily rate to hourly
      
      result.textContent = \`Estimated fuel consumption: \${fuelConsumption} tons\`;
      result.classList.remove('hidden');
    }
  </script>`;

export const createDraftCalculator = () => `
  <div class="calculator-container my-8 p-6 bg-white rounded-lg shadow-lg">
    <h3 class="text-xl font-bold mb-4">Draft Survey Calculator</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Forward Draft (meters)</label>
        <input type="number" id="draft-forward" class="w-full p-2 border rounded" min="0" step="0.01">
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Aft Draft (meters)</label>
        <input type="number" id="draft-aft" class="w-full p-2 border rounded" min="0" step="0.01">
      </div>
    </div>
    <div class="mt-4">
      <button onclick="calculateDraft()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Calculate
      </button>
    </div>
    <div id="draft-result" class="mt-4 text-lg font-semibold hidden"></div>
  </div>
  <script>
    function calculateDraft() {
      const forwardDraft = parseFloat(document.getElementById('draft-forward').value);
      const aftDraft = parseFloat(document.getElementById('draft-aft').value);
      const result = document.getElementById('draft-result');
      
      if (!forwardDraft || !aftDraft) {
        result.textContent = 'Please enter both draft measurements';
        result.classList.remove('hidden');
        return;
      }
      
      const meanDraft = ((forwardDraft + aftDraft) / 2).toFixed(3);
      const trim = (aftDraft - forwardDraft).toFixed(3);
      
      result.innerHTML = \`
        <div class="space-y-2">
          <p>Mean Draft: \${meanDraft} meters</p>
          <p>Trim: \${trim} meters \${trim > 0 ? 'by stern' : 'by bow'}</p>
        </div>\`;
      result.classList.remove('hidden');
    }
  </script>`;

export const createUnitConverter = () => `
  <div class="calculator-container my-8 p-6 bg-white rounded-lg shadow-lg">
    <h3 class="text-xl font-bold mb-4">Maritime Unit Converter</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Value</label>
        <input type="number" id="convert-value" class="w-full p-2 border rounded" min="0">
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Convert</label>
        <select id="convert-type" class="w-full p-2 border rounded">
          <option value="nm-km">Nautical Miles to Kilometers</option>
          <option value="km-nm">Kilometers to Nautical Miles</option>
          <option value="knots-kph">Knots to KPH</option>
          <option value="kph-knots">KPH to Knots</option>
        </select>
      </div>
    </div>
    <div class="mt-4">
      <button onclick="convert()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Convert
      </button>
    </div>
    <div id="convert-result" class="mt-4 text-lg font-semibold hidden"></div>
  </div>
  <script>
    function convert() {
      const value = parseFloat(document.getElementById('convert-value').value);
      const type = document.getElementById('convert-type').value;
      const result = document.getElementById('convert-result');
      
      if (!value) {
        result.textContent = 'Please enter a value';
        result.classList.remove('hidden');
        return;
      }
      
      let converted;
      switch(type) {
        case 'nm-km':
          converted = value * 1.852;
          result.textContent = \`\${value} nautical miles = \${converted.toFixed(2)} kilometers\`;
          break;
        case 'km-nm':
          converted = value / 1.852;
          result.textContent = \`\${value} kilometers = \${converted.toFixed(2)} nautical miles\`;
          break;
        case 'knots-kph':
          converted = value * 1.852;
          result.textContent = \`\${value} knots = \${converted.toFixed(2)} kilometers per hour\`;
          break;
        case 'kph-knots':
          converted = value / 1.852;
          result.textContent = \`\${value} kilometers per hour = \${converted.toFixed(2)} knots\`;
          break;
      }
      
      result.classList.remove('hidden');
    }
  </script>`;
