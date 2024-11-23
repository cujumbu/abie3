import OpenAI from 'openai';
import { getRandomPrompt } from '../templates/systemPrompts.js';
import { fetchWikipediaData } from './wikipediaEnhancer.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const enforceRootedLinks = (content) => {
  // Replace relative links that don't start with / or http
  return content.replace(/\[([^\]]+)\]\((?!\/|http)([^)]+)\)/g, (match, text, url) => {
    return `[${text}](/${url.trim()})`;
  });
};

const processMarkdownLinks = (content) => {
  // Ensure all internal links have proper text
  return content.replace(/\[\/([^\]]+)\]\(\/([^)]+)\)/g, (match, text, url) => {
    const title = url.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return `[${title}](/${url})`;
  });
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
    max_tokens: Math.floor(Math.random() * (2000 - 1000) + 1000),
    temperature: 0.7 + (Math.random() * 0.3),
    presence_penalty: 0.3,
    frequency_penalty: 0.5
  });

  let content = completion.choices[0].message.content;
  content = enforceRootedLinks(content);
  content = processMarkdownLinks(content);
  
  return content;
};