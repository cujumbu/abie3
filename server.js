import express from 'express';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';
import { generatePageContent } from './utils/contentGenerator.js';
import { createHtmlPage } from './utils/templateEngine.js';
import { siteContext } from './config/siteContext.js';
import { promises as fs } from 'fs';
import path from 'path';

// Initialize environment variables
dotenv.config();

// Initialize Express
const app = express();
const port = process.env.PORT || 3000;

// Initialize cache with configuration from siteContext
const pageCache = new NodeCache({ 
  stdTTL: siteContext.cache?.ttl || 86400,
  checkperiod: siteContext.cache?.checkperiod || 600,
  maxKeys: siteContext.cache?.maxKeys || 1000,
  useClones: false
});

// Rate limiting for crawlers
const crawlerHits = new Map();
const CRAWLER_WINDOW = 3600000; // 1 hour in milliseconds
const CRAWLER_LIMIT = 100; // Maximum requests per hour for crawlers

const isCrawler = (userAgent = '') => {
  return userAgent.toLowerCase().includes('bot') || 
         userAgent.toLowerCase().includes('crawler') ||
         userAgent.toLowerCase().includes('spider');
};

const rateLimitCrawler = (userAgent) => {
  if (!isCrawler(userAgent)) return false;

  const now = Date.now();
  const hits = crawlerHits.get(userAgent) || [];
  
  // Remove old hits outside the window
  const recentHits = hits.filter(time => now - time < CRAWLER_WINDOW);
  
  // Add current hit
  recentHits.push(now);
  crawlerHits.set(userAgent, recentHits);

  return recentHits.length > CRAWLER_LIMIT;
};

// Cache cleanup interval (every hour)
setInterval(() => {
  const now = Date.now();
  crawlerHits.forEach((hits, ua) => {
    const recentHits = hits.filter(time => now - time < CRAWLER_WINDOW);
    if (recentHits.length === 0) {
      crawlerHits.delete(ua);
    } else {
      crawlerHits.set(ua, recentHits);
    }
  });
}, 3600000);

// Try to load custom index file
const loadCustomIndex = async () => {
  if (!siteContext.index?.enabled) return null;
  
  try {
    const indexPath = path.join(process.cwd(), siteContext.index.path);
    const content = await fs.readFile(indexPath, 'utf8');
    return content;
  } catch (error) {
    console.log('Custom index not found:', error.message);
    return null;
  }
};

// Main route handler
app.get('*', async (req, res) => {
  try {
    const userAgent = req.get('user-agent') || '';

    // Check crawler rate limit
    if (rateLimitCrawler(userAgent)) {
      return res.status(429).send('Too Many Requests');
    }

    // Handle root path
    if (req.path === '/') {
      // Try to load custom index
      const customIndex = await loadCustomIndex();
      if (customIndex) {
        return res.send(customIndex);
      }
      
      // Use default welcome message if no custom index or fallback disabled
      if (!siteContext.index?.fallback) {
        return res.send('Welcome to the AI Content Generator. Enter any path to generate content!');
      }
    }

    // Check cache first
    const cachedContent = pageCache.get(req.path);
    if (cachedContent) {
      return res.send(cachedContent);
    }

    // Check if we're at cache capacity for crawlers
    if (isCrawler(userAgent) && pageCache.getStats().keys >= pageCache.options.maxKeys) {
      return res.status(429).send('Cache capacity reached');
    }

    // Generate new content
    const content = await generatePageContent(req.path);
    const title = req.path.substring(1).replace(/-/g, ' ');
    
    const htmlPage = createHtmlPage(content, {
      title: title.charAt(0).toUpperCase() + title.slice(1)
    });
    
    // Cache the result
    pageCache.set(req.path, htmlPage);
    
    res.send(htmlPage);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while generating the content');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
