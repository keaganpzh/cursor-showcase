const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
    const response = await fetch(`${API_BASE_URL}/api/browser/bookmarks`);
    if (!response.ok) {
      throw new Error('Failed to fetch bookmarks');
    }
    return response.json();
  },

  async addBookmark(title: string, url: string, favicon?: string): Promise<Bookmark> {
    const response = await fetch(`${API_BASE_URL}/api/browser/bookmarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, url, favicon }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to add bookmark' }));
      throw new Error(error.detail || 'Failed to add bookmark');
    }
    
    return response.json();
  },

  async deleteBookmark(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/browser/bookmarks/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete bookmark');
    }
  },

  async getHistory(limit: number = 50): Promise<HistoryEntry[]> {
    const response = await fetch(`${API_BASE_URL}/api/browser/history?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch history');
    }
    return response.json();
  },

  async deleteHistoryEntry(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/browser/history/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete history entry');
    }
  },

  async addHistoryEntry(url: string, title: string): Promise<HistoryEntry> {
    const response = await fetch(`${API_BASE_URL}/api/browser/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, title }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to add history entry' }));
      throw new Error(error.detail || 'Failed to add history entry');
    }
    
    return response.json();
  },
};

