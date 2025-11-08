export interface WindowState {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
}

export interface App {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType;
  defaultSize?: { width: number; height: number };
  defaultPosition?: { x: number; y: number };
}

export interface FileSystemNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  content?: string;
  createdAt: number;
  modifiedAt: number;
}

export interface Settings {
  wallpaper: string;
  darkMode: boolean;
  dockSize: number;
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

export interface NavigationState {
  currentUrl: string;
  history: string[];
  historyIndex: number;
}

