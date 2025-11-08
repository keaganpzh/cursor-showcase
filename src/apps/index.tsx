import { App } from '../types';
import Finder from '../components/apps/Finder';
import TextEditor from '../components/apps/TextEditor';
import Terminal from '../components/apps/Terminal';
import Settings from '../components/apps/Settings';
import Browser from '../components/apps/Browser';
import Notes from '../components/apps/Notes';
import AppStore from '../components/apps/AppStore';
import { AiFillFolder, AiFillEdit, AiFillCode, AiFillSetting, AiOutlineGlobal, AiOutlineFileText, AiOutlineShopping } from 'react-icons/ai';

export const registerApps = (registerApp: (app: App) => void) => {
  registerApp({
    id: 'finder',
    name: 'Finder',
    icon: <AiFillFolder className="text-2xl" />,
    component: Finder,
    defaultSize: { width: 900, height: 600 },
  });

  registerApp({
    id: 'texteditor',
    name: 'Text Editor',
    icon: <AiFillEdit className="text-2xl" />,
    component: TextEditor,
    defaultSize: { width: 800, height: 600 },
  });

  registerApp({
    id: 'notes',
    name: 'Notes',
    icon: <AiOutlineFileText className="text-2xl" />,
    component: Notes,
    defaultSize: { width: 800, height: 600 },
  });

  registerApp({
    id: 'terminal',
    name: 'Terminal',
    icon: <AiFillCode className="text-2xl" />,
    component: Terminal,
    defaultSize: { width: 700, height: 500 },
  });

  registerApp({
    id: 'settings',
    name: 'Settings',
    icon: <AiFillSetting className="text-2xl" />,
    component: Settings,
    defaultSize: { width: 600, height: 500 },
  });

  registerApp({
    id: 'browser',
    name: 'Browser',
    icon: <AiOutlineGlobal className="text-2xl" />,
    component: Browser,
    defaultSize: { width: 1000, height: 700 },
  });

  registerApp({
    id: 'appstore',
    name: 'App Store',
    icon: <AiOutlineShopping className="text-2xl" />,
    component: AppStore,
    defaultSize: { width: 1000, height: 700 },
  });
};

