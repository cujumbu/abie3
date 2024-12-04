import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export class Analytics {
  static async trackPageView(data) {
    const { error } = await supabase
      .from('page_analytics')
      .insert({
        path: data.path,
        referrer: data.referrer,
        search_term: data.searchTerm,
        user_agent: data.userAgent,
        ip_address: data.ipAddress
      });

    if (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  static async getStats(days = 30) {
    const { data: views, error: viewsError } = await supabase
      .from('page_analytics')
      .select('path, visited_at')
      .gte('visited_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('visited_at', { ascending: false });

    if (viewsError) {
      console.error('Analytics stats error:', viewsError);
      return null;
    }

    // Group by path
    const pageViews = views.reduce((acc, view) => {
      acc[view.path] = (acc[view.path] || 0) + 1;
      return acc;
    }, {});

    // Get top referrers
    const { data: referrers, error: referrersError } = await supabase
      .from('page_analytics')
      .select('referrer')
      .not('referrer', 'is', null)
      .limit(10);

    if (referrersError) {
      console.error('Referrers stats error:', referrersError);
      return null;
    }

    const referrerStats = referrers.reduce((acc, { referrer }) => {
      acc[referrer] = (acc[referrer] || 0) + 1;
      return acc;
    }, {});

    return {
      totalViews: views.length,
      pageViews,
      topReferrers: referrerStats
    };
  }
}
