import express from 'express';
import dotenv from 'dotenv';
import { generatePageContent } from './utils/contentGenerator.js';
import { createHtmlPage } from './utils/templateEngine.js';
import { siteContext } from './config/siteContext.js';
import { SupabaseCache } from './utils/cache.js';
import { Analytics } from './utils/analytics.js';
import fs from 'fs/promises';
import path from 'path';

// Initialize environment variables
dotenv.config();

// Initialize Express
const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase cache
const pageCache = new SupabaseCache();

// Visit counter storage
let visitStats = {
  totalVisits: 0,
  pageVisits: {}
};

// Utility functions
const formatTitle = (path) => {
  // Remove leading slash and split by '/'
  const parts = path.substring(1).split('/');
  
  // Format each part (capitalize words, replace hyphens)
  const formattedParts = parts.map(part => 
    part.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
  );

  // If it's a topic page, just return the topic name
  if (parts[0] === 'topics') {
    return formattedParts[1];
  }

  // For other pages, combine with a colon if there are multiple parts
  return formattedParts.length > 1 
    ? `${formattedParts[0]}: ${formattedParts.slice(1).join(' - ')}` 
    : formattedParts[0];
};

const isCrawler = (userAgent) => {
  const crawlers = [
    'bot', 'spider', 'crawler', 'googlebot', 'bingbot', 'slurp',
    'duckduckbot', 'baiduspider', 'yandexbot', 'sogou', 'exabot'
  ];
  return crawlers.some(crawler => 
    userAgent.toLowerCase().includes(crawler)
  );
};

const incrementVisits = (path) => {
  visitStats.totalVisits++;
  visitStats.pageVisits[path] = (visitStats.pageVisits[path] || 0) + 1;
};

// API endpoints
app.get('/api/stats', (req, res) => {
  res.json(visitStats);
});

// Admin analytics endpoint
app.get('/admin/analytics', async (req, res) => {
  try {
    // Basic auth check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Admin Access"');
      return res.status(401).send('Authentication required');
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (username !== process.env.ADMIN_USER || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).send('Invalid credentials');
    }

    const stats = await Analytics.getStats();
    if (!stats) {
      return res.status(500).send('Error fetching analytics');
    }
    
    // Enhanced admin dashboard with more detailed stats
    const adminHtml = createHtmlPage(`
      <div class="space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-blue-50 p-6 rounded-lg">
            <h3 class="text-lg font-semibold text-blue-800">Total Views</h3>
            <p class="text-3xl font-bold text-blue-600">${stats.totalViews}</p>
            <p class="text-sm text-blue-600">Last 30 days</p>
          </div>
          <div class="bg-green-50 p-6 rounded-lg">
            <h3 class="text-lg font-semibold text-green-800">Unique Pages</h3>
            <p class="text-3xl font-bold text-green-600">${Object.keys(stats.pageViews).length}</p>
            <p class="text-sm text-green-600">Total unique pages viewed</p>
          </div>
          <div class="bg-purple-50 p-6 rounded-lg">
            <h3 class="text-lg font-semibold text-purple-800">Top Referrer</h3>
            <p class="text-3xl font-bold text-purple-600">${
              Object.entries(stats.topReferrers)[0]?.[0] || 'Direct'
            }</p>
            <p class="text-sm text-purple-600">Most common source</p>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-bold mb-4">Most Viewed Pages</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Path</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                ${Object.entries(stats.pageViews)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 10)
                  .map(([path, views]) => `
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${path}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${views}</td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-bold mb-4">Top Referrers</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visits</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                ${Object.entries(stats.topReferrers)
                  .sort(([,a], [,b]) => b - a)
                  .map(([referrer, count]) => `
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${referrer || 'Direct'}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${count}</td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `, { title: 'Analytics Dashboard' });

    res.send(adminHtml);
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).send('Error loading analytics dashboard');
  }
});

// Static files middleware
app.use(express.static('public'));

// Custom index handler
const serveCustomIndex = async () => {
  if (siteContext.index?.enabled && siteContext.index?.path) {
    try {
      const indexPath = path.join(process.cwd(), siteContext.index.path);
      const indexContent = await fs.readFile(indexPath, 'utf8');
      return indexContent;
    } catch (error) {
      console.error('Error reading custom index:', error);
      if (!siteContext.index.fallback) {
        throw error;
      }
      return null;
    }
  }
  return null;
};

// Rate limiting for crawlers
const crawlerRequests = new Map();
const CRAWLER_RATE_LIMIT = 60; // requests per minute
const CRAWLER_WINDOW = 60 * 1000; // 1 minute in milliseconds

const checkCrawlerRateLimit = (ip) => {
  const now = Date.now();
  const windowStart = now - CRAWLER_WINDOW;
  
  // Clean up old entries
  for (const [key, time] of crawlerRequests.entries()) {
    if (time < windowStart) {
      crawlerRequests.delete(key);
    }
  }
  
  // Count requests in current window
  let count = 0;
  for (const [key, time] of crawlerRequests.entries()) {
    if (key.startsWith(ip) && time >= windowStart) {
      count++;
    }
  }
  
  return count >= CRAWLER_RATE_LIMIT;
};

// Main route handler
app.get('*', async (req, res) => {
  try {
    const userAgent = req.get('user-agent') || '';
    const clientIP = req.ip;

    // Handle root path
    if (req.path === '/') {
      try {
        const customIndex = await serveCustomIndex();
        if (customIndex) {
          incrementVisits(req.path);
          return res.send(customIndex);
        }
        return res.send('Welcome to the AI Content Generator. Enter any path to generate content!');
      } catch (error) {
        console.error('Error serving index:', error);
        return res.status(500).send('Error serving index page');
      }
    }

    // Handle favicon.ico request
    if (req.path === '/favicon.ico') {
      return res.status(204).end();
    }

    // Rate limiting for crawlers
    if (isCrawler(userAgent)) {
      const requestKey = `${clientIP}-${Date.now()}`;
      if (checkCrawlerRateLimit(clientIP)) {
        return res.status(429).send('Too Many Requests');
      }
      crawlerRequests.set(requestKey, Date.now());
    }

    // Check cache first
    const cachedContent = await pageCache.get(req.path);
    if (cachedContent) {
      incrementVisits(req.path);
      return res.send(cachedContent);
    }

    // Check if we're at cache capacity for crawlers
    const stats = await pageCache.getStats();
    if (isCrawler(userAgent) && stats.keys >= siteContext.cache.maxKeys) {
      return res.status(429).send('Cache capacity reached');
    }

    // Generate new content
    const content = await generatePageContent(req.path);
    const title = formatTitle(req.path);

    // Track page view
    if (!isCrawler(userAgent)) {
      await Analytics.trackPageView({
        path: req.path,
        referrer: req.get('referrer'),
        searchTerm: req.query.q || null,
        userAgent,
        ipAddress: clientIP
      });
    }
    
    const htmlPage = createHtmlPage(content, { title });
    
    // Cache the result
    await pageCache.set(req.path, htmlPage);
    
    // Increment visit counter
    incrementVisits(req.path);
    
    res.send(htmlPage);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while generating the content');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send('An unexpected error occurred');
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
