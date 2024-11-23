import { marked } from 'marked';
import { createChart } from './components/chart.js';
import { createQuiz } from './components/quiz.js';
import { createTimeline } from './components/timeline.js';
import { createStats } from './components/stats.js';
import { createFeatures } from './components/features.js';
import { styles } from './components/styles.js';

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: true,
  mangle: false,
  sanitize: false,
  headerPrefix: '',
  xhtml: true
});

// Custom renderer for handling special components
const renderer = new marked.Renderer();

// Custom list item renderer
renderer.listitem = (text) => {
  // Check if the text is a path
  if (text.trim().startsWith('/')) {
    const path = text.trim();
    const linkText = path.substring(1).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return `<li><a href="${path}" class="internal-link text-blue-600 hover:text-blue-800 underline">${linkText}</a></li>`;
  }
  return `<li>${text}</li>`;
};

// Custom link renderer
renderer.link = (href, title, text) => {
  if (href.startsWith('/')) {
    // Internal link
    const linkText = text.replace(/^- /, '') || href.substring(1).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return `<a href="${href}" class="internal-link text-blue-600 hover:text-blue-800 underline">${linkText}</a>`;
  }
  if (href.startsWith('http')) {
    // External link
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="external-link text-blue-600 hover:text-blue-800 underline">${text}</a>`;
  }
  // Default link handling
  return `<a href="${href}" class="text-blue-600 hover:text-blue-800 underline">${text}</a>`;
};

// Process custom blocks
const processCustomBlocks = (content) => {
  let processedContent = content;

  // Process internal links in lists
  processedContent = processedContent.replace(/^\s*-\s*\[([^\]]+)\]\((\/[^)]+)\)/gm, (match, text, path) => {
    return `- <a href="${path}" class="internal-link text-blue-600 hover:text-blue-800 underline">${text}</a>`;
  });

  // Process plain internal links
  processedContent = processedContent.replace(/\[([^\]]+)\]\((\/[^)]+)\)/g, (match, text, path) => {
    return `<a href="${path}" class="internal-link text-blue-600 hover:text-blue-800 underline">${text}</a>`;
  });

  // Process bracketed internal links
  processedContent = processedContent.replace(/\[(\/[^\]]+)\]/g, (match, path) => {
    const text = path.substring(1).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return `<a href="${path}" class="internal-link text-blue-600 hover:text-blue-800 underline">${text}</a>`;
  });

  // Define custom block patterns
  const patterns = {
    stats: /:::stats:::([\s\S]*?):::/g,
    timeline: /:::timeline:::([\s\S]*?):::/g,
    quiz: /:::quiz:::([\s\S]*?):::/g,
    chart: /:::chart:::([\s\S]*?):::/g,
    features: /:::features:::([\s\S]*?):::/g
  };

  // Process each custom block
  Object.entries(patterns).forEach(([type, pattern]) => {
    processedContent = processedContent.replace(pattern, (match, content) => {
      const cleanContent = content.trim();
      switch (type) {
        case 'stats':
          const stats = cleanContent.split('\n').map(line => {
            const [label, value] = line.split(':').map(s => s.trim());
            return { label, value };
          });
          return createStats(stats);
        case 'timeline':
          const events = cleanContent.split('\n').map(line => {
            const [year, ...description] = line.split(' - ');
            return { year: year.trim(), description: description.join(' - ').trim() };
          });
          return createTimeline(events);
        case 'quiz':
          const lines = cleanContent.split('\n');
          const question = lines[0];
          const options = lines.slice(1).map(line => {
            const isCorrect = line.startsWith('*- ');
            const text = line.replace(/^\*?- /, '').trim();
            return { text, isCorrect };
          });
          return createQuiz(question, options);
        case 'chart':
          const chartLines = cleanContent.split('\n');
          const title = chartLines[0];
          const data = chartLines.slice(1).map(line => {
            const [label, value] = line.split('|').map(s => s.trim());
            return { label, value: parseFloat(value) };
          });
          return createChart(title, data);
        case 'features':
          const features = cleanContent.split('\n').map(f => f.trim());
          return createFeatures(features);
        default:
          return match;
      }
    });
  });

  return processedContent;
};

// Custom code block renderer
renderer.code = (code, language) => {
  // Return component HTML directly if it contains specific component classes
  if (code.includes('timeline-container') ||
      code.includes('chart-container') ||
      code.includes('quiz-container') ||
      code.includes('stats-grid') ||
      code.includes('features-grid')) {
    return code;
  }
  
  // Default code block handling
  return `<pre><code class="language-${language}">${code}</code></pre>`;
};

marked.use({ renderer });

const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/github-markdown-css/github-markdown.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>${styles}</style>
</head>
<body class="bg-gray-50">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">{{title}}</h1>
      </div>
    </div>
    
    <div class="content-container">
      <main class="main-content markdown-body">
        {{content}}
      </main>
    </div>

    <script>
      function handleQuizAnswer(button, quizId) {
        if (button.disabled) return;
        
        const container = document.getElementById(quizId + '-options');
        const feedback = document.getElementById(quizId + '-feedback');
        const allOptions = container.querySelectorAll('.quiz-option');
        
        // Disable all buttons and remove previous styling
        allOptions.forEach(opt => {
          opt.disabled = true;
          opt.classList.remove('correct', 'incorrect');
        });
        
        // Check if answer is correct
        const isCorrect = button.dataset.correct === 'true';
        
        // Show correct/incorrect styling
        button.classList.add(isCorrect ? 'correct' : 'incorrect');
        
        // If incorrect, highlight the correct answer
        if (!isCorrect) {
          allOptions.forEach(opt => {
            if (opt.dataset.correct === 'true') {
              opt.classList.add('correct');
            }
          });
        }
        
        // Show feedback
        feedback.classList.remove('hidden');
        feedback.innerHTML = isCorrect
          ? '<div class="text-green-600 font-semibold p-3 bg-green-50 rounded-lg">✓ Correct! Well done!</div>'
          : '<div class="text-red-600 font-semibold p-3 bg-red-50 rounded-lg">✗ Incorrect. Try again!</div>';
      }

      // Initialize charts
      document.addEventListener('DOMContentLoaded', () => {
        const charts = document.querySelectorAll('[data-chart]');
        charts.forEach(chart => {
          const config = JSON.parse(chart.dataset.chart);
          new Chart(chart, config);
        });
      });
    </script>
</body>
</html>`;

export const createHtmlPage = (content, { title }) => {
  // Process custom blocks first
  const processedContent = processCustomBlocks(content);
  
  // Convert markdown to HTML
  const htmlContent = marked.parse(processedContent);
  
  // Replace template variables
  return template
    .replace(/{{title}}/g, title || 'Generated Content')
    .replace('{{content}}', htmlContent);
};