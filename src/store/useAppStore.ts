import { create } from 'zustand';
import { Application } from '@/types';

interface AppStore {
  applications: Application[];
  dockApps: string[];
}

export const useAppStore = create<AppStore>(() => ({
  applications: [
    { id: 'finder', name: 'Finder', icon: '📁', component: 'Finder' },
    { id: 'text-editor', name: 'Text Editor', icon: '📝', component: 'TextEditor' },
    { id: 'terminal', name: 'Terminal', icon: '⌘', component: 'Terminal' },
    { id: 'settings', name: 'Settings', icon: '⚙️', component: 'Settings' },
    { id: 'browser', name: 'Browser', icon: '🌐', component: 'Browser' },
  ],
  dockApps: ['finder', 'text-editor', 'terminal', 'settings', 'browser'],
}));

