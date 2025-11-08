import { create } from 'zustand';
import { WindowState } from '@/types';

interface WindowStore {
  windows: WindowState[];
  nextZIndex: number;
  addWindow: (window: Omit<WindowState, 'id' | 'zIndex' | 'isMinimized' | 'isMaximized'>) => string;
  removeWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<WindowState>) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  getWindow: (id: string) => WindowState | undefined;
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  nextZIndex: 100,

  addWindow: (windowData) => {
    const id = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newWindow: WindowState = {
      ...windowData,
      id,
      zIndex: get().nextZIndex,
      isMinimized: false,
      isMaximized: false,
    };

    set((state) => ({
      windows: [...state.windows, newWindow],
      nextZIndex: state.nextZIndex + 1,
    }));

    return id;
  },

  removeWindow: (id) => {
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
    }));
  },

  updateWindow: (id, updates) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
    }));
  },

  focusWindow: (id) => {
    const currentZIndex = get().nextZIndex;
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, zIndex: currentZIndex } : w
      ),
      nextZIndex: currentZIndex + 1,
    }));
  },

  minimizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
      ),
    }));
  },

  maximizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id
          ? {
              ...w,
              isMaximized: !w.isMaximized,
              x: w.isMaximized ? w.x : 0,
              y: w.isMaximized ? w.y : 28,
              width: w.isMaximized ? w.width : window.innerWidth,
              height: w.isMaximized ? w.height : window.innerHeight - 28 - 80,
            }
          : w
      ),
    }));
  },

  getWindow: (id) => {
    return get().windows.find((w) => w.id === id);
  },
}));

