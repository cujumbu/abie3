export const styles = `
  :root {
    --primary-gradient: linear-gradient(135deg, #1a365d 0%, #3b82f6 100%);
    --accent-1: #10B981;
    --accent-2: #F59E0B;
    --accent-3: #EC4899;
    --accent-4: #8B5CF6;
    --accent-5: #EF4444;
  }

  /* Base Layout */
  .hero-section {
    background: var(--primary-gradient);
    position: relative;
    overflow: hidden;
    padding: 6rem 2rem;
  }

  .hero-content {
    position: relative;
    z-index: 1;
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }

  .hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    color: white;
    margin-bottom: 1rem;
    line-height: 1.2;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
  }

  .content-container {
    max-width: 1200px;
    margin: -4rem auto 2rem;
    position: relative;
    z-index: 2;
    padding: 0 2rem;
  }

  .main-content {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    padding: 3rem;
    overflow-x: hidden;
  }

  /* Timeline Component */
  .timeline-container {
    margin: 2rem 0;
    padding: 1rem 0;
  }

  .timeline-item {
    position: relative;
    padding-left: 2rem;
    margin-bottom: 2rem;
    border-left: 2px solid #3b82f6;
  }

  .timeline-item:last-child {
    margin-bottom: 0;
  }

  .timeline-dot {
    position: absolute;
    left: -0.5rem;
    top: 0.25rem;
    width: 1rem;
    height: 1rem;
    background: var(--accent-2);
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 0 0 2px var(--accent-2);
  }

  .timeline-content {
    background: white;
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    margin: 2rem 0;
  }

  .stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    border-top: 4px solid var(--accent-1);
  }

  .stat-card:nth-child(2) { border-top-color: var(--accent-2); }
  .stat-card:nth-child(3) { border-top-color: var(--accent-3); }

  /* Features Grid */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin: 2rem 0;
  }

  .feature-card {
    background: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    border-left: 4px solid var(--accent-1);
  }

  .feature-card:nth-child(2) { border-left-color: var(--accent-2); }
  .feature-card:nth-child(3) { border-left-color: var(--accent-3); }
  .feature-card:nth-child(4) { border-left-color: var(--accent-4); }

  /* Quiz Component */
  .quiz-container {
    margin: 2rem 0;
    padding: 1.5rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .quiz-option {
    width: 100%;
    text-align: left;
    padding: 1rem;
    margin: 0.5rem 0;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    background: white;
    transition: all 0.2s;
  }

  .quiz-option:hover {
    background: #f3f4f6;
    transform: translateX(0.25rem);
  }

  .quiz-option.correct {
    background: #dcfce7;
    border-color: var(--accent-1);
    color: var(--accent-1);
  }

  .quiz-option.incorrect {
    background: #fee2e2;
    border-color: var(--accent-5);
    color: var(--accent-5);
  }

  /* Links */
  .internal-link::before {
    content: '→';
    display: inline-block;
    margin-right: 0.25em;
    color: var(--accent-4);
  }

  .external-link::after {
    content: '↗';
    display: inline-block;
    margin-left: 0.25em;
    font-size: 0.875em;
    color: var(--accent-4);
  }

  /* Markdown Styles */
  .markdown-body {
    font-size: 16px;
    line-height: 1.6;
  }

  .markdown-body h1 { font-size: 2em; font-weight: 700; margin-bottom: 1em; }
  .markdown-body h2 { font-size: 1.5em; font-weight: 600; margin: 2em 0 1em; }
  .markdown-body h3 { font-size: 1.25em; font-weight: 600; margin: 1.5em 0 0.75em; }
  .markdown-body p { margin-bottom: 1em; }
  .markdown-body ul, .markdown-body ol { padding-left: 2em; margin-bottom: 1em; }

  /* Responsive Design */
  @media (max-width: 768px) {
    .hero-title {
      font-size: 2.5rem;
    }

    .content-container {
      margin-top: -2rem;
      padding: 0 1rem;
    }

    .main-content {
      padding: 1.5rem;
    }

    .stats-grid,
    .features-grid {
      grid-template-columns: 1fr;
    }

    .timeline-item {
      padding-left: 1.5rem;
    }
  }
`;
