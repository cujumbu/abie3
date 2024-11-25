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

const createHeader = () => {
  const { site } = siteContext;
  const logo = site.logo.type === 'image' 
    ? `<img src="${site.logo.content}" alt="${site.logo.text}" class="h-8">` 
    : `<span class="text-3xl">${site.logo.content}</span>`;

  return `
    <nav class="fixed top-0 w-full bg-white/90 backdrop-blur-lg shadow-sm z-40">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-20">
          <!-- Logo -->
          <a href="/" class="flex items-center space-x-2">
            ${logo}
            <span class="text-2xl font-bold" style="color: ${site.theme.primary}">${site.logo.text}</span>
          </a>

          <!-- Primary Navigation -->
          <div class="hidden md:flex items-center space-x-6">
            ${site.navigation.primary.map(item => 
              `<a href="${item.href}" class="text-gray-600 hover:text-blue-600 transition">${item.text}</a>`
            ).join('')}
          </div>

          <!-- CTA -->
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

// Rest of the renderer configuration remains the same...
[Previous renderer code remains unchanged]

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
      // Previous script content remains unchanged
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
