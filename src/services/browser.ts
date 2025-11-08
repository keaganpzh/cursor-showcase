const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }
  // Use relative URL for reverse proxy support
  return '';
};

const API_BASE_URL = getApiBaseUrl();

// Helper function to fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout: number = 5000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - backend may be unavailable');
    }
    throw error;
  }
}

export interface Bookmark {
  id: number;
  title: string;
  url: string;
  favicon: string | null;
  createdAt: string;
}

export interface HistoryEntry {
  id: number;
  url: string;
  title: string;
  visitedAt: string;
}

export const BrowserService = {

  async getBookmarks(): Promise<Bookmark[]> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/browser/bookmarks`, {}, 5000);
      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks');
      }
      return response.json();
    } catch (error) {
      console.warn('Failed to fetch bookmarks, returning empty array:', error);
      return [];
    }
  },

  async addBookmark(title: string, url: string, favicon?: string): Promise<Bookmark> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/browser/bookmarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, url, favicon }),
    }, 5000);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to add bookmark' }));
      throw new Error(error.detail || 'Failed to add bookmark');
    }
    
    return response.json();
  },

  async deleteBookmark(id: number): Promise<void> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/browser/bookmarks/${id}`, {
        method: 'DELETE',
      }, 5000);
      
      if (!response.ok) {
        throw new Error('Failed to delete bookmark');
      }
    } catch (error) {
      console.warn('Failed to delete bookmark:', error);
      // Don't throw, allow UI to update optimistically
    }
  },

  async getHistory(limit: number = 50): Promise<HistoryEntry[]> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/browser/history?limit=${limit}`, {}, 5000);
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      return response.json();
    } catch (error) {
      console.warn('Failed to fetch history, returning empty array:', error);
      return [];
    }
  },

  async deleteHistoryEntry(id: number): Promise<void> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/browser/history/${id}`, {
        method: 'DELETE',
      }, 5000);
      
      if (!response.ok) {
        throw new Error('Failed to delete history entry');
      }
    } catch (error) {
      console.warn('Failed to delete history entry:', error);
      // Don't throw, allow UI to update optimistically
    }
  },

  async addHistoryEntry(url: string, title: string): Promise<HistoryEntry> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/browser/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, title }),
      }, 5000);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Failed to add history entry' }));
        throw new Error(error.detail || 'Failed to add history entry');
      }
      
      return response.json();
    } catch (error) {
      // Silently fail - history saving is non-critical
      console.warn('Failed to add history entry (non-critical):', error);
      // Return a mock entry so the caller doesn't break
      return {
        id: Date.now(),
        url,
        title,
        visitedAt: new Date().toISOString(),
      };
    }
  },
};

