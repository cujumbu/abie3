import wikipedia from 'wikipedia';

export const fetchWikipediaData = async (topic) => {
  try {
    // Try exact match first
    const page = await wikipedia.page(topic);
    const summary = await page.summary();
    return {
      title: summary.title,
      extract: summary.extract,
      url: summary.content_urls?.desktop?.page || ''
    };
  } catch (error) {
    try {
      // If exact match fails, try search
      const searchResults = await wikipedia.search(topic);
      if (searchResults?.results?.length > 0) {
        const firstResult = await wikipedia.page(searchResults.results[0].title);
        const summary = await firstResult.summary();
        return {
          title: summary.title,
          extract: summary.extract,
          url: summary.content_urls?.desktop?.page || ''
        };
      }
    } catch (searchError) {
      console.log(`No Wikipedia results found for: ${topic}`);
    }
    // Return empty data if nothing found
    return {
      title: topic,
      extract: '',
      url: ''
    };
  }
};