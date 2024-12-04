import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export class SupabaseCache {
  constructor() {
    this.tableName = 'page_cache';
  }

  async get(key) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('content, created_at')
      .eq('path', key)
      .single();

    if (error || !data) return null;

    // Check if cache is expired (60 days)
    const now = new Date();
    const created = new Date(data.created_at);
    const daysDiff = (now - created) / (1000 * 60 * 60 * 24);

    if (daysDiff > 60) {
      await this.del(key);
      return null;
    }

    return data.content;
  }

  async set(key, value) {
    const { error } = await supabase
      .from(this.tableName)
      .upsert({
        path: key,
        content: value,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Cache set error:', error);
      return false;
    }
    return true;
  }

  async del(key) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('path', key);

    if (error) {
      console.error('Cache delete error:', error);
      return false;
    }
    return true;
  }

  async getStats() {
    const { count, error } = await supabase
      .from(this.tableName)
      .select('*', { count: 'exact' });

    if (error) {
      console.error('Cache stats error:', error);
      return { keys: 0 };
    }

    return { keys: count || 0 };
  }
}