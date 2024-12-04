import OpenAI from 'openai';
import { getRandomPrompt } from '../templates/systemPrompts.js';
import { fetchWikipediaData } from './wikipediaEnhancer.js';
import { createStats } from './components/stats.js';
import { createQuiz } from './components/quiz.js';
import { createChart } from './components/chart.js';
import { createFeatures } from './components/features.js';
import { createTimeline } from './components/timeline.js';
import { createFlashcards } from './components/flashcards.js';
import { createSpeedCalculator, createUnitConverter, createFuelCalculator, createDraftCalculator } from './components/maritimeCalculators.js';
import { createVesselDiagram, createPortLayout, createEquipmentSchematic } from './components/maritimeVisuals.js';
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

const processCustomBlocks = (content, currentPath) => {
  let processedContent = content;

  // Helper function to determine diagram type based on path and content
  const getDiagramType = (path, content) => {
    const pathParts = path.toLowerCase().split('/');
    
    // Check for vessel types
    if (pathParts.includes('tanker') || content.toLowerCase().includes('tanker')) {
      return 'tanker';
    }
    if (pathParts.includes('bulk') || pathParts.includes('bulker') || 
        content.toLowerCase().includes('bulk carrier')) {
      return 'bulker';
    }
    
    // Check for equipment types
    if (pathParts.includes('radar') || content.toLowerCase().includes('radar system')) {
      return 'radar';
    }
    if (pathParts.includes('engine') || content.toLowerCase().includes('marine engine')) {
      return 'engine';
    }
    if (pathParts.includes('propulsion') || content.toLowerCase().includes('propulsion system')) {
      return 'propulsion';
    }
    
    return 'container'; // Default type
  };

  // Process calculator blocks
  processedContent = processedContent.replace(/:::speed-calculator:::/g, () => createSpeedCalculator());
  processedContent = processedContent.replace(/:::unit-converter:::/g, () => createUnitConverter());
  processedContent = processedContent.replace(/:::flashcards:::([\s\S]*?):::/g, (match, content) => {
    const cards = content.trim().split('\n').map(line => {
      const [question, answer] = line.split('|').map(s => s.trim());
      return { question, answer };
    });
    return createFlashcards(cards);
  });
  processedContent = processedContent.replace(/:::fuel-calculator:::/g, () => createFuelCalculator());
  processedContent = processedContent.replace(/:::draft-calculator:::/g, () => createDraftCalculator());

  // Process visual blocks
  processedContent = processedContent.replace(/:::vessel-diagram:::([\s\S]*?):::/g, (match, content) => {
    const type = getDiagramType(currentPath, content);
    return createVesselDiagram(type);
  });

  processedContent = processedContent.replace(/:::port-layout:::/g, () => createPortLayout());

  processedContent = processedContent.replace(/:::equipment-schematic:::([\s\S]*?):::/g, (match, content) => {
    const equipment = getDiagramType(currentPath, content);
    return createEquipmentSchematic(equipment);
  });

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
  
  // Process flashcard blocks
  processedContent = processedContent.replace(/:::flashcards:::([\s\S]*?):::/g, (match, content) => {
    const cards = content.trim().split('\n').map(line => {
      const [question, answer] = line.split('|').map(s => s.trim());
      return { question, answer };
    });
    return createFlashcards(cards);
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
[Fuel Calculator](/tools/fuel-calculator): Calculate fuel consumption for voyages
[Draft Calculator](/tools/draft-calculator): Calculate mean draft and trim
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
    
    if (path === '/tools/fuel-calculator') {
      return `# Maritime Fuel Calculator

Calculate estimated fuel consumption for your voyage based on distance, speed, and consumption rate.

:::fuel-calculator:::

## Understanding Fuel Calculations

The fuel consumption calculation takes into account:
- Distance in nautical miles
- Vessel speed in knots
- Daily fuel consumption rate

## Related Topics
/maritime-efficiency
/fuel-management
/vessel-operations`;
    }
    
    if (path === '/tools/draft-calculator') {
      return `# Draft Survey Calculator

Calculate mean draft and trim based on forward and aft draft measurements.

:::draft-calculator:::

## Understanding Draft Measurements

- Mean Draft: Average of forward and aft draft readings
- Trim: Difference between aft and forward drafts
- Positive trim indicates vessel is down by stern
- Negative trim indicates vessel is down by bow

## Related Topics
/vessel-stability
/draft-surveys
/maritime-safety`;
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
        
        When discussing vessel types, port operations, or maritime equipment, include relevant visual diagrams:
        
        1. For vessel discussions:
           :::vessel-diagram:::
           container    # For container ship discussions
           tanker      # For tanker vessel discussions
           bulker      # For bulk carrier discussions
           :::
        
        2. For port operations:
           :::port-layout:::
        
        3. For equipment discussions:
           :::equipment-schematic:::
           radar       # For navigation equipment
           engine      # For engine discussions
           propulsion  # For propulsion systems
           :::
        
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
  content = processCustomBlocks(content, path);
  
  return content;
};
