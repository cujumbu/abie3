import { marked } from 'marked';
import { createChart } from './components/chart.js';
import { createQuiz } from './components/quiz.js';
import { createTimeline } from './components/timeline.js';
import { createStats } from './components/stats.js';
import { createFeatures } from './components/features.js';
import { styles } from './components/styles.js';
import { siteContext } from '../config/siteContext.js';

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
    const linkText = text.replace(/^- /, '') || href.substring(1).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return `<a href="${href}" class="internal-link text-blue-600 hover:text-blue-800 underline">${linkText}</a>`;
  }
  if (href.startsWith('http')) {
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="external-link text-blue-600 hover:text-blue-800 underline">${text}</a>`;
  }
  return `<a href="${href}" class="text-blue-600 hover:text-blue-800 underline">${text}</a>`;
};

// Custom code block renderer
renderer.code = (code, language) => {
  if (code.includes('timeline-container') ||
      code.includes('chart-container') ||
      code.includes('quiz-container') ||
      code.includes('stats-grid') ||
      code.includes('features-grid')) {
    return code;
  }
  return `<pre><code class="language-${language}">${code}</code></pre>`;
};

marked.use({ renderer });

const createHeader = () => {
  const { site } = siteContext;
  const logo = site.logo.type === 'image' 
    ? `<img src="${site.logo.content}" alt="${site.logo.text}" class="h-8">` 
    : `<span class="text-3xl">${site.logo.content}</span>`;

  return `
    <nav class="fixed top-0 w-full bg-white/90 backdrop-blur-lg shadow-sm z-40">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-20">
          <a href="/" class="flex items-center space-x-2">
            ${logo}
            <span class="text-2xl font-bold" style="color: ${site.theme.primary}">${site.logo.text}</span>
          </a>

          <div class="hidden md:flex items-center space-x-6">
            ${site.navigation.primary.map(item => 
              `<a href="${item.href}" class="text-gray-600 hover:text-blue-600 transition">${item.text}</a>`
            ).join('')}
          </div>

          <div class="flex items-center space-x-4">
            <a href="${site.navigation.cta.href}" 
               class="px-4 py-2 rounded-lg text-white transition"
               style="background-color: ${site.theme.primary}; hover:background-color: ${site.theme.secondary}">
              ${site.navigation.cta.text}
            </a>
          </div>
        </div>
      </div>
    </nav>`;
};

const createHero = (title) => {
  const { site } = siteContext;
  return `
    <div class="hero-section" style="background: ${site.theme.headerGradient}">
      <div class="hero-content">
        <h1 class="hero-title" style="color: ${site.theme.headerTextColor}">${title}</h1>
      </div>
    </div>`;
};

const createFooter = () => {
  const { site } = siteContext;
  return `
    <footer class="bg-gray-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid md:grid-cols-${site.footer.columns.length} gap-8">
          ${site.footer.columns.map(column => `
            <div>
              <h4 class="text-lg font-semibold mb-4">${column.title}</h4>
              <ul class="space-y-2">
                ${column.links.map(link => `
                  <li><a href="${link.href}" class="text-gray-400 hover:text-white">${link.text}</a></li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
        <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>${site.footer.bottomText}</p>
        </div>
      </div>
    </footer>`;
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

const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${siteContext.site.name} | {{title}}</title>
    <meta name="description" content="${siteContext.site.description}">
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/github-markdown-css/github-markdown.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
      ${styles}
      :root {
        --primary-color: ${siteContext.site.theme.primary};
        --secondary-color: ${siteContext.site.theme.secondary};
        --accent-color: ${siteContext.site.theme.accent};
      }
    </style>
</head>
<body class="bg-gray-50">
    ${createHeader()}
    ${createHero('{{title}}')}
    
    <div class="content-container">
      <main class="main-content markdown-body">
        {{content}}
      </main>
    </div>

    ${createFooter()}

    <script>
      function handleQuizAnswer(button, quizId) {
        if (button.disabled) return;
        
        const container = document.getElementById(quizId + '-options');
        const feedback = document.getElementById(quizId + '-feedback');
        const allOptions = container.querySelectorAll('.quiz-option');
        
        allOptions.forEach(opt => {
          opt.disabled = true;
          opt.classList.remove('correct', 'incorrect');
        });
        
        const isCorrect = button.dataset.correct === 'true';
        button.classList.add(isCorrect ? 'correct' : 'incorrect');
        
        if (!isCorrect) {
          allOptions.forEach(opt => {
            if (opt.dataset.correct === 'true') {
              opt.classList.add('correct');
            }
          });
        }
        
        feedback.classList.remove('hidden');
        feedback.innerHTML = isCorrect
          ? '<div class="text-green-600 font-semibold p-3 bg-green-50 rounded-lg">✓ Correct! Well done!</div>'
          : '<div class="text-red-600 font-semibold p-3 bg-red-50 rounded-lg">✗ Incorrect. Try again!</div>';
      }

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
  const processedContent = processCustomBlocks(content);
  const htmlContent = marked.parse(processedContent);
  
  return template
    .replace(/{{title}}/g, title || 'Generated Content')
    .replace('{{content}}', htmlContent);
};
