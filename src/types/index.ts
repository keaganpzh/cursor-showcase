export type FileType = 'file' | 'folder';

export interface FileSystemItem {
  id: string;
  name: string;
  type: FileType;
  parentId: string | null;
  content?: string;
  createdAt: Date;
  modifiedAt: Date;
}

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  data?: Record<string, unknown>;
}

export interface Application {
  id: string;
  name: string;
  icon: string;
  component: string;
}

export interface OSSettings {
  wallpaper: string;
  isDarkMode: boolean;
  dockSize: number;
}

