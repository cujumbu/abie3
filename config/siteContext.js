export const siteContext = {
  mainTopic: 'Maritime',
  // Cache configuration (in seconds)
  cache: {
    ttl: 5184000,  // 60 days (2 months)
    checkperiod: 600,  // Check for expired keys every 10 minutes
    maxKeys: 1000  // Maximum number of pages to cache
  },
  context: `Focus on maritime-related content including:
    - Naval History and Heritage
    - Navigation and Maritime Technology
    - Ship Engineering and Design
    - Maritime Law and Regulations
    - Marine Science and Research
    - Port Operations and Logistics
    - Maritime Education and Training
    - Vessel Types and Classifications
    - Maritime Safety and Security
    - Ocean Conservation and Environment`,
  relatedTopicsScope: [
    'navigation',
    'naval-history',
    'maritime-technology',
    'marine-engineering',
    'maritime-law',
    'marine-science',
    'vessel-types',
    'maritime-education',
    'seamanship',
    'oceanography',
    'port-operations',
    'maritime-safety',
    'ship-design',
    'maritime-logistics',
    'marine-conservation',
    'maritime-security',
    'naval-architecture',
    'maritime-training',
    'maritime-regulations',
    'marine-biology',
    'maritime-communications',
    'maritime-navigation',
    'maritime-research',
    'maritime-industry',
    'maritime-trade'
  ],
  // Additional keywords that indicate topic relevance
  relevanceKeywords: [
    'ship', 'boat', 'vessel', 'sea', 'ocean', 'marine', 'maritime', 'naval',
    'port', 'harbor', 'coast', 'nautical', 'sailing', 'navigation'
  ]
};
