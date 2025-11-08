import { create } from 'zustand';
import { Bookmark, HistoryEntry } from '../types';
import { BrowserService, NavigateResponse } from '../services/browser';

interface BrowserStore {
  currentUrl: string;
  currentTitle: string;
  currentHtml: string;
  isLoading: boolean;
  error: string | null;
  
  history: string[];
  historyIndex: number;
  
  bookmarks: Bookmark[];
  browsingHistory: HistoryEntry[];
  
  canGoBack: boolean;
  canGoForward: boolean;
  
  navigate: (url: string, skipHistory?: boolean) => Promise<void>;
  goBack: () => Promise<void>;
  goForward: () => Promise<void>;
  refresh: () => Promise<void>;
  
  loadBookmarks: () => Promise<void>;
  addBookmark: (title: string, url: string, favicon?: string) => Promise<void>;
  removeBookmark: (id: number) => Promise<void>;
  isBookmarked: (url: string) => boolean;
  
  loadHistory: () => Promise<void>;
  clearHistoryEntry: (id: number) => Promise<void>;
  
  search: (query: string) => Promise<void>;
  
  setError: (error: string | null) => void;
}

export const useBrowserStore = create<BrowserStore>((set, get) => ({
  currentUrl: '',
  currentTitle: '',
  currentHtml: '',
  isLoading: false,
  error: null,
  
  history: [],
  historyIndex: -1,
  
  bookmarks: [],
  browsingHistory: [],
  
  canGoBack: false,
  canGoForward: false,
  
  navigate: async (url: string, skipHistory: boolean = false) => {
    const state = get();
    set({ isLoading: true, error: null });
    
    try {
      const result: NavigateResponse = await BrowserService.navigate(url);
      
      let newHistory = state.history;
      let newIndex = state.historyIndex;
      
      if (!skipHistory) {
        newHistory = [...state.history.slice(0, state.historyIndex + 1), result.url];
        newIndex = newHistory.length - 1;
      }
      
      set({
        currentUrl: result.url,
        currentTitle: result.title,
        currentHtml: result.html,
        history: newHistory,
        historyIndex: newIndex,
        isLoading: false,
        error: null,
        canGoBack: newIndex > 0,
        canGoForward: skipHistory ? (newIndex < newHistory.length - 1) : false,
      });
      
      await get().loadHistory();
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to navigate',
      });
    }
  },
  
  goBack: async () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const url = state.history[newIndex];
      set({ 
        historyIndex: newIndex,
        canGoBack: newIndex > 0,
        canGoForward: newIndex < state.history.length - 1,
      });
      await get().navigate(url, true);
    }
  },
  
  goForward: async () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      const url = state.history[newIndex];
      set({ 
        historyIndex: newIndex,
        canGoBack: newIndex > 0,
        canGoForward: newIndex < state.history.length - 1,
      });
      await get().navigate(url, true);
    }
  },
  
  refresh: async () => {
    const state = get();
    if (state.currentUrl) {
      await get().navigate(state.currentUrl);
    }
  },
  
  loadBookmarks: async () => {
    try {
      const bookmarks = await BrowserService.getBookmarks();
      set({ bookmarks });
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    }
  },
  
  addBookmark: async (title: string, url: string, favicon?: string) => {
    try {
      const bookmark = await BrowserService.addBookmark(title, url, favicon);
      set((state) => ({
        bookmarks: [...state.bookmarks, bookmark],
      }));
    } catch (error) {
      throw error;
    }
  },
  
  removeBookmark: async (id: number) => {
    try {
      await BrowserService.deleteBookmark(id);
      set((state) => ({
        bookmarks: state.bookmarks.filter((b) => b.id !== id),
      }));
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
    }
  },
  
  isBookmarked: (url: string) => {
    return get().bookmarks.some((b) => b.url === url);
  },
  
  loadHistory: async () => {
    try {
      const history = await BrowserService.getHistory();
      set({ browsingHistory: history });
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  },
  
  clearHistoryEntry: async (id: number) => {
    try {
      await BrowserService.deleteHistoryEntry(id);
      set((state) => ({
        browsingHistory: state.browsingHistory.filter((h) => h.id !== id),
      }));
    } catch (error) {
      console.error('Failed to clear history entry:', error);
    }
  },
  
  search: async (query: string) => {
    const state = get();
    set({ isLoading: true, error: null });
    
    try {
      const result: NavigateResponse = await BrowserService.search(query);
      
      const newHistory = [...state.history.slice(0, state.historyIndex + 1), result.url];
      const newIndex = newHistory.length - 1;
      
      set({
        currentUrl: result.url,
        currentTitle: result.title,
        currentHtml: result.html,
        history: newHistory,
        historyIndex: newIndex,
        isLoading: false,
        error: null,
        canGoBack: newIndex > 0,
        canGoForward: false,
      });
      
      await get().loadHistory();
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to search',
      });
    }
  },
  
  setError: (error: string | null) => {
    set({ error });
  },
}));

