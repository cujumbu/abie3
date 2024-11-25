export const siteContext = {
  mainTopic: 'Maritime',
  index: {
    enabled: true,
    path: '/custom/index.html',
    fallback: true
  },
  site: {
    name: 'SeaBooks',
    tagline: 'Your Complete Maritime Knowledge Hub',
    description: "Explore the world's most comprehensive collection of maritime literature, research, and historical documents",
    logo: {
      type: 'text',
      content: '⚓',
      text: 'SeaBooks'
    },
    theme: {
      primary: '#3b82f6',
      secondary: '#1a365d',
      accent: '#10B981',
      headerGradient: 'linear-gradient(135deg, #1a365d 0%, #3b82f6 100%)',
      headerTextColor: '#ffffff'
    },
    navigation: {
      primary: [
        { text: 'Historical', href: '/topics/historical-maritime' },
        { text: 'Navigation', href: '/topics/modern-navigation' },
        { text: 'Research', href: '/topics/marine-research' },
        { text: 'Technology', href: '/topics/maritime-technology' },
        { text: 'Engineering', href: '/topics/naval-engineering' }
      ],
      cta: { text: 'Featured Collections', href: '/collections/featured' }
    },
    footer: {
      columns: [
        {
          title: 'Quick Links',
          links: [
            { text: 'About Us', href: '/about' },
            { text: 'Contact', href: '/contact' },
            { text: 'Support', href: '/support' }
          ]
        },
        {
          title: 'Resources',
          links: [
            { text: 'Collections', href: '/collections' },
            { text: 'Research', href: '/research' },
            { text: 'Education', href: '/education' }
          ]
        },
        {
          title: 'Legal',
          links: [
            { text: 'Privacy Policy', href: '/privacy' },
            { text: 'Terms of Service', href: '/terms' },
            { text: 'Licensing', href: '/licensing' }
          ]
        }
      ],
      bottomText: '© 2024 SeaBooks. All rights reserved.'
    }
  },
  cache: {
    ttl: 5184000, // 60 days in seconds
    checkperiod: 600, // Check every 10 minutes
    maxKeys: 1000 // Maximum number of cached pages
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
  relevanceKeywords: [
    'ship', 'boat', 'vessel', 'sea', 'ocean', 'marine', 'maritime', 'naval',
    'port', 'harbor', 'coast', 'nautical', 'sailing', 'navigation'
  ]
};
