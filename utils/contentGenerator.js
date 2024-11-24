import OpenAI from 'openai';
import { getRandomPrompt } from '../templates/systemPrompts.js';
import { fetchWikipediaData } from './wikipediaEnhancer.js';
import { createStats } from './components/stats.js';
import { createQuiz } from './components/quiz.js';
import { createChart } from './components/chart.js';
import { createFeatures } from './components/features.js';
import { createTimeline } from './components/timeline.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const enforceRootedLinks = (content) => {
  return content.replace(/\[([^\]]+)\]\((?!\/|http)([^)]+)\)/g, (match, text, url) => {
    return `[${text}](/${url.trim()})`;
  });
};

const processMarkdownLinks = (content) => {
  return content.replace(/\[\/([^\]]+)\]\(\/([^)]+)\)/g, (match, text, url) => {
    const title = url.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return `[${title}](/${url})`;
  });
};

const processCustomBlocks = (content) => {
  const patterns = {
    timeline: /:::timeline:::([\s\S]*?):::/g,
    stats: /:::stats:::([\s\S]*?):::/g,
    quiz: /:::quiz:::([\s\S]*?):::/g,
    chart: /:::chart:::([\s\S]*?):::/g,
    features: /:::features:::([\s\S]*?):::/g
  };

  let processedContent = content;

  // Process each custom block
  Object.entries(patterns).forEach(([type, pattern]) => {
    processedContent = processedContent.replace(pattern, (match, content) => {
      const cleanContent = content.trim();
      switch (type) {
        case 'timeline':
          const events = cleanContent.split('\n').map(line => {
            const [year, ...description] = line.split(' - ');
            return {
              year: year.trim(),
              description: description.join(' - ').trim()
            };
          });
          return createTimeline(events);
        case 'stats':
          const stats = cleanContent.split('\n').map(line => {
            const [label, value] = line.split(':').map(s => s.trim());
            return { label, value };
          });
          return createStats(stats);
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

  // Process internal links in lists
  processedContent = processedContent.replace(/^\s*-\s*\[([^\]]+)\]\((\/[^)]+)\)/gm, (match, text, path) => {
    return `<li><a href="${path}" class="internal-link">${text}</a></li>`;
  });

  // Process plain internal links
  processedContent = processedContent.replace(/\[([^\]]+)\]\((\/[^)]+)\)/g, (match, text, path) => {
    return `<a href="${path}" class="internal-link">${text}</a>`;
  });

  // Remove any pre/code wrapping from timeline components
  processedContent = processedContent.replace(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g, (match, content) => {
    if (content.includes('timeline-container') || content.includes('timeline-item')) {
      return content;
    }
    return match;
  });

  return processedContent;
};

export const generatePageContent = async (path) => {
  const topic = path.replace(/-/g, ' ').substring(1);
  
  let wikiData = { extract: '' };
  try {
    wikiData = await fetchWikipediaData(topic);
  } catch (error) {
    console.log(`Wikipedia data not found for: ${topic}`);
  }
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `${getRandomPrompt()}\n\nAdditional formatting guidelines:
        1. Use proper markdown headers (# for main title, ## for sections)
        2. For timelines, use format: :::timeline:::
           YYYY - Event description
           YYYY - Event description
           :::
        3. For quizzes, use format: :::quiz:::
           Question text
           - Wrong answer
           - Another wrong answer
           *- Correct answer (mark with asterisk)
           - Another wrong answer
           :::
        4. For charts, use format: :::chart:::
           Chart Title
           Label 1|75
           Label 2|50
           Label 3|25
           :::
        5. For statistics, use format: :::stats:::
           Metric 1: Value 1
           Metric 2: Value 2
           Metric 3: Value 3
           :::
        6. For features, use format: :::features:::
           Feature 1: Description
           Feature 2: Description
           Feature 3: Description
           :::
        7. CRITICAL: All internal links MUST start with / (e.g., /topic-name)`
      },
      {
        role: "user",
        content: `Create engaging content about: ${topic}. 
        ${wikiData.extract ? `Include these verified facts: ${wikiData.extract}` : ''}`
      }
    ],
    max_tokens: 12000, // Increased but still within 16,384 limit
    temperature: 0.7 + (Math.random() * 0.3),
    presence_penalty: 0.3,
    frequency_penalty: 0.5
  });

  let content = completion.choices[0].message.content;
  content = enforceRootedLinks(content);
  content = processMarkdownLinks(content);
  content = processCustomBlocks(content);
  
  return content;
};
