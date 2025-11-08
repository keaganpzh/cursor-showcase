import { App } from '../types';
import Finder from '../components/apps/Finder';
import TextEditor from '../components/apps/TextEditor';
import Terminal from '../components/apps/Terminal';
import Settings from '../components/apps/Settings';
import Browser from '../components/apps/Browser';

export const registerApps = (registerApp: (app: App) => void) => {
  registerApp({
    id: 'finder',
    name: 'Finder',
    icon: '📁',
    component: Finder,
    defaultSize: { width: 900, height: 600 },
  });

  registerApp({
    id: 'texteditor',
    name: 'Text Editor',
    icon: '📝',
    component: TextEditor,
    defaultSize: { width: 800, height: 600 },
  });

  registerApp({
    id: 'terminal',
    name: 'Terminal',
    icon: '💻',
    component: Terminal,
    defaultSize: { width: 700, height: 500 },
  });

  registerApp({
    id: 'settings',
    name: 'Settings',
    icon: '⚙️',
    component: Settings,
    defaultSize: { width: 600, height: 500 },
  });

  registerApp({
    id: 'browser',
    name: 'Browser',
    icon: '🌐',
    component: Browser,
    defaultSize: { width: 1000, height: 700 },
  });
};

