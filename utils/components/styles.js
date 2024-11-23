export const styles = `
  /* Previous styles remain unchanged... */

  /* Timeline Styles */
  .timeline-container {
    position: relative;
    padding: 0;
    max-width: 100%;
    margin: 2rem 0;
  }

  .timeline-item {
    position: relative;
    padding-left: 1.5rem;
    margin-bottom: 1rem;
    border-left: 2px solid #3b82f6;
  }

  .timeline-item:last-child {
    margin-bottom: 0;
  }

  .timeline-dot {
    position: absolute;
    left: -0.3125rem;
    top: 0.375rem;
    width: 0.625rem;
    height: 0.625rem;
    background: var(--accent-2);
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 0 0 2px var(--accent-2);
  }

  /* Rest of the styles remain unchanged... */
`;