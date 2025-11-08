import { create } from 'zustand';
import { WindowState, App, FileSystemNode, Settings } from '../types';

interface AppStore {
  windows: WindowState[];
  apps: App[];
  activeWindowId: string | null;
  nextZIndex: number;
  addWindow: (appId: string, title: string) => void;
  closeWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<WindowState>) => void;
  setActiveWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  registerApp: (app: App) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  windows: [],
  apps: [],
  activeWindowId: null,
  nextZIndex: 1,
  addWindow: (appId, title) => {
    const app = useAppStore.getState().apps.find(a => a.id === appId);
    set((state) => {
      const newZIndex = state.nextZIndex + 1;
      const defaultSize = app?.defaultSize || { width: 800, height: 600 };
      const defaultPosition = app?.defaultPosition || { 
        x: Math.random() * 200 + 100, 
        y: Math.random() * 100 + 100 
      };
      const newWindow: WindowState = {
        id: `${appId}-${Date.now()}`,
        appId,
        title,
        x: defaultPosition.x,
        y: defaultPosition.y,
        width: defaultSize.width,
        height: defaultSize.height,
        minimized: false,
        maximized: false,
        zIndex: newZIndex,
      };
      return {
        windows: [...state.windows, newWindow],
        activeWindowId: newWindow.id,
        nextZIndex: newZIndex,
      };
    });
  },
  closeWindow: (id) => set((state) => ({
    windows: state.windows.filter(w => w.id !== id),
    activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
  })),
  updateWindow: (id, updates) => set((state) => ({
    windows: state.windows.map(w => w.id === id ? { ...w, ...updates } : w),
  })),
  setActiveWindow: (id) => set((state) => {
    const window = state.windows.find(w => w.id === id);
    if (!window) return state;
    const newZIndex = state.nextZIndex + 1;
    return {
      activeWindowId: id,
      nextZIndex: newZIndex,
      windows: state.windows.map(w => 
        w.id === id ? { ...w, zIndex: newZIndex } : w
      ),
    };
  }),
  minimizeWindow: (id) => set((state) => ({
    windows: state.windows.map(w => 
      w.id === id ? { ...w, minimized: !w.minimized } : w
    ),
  })),
  maximizeWindow: (id) => set((state) => {
    const windowState = state.windows.find(w => w.id === id);
    if (!windowState) return state;
    const isMaximizing = !windowState.maximized;
    return {
      windows: state.windows.map(w => 
        w.id === id ? { 
          ...w, 
          maximized: isMaximizing,
        } : w
      ),
    };
  }),
  registerApp: (app) => set((state) => ({
    apps: [...state.apps.filter(a => a.id !== app.id), app],
  })),
}));

interface FileSystemStore {
  nodes: FileSystemNode[];
  currentPath: string[];
  loadNodes: () => Promise<void>;
  createNode: (name: string, type: 'file' | 'folder', parentId: string | null) => Promise<void>;
  deleteNode: (id: string) => Promise<void>;
  renameNode: (id: string, newName: string) => Promise<void>;
  updateFileContent: (id: string, content: string) => Promise<void>;
  getNode: (id: string) => FileSystemNode | undefined;
  getChildren: (parentId: string | null) => FileSystemNode[];
  navigateTo: (path: string[]) => void;
}

export const useFileSystemStore = create<FileSystemStore>((set, get) => ({
  nodes: [],
  currentPath: [],
  loadNodes: async () => {
    const { FileSystemService } = await import('../services/filesystem');
    const nodes = await FileSystemService.getAllNodes();
    set({ nodes });
  },
  createNode: async (name, type, parentId) => {
    const { FileSystemService } = await import('../services/filesystem');
    await FileSystemService.createNode(name, type, parentId);
    const nodes = await FileSystemService.getAllNodes();
    set({ nodes });
  },
  deleteNode: async (id) => {
    const { FileSystemService } = await import('../services/filesystem');
    await FileSystemService.deleteNode(id);
    const nodes = await FileSystemService.getAllNodes();
    set({ nodes });
  },
  renameNode: async (id, newName) => {
    const { FileSystemService } = await import('../services/filesystem');
    await FileSystemService.renameNode(id, newName);
    const nodes = await FileSystemService.getAllNodes();
    set({ nodes });
  },
  updateFileContent: async (id, content) => {
    const { FileSystemService } = await import('../services/filesystem');
    await FileSystemService.updateFileContent(id, content);
    const nodes = await FileSystemService.getAllNodes();
    set({ nodes });
  },
  getNode: (id) => get().nodes.find(n => n.id === id),
  getChildren: (parentId) => get().nodes.filter(n => n.parentId === parentId),
  navigateTo: (path) => set({ currentPath: path }),
}));

interface SettingsStore {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  loadSettings: () => void;
}

const defaultSettings: Settings = {
  wallpaper: '',
  darkMode: false,
  dockSize: 60,
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: defaultSettings,
  updateSettings: (updates) => {
    const newSettings = { ...useSettingsStore.getState().settings, ...updates };
    localStorage.setItem('webos-settings', JSON.stringify(newSettings));
    set({ settings: newSettings });
  },
  loadSettings: () => {
    const stored = localStorage.getItem('webos-settings');
    if (stored) {
      try {
        set({ settings: JSON.parse(stored) });
      } catch {
        set({ settings: defaultSettings });
      }
    }
  },
}));

