import express from 'express';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';
import { generatePageContent } from './utils/contentGenerator.js';
import { createHtmlPage } from './utils/templateEngine.js';

// Initialize environment variables
dotenv.config();

// Initialize Express
const app = express();
const port = process.env.PORT || 3000;

// Initialize cache (TTL: 24 hours)
const pageCache = new NodeCache({ stdTTL: 86400 });

// Main route handler
app.get('*', async (req, res) => {
  try {
    if (req.path === '/') {
      return res.send('Welcome to the AI Content Generator. Enter any path to generate content!');
    }

    // Check cache first
    const cachedContent = pageCache.get(req.path);
    if (cachedContent) {
      return res.send(cachedContent);
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