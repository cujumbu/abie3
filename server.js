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
    const stats = await Analytics.getStats();
    if (!stats) {
      return res.status(500).send('Error fetching analytics');
    }
    
    // Render admin dashboard
    const adminHtml = createHtmlPage(`
      # Analytics Dashboard

      ## Overview
      Total Views (Last 30 Days): ${stats.totalViews}

      ## Most Viewed Pages
      ${Object.entries(stats.pageViews)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([path, views]) => `- ${path}: ${views} views`)
        .join('\n')}

      ## Top Referrers
      ${Object.entries(stats.topReferrers)
        .sort(([,a], [,b]) => b - a)
        .map(([referrer, count]) => `- ${referrer}: ${count} visits`)
        .join('\n')}
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
