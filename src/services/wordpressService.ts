/**
 * WordPress Integration Service
 * 
 * This service allows the CBTV Hub to fetch content dynamically from a WordPress REST API.
 * To use this, set VITE_WP_API_URL in your environment variables.
 * Example: VITE_WP_API_URL=https://your-wordpress-site.com/wp-json
 */

export interface WPPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  link: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
    }>;
  };
}

const WP_API_URL = import.meta.env.VITE_WP_API_URL;

export const wordpressService = {
  async getLatestPosts(limit = 5): Promise<WPPost[]> {
    if (!WP_API_URL) return [];
    try {
      const response = await fetch(`${WP_API_URL}/wp/v2/posts?per_page=${limit}&_embed`);
      if (!response.ok) throw new Error('WP API Error');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch WP posts:', error);
      return [];
    }
  },

  async getPageBySlug(slug: string): Promise<WPPost | null> {
    if (!WP_API_URL) return null;
    try {
      const response = await fetch(`${WP_API_URL}/wp/v2/pages?slug=${slug}&_embed`);
      const data = await response.json();
      return data[0] || null;
    } catch (error) {
      console.error(`Failed to fetch WP page (${slug}):`, error);
      return null;
    }
  }
};
