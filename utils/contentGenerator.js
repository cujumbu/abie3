import OpenAI from 'openai';
import { getRandomPrompt } from '../templates/systemPrompts.js';
import { fetchWikipediaData } from './wikipediaEnhancer.js';
import { createStats } from './components/stats.js';
import { createQuiz } from './components/quiz.js';
import { createChart } from './components/chart.js';
import { createFeatures } from './components/features.js';
import { createTimeline } from './components/timeline.js';
import { createSpeedCalculator, createUnitConverter } from './components/maritimeCalculators.js';
import { createSpeedCalculator, createUnitConverter } from './components/maritimeCalculators.js';
import { siteContext } from '../config/siteContext.js';

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

const isTopicRelevant = (topic) => {
  const normalizedTopic = topic.toLowerCase();
  const allRelevantKeywords = [
    ...siteContext.relatedTopicsScope,
    ...(siteContext.relevanceKeywords || [])
  ];
  
  return allRelevantKeywords.some(keyword => 
    normalizedTopic.includes(keyword.toLowerCase()) ||
    keyword.toLowerCase().includes(normalizedTopic)
  );
};

const processRelatedTopics = (content) => {
  // First pattern: Markdown list of paths
  content = content.replace(
    /(?:### Related Topics|## Related Topics|#+ Related Topics)\s*(?:\n|$)((?:[-*]?\s*\/[a-z0-9-]+(?:\s*\n|$))+)/gm,
    (match, topics) => {
      const topicLinks = topics
        .trim()
        .split('\n')
        .map(topic => {
          const path = topic.replace(/^[-*]\s*/, '').trim();
          const title = path.substring(1).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          if (!isTopicRelevant(title)) return null;
          return `<li><a href="${path}" class="internal-link">${title}</a></li>`;
        })
        .filter(Boolean)
        .join('\n');

      return topicLinks ? `## Related Topics\n<ul>\n${topicLinks}\n</ul>` : '';
    }
  );

  // Second pattern: Line-separated paths with <br> or newlines
  content = content.replace(
    /(?:### Related Topics|## Related Topics|#+ Related Topics)\s*(?:\n|$)((?:\/[a-z0-9-]+(?:\s*(?:<br>|\n|$))+))/gm,
    (match, topics) => {
      const topicLinks = topics
        .replace(/<br>/g, '\n')
        .trim()
        .split('\n')
        .filter(topic => topic.trim())
        .map(topic => {
          const path = topic.trim();
          const title = path.substring(1).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          if (!isTopicRelevant(title)) return null;
          return `<li><a href="${path}" class="internal-link">${title}</a></li>`;
        })
        .filter(Boolean)
        .join('\n');

      return topicLinks ? `## Related Topics\n<ul>\n${topicLinks}\n</ul>` : '';
    }
  );

  return content;
};

const processCustomBlocks = (content) => {
  let processedContent = content;

  // Process calculator blocks
  processedContent = processedContent.replace(/:::speed-calculator:::/g, () => createSpeedCalculator());
  processedContent = processedContent.replace(/:::unit-converter:::/g, () => createUnitConverter());

  // Process calculator blocks
  processedContent = processedContent.replace(/:::speed-calculator:::/g, () => createSpeedCalculator());
  processedContent = processedContent.replace(/:::unit-converter:::/g, () => createUnitConverter());

  // Process timeline blocks first
  processedContent = processedContent.replace(/:::timeline:::([\s\S]*?):::/g, (match, content) => {
    const events = content.trim().split('\n').map(line => {
      const [year, ...description] = line.split(' - ');
      return {
        year: year.trim(),
        description: description.join(' - ').trim()
      };
    });
    return createTimeline(events);
  });

  // Process other custom blocks
  const patterns = {
    stats: /:::stats:::([\s\S]*?):::/g,
    quiz: /:::quiz:::([\s\S]*?):::/g,
    chart: /:::chart:::([\s\S]*?):::/g,
    features: /:::features:::([\s\S]*?):::/g
  };

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

  // Clean up any remaining pre/code tags around components
  processedContent = processedContent.replace(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g, (match, content) => {
    if (content.includes('timeline-container') || 
        content.includes('stats-grid') || 
        content.includes('features-grid') || 
        content.includes('quiz-container') || 
        content.includes('chart-container')) {
      return content.trim();
    }
    return match;
  });

  // Process external links
  processedContent = processedContent.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (match, text, url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="external-link">${text}</a>`;
  });

  // Process internal links (must come after external links)
  processedContent = processedContent.replace(/\[([^\]]+)\]\(\/([^)]+)\)/g, (match, text, path) => {
    return `<a href="/${path}" class="internal-link">${text}</a>`;
  });

  // Process related topics section
  processedContent = processRelatedTopics(processedContent);

  return processedContent;
};

export const generatePageContent = async (path) => {
  const topic = path.replace(/-/g, ' ').substring(1);
  
  // Handle tools pages
  if (path.startsWith('/tools')) {
    if (path === '/tools') {
      return `# Maritime Tools

## Navigation & Calculation Tools

:::features:::
[Speed Calculator](/tools/speed-calculator): Calculate speed, time, and distance for maritime navigation
[Unit Converter](/tools/unit-converter): Convert between maritime units like nautical miles, kilometers, and knots
:::

## Related Topics
/maritime-navigation
/maritime-calculations
/navigation-systems
/maritime-technology`;
    }
    
    if (path === '/tools/speed-calculator') {
      return `# Maritime Speed Calculator

Use this calculator to determine speed, time, or distance for maritime navigation.

:::speed-calculator:::

## Understanding Maritime Speed Calculations

Speed calculations are fundamental to maritime navigation. The relationship between speed, time, and distance follows these principles:

- Speed = Distance ÷ Time
- Time = Distance ÷ Speed
- Distance = Speed × Time

## Related Topics
/maritime-navigation
/navigation-calculations
/maritime-technology`;
    }
    
    if (path === '/tools/unit-converter') {
      return `# Maritime Unit Converter

Convert between different maritime units of measurement.

:::unit-converter:::

## Common Maritime Conversions

- 1 Nautical Mile = 1.852 Kilometers
- 1 Knot = 1.852 Kilometers per Hour
- 1 Nautical Mile = 1.15078 Statute Miles

## Related Topics
/maritime-units
/navigation-systems
/maritime-calculations`;
    }
  }
  
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
        content: "If the path starts with /tools/, skip the OpenAI content generation and return a predefined tools page layout."
      },
      {
        role: "system",
        content: `${getRandomPrompt()}\n\n${siteContext.context}\n\nAdditional formatting guidelines:
        1. Create engaging, natural titles:
           - Avoid appending phrases like "in Maritime Context" or "in [Topic] Context"
           - Use creative, relevant titles that naturally incorporate the topic
           - Consider using formats like:
             * The Evolution of [Topic]
             * Understanding [Topic]
             * [Topic]: A Comprehensive Guide
             * Modern Approaches to [Topic]
             * [Topic] Essentials
             * Exploring [Topic]
             * [Topic] Fundamentals
             * Advanced [Topic] Concepts
             * [Topic] Best Practices
             * [Topic] Systems and Solutions

        2. Use proper markdown headers (# for main title, ## for sections)
        3. For timelines, use format: :::timeline:::
           YYYY - Event description
           YYYY - Event description
           :::
        4. For quizzes, use format: :::quiz:::
           Question text
           - Wrong answer
           - Another wrong answer
           *- Correct answer (mark with asterisk)
           - Another wrong answer
           :::
        5. For charts, use format: :::chart:::
           Chart Title
           Label 1|75
           Label 2|50
           Label 3|25
           :::
        6. For statistics, use format: :::stats:::
           Metric 1: Value 1
           Metric 2: Value 2
           Metric 3: Value 3
           :::
        7. For features, use format: :::features:::
           Feature 1: Description
           Feature 2: Description
           Feature 3: Description
           :::
        8. For related topics, suggest topics that are relevant to the current content while maintaining connection to the main topic.
           ## Related Topics
           - /topic-one
           - /topic-two
           - /topic-three
           
        Important: While focusing on ${siteContext.mainTopic}, include related topics that are relevant to the current content, maintaining topical relevance.`
      },
      {
        role: "user",
        content: `Create engaging content about: ${topic}. 
        ${wikiData.extract ? `Include these verified facts where relevant: ${wikiData.extract}` : ''}`
      }
    ],
    max_tokens: 12000,
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
