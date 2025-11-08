import { useState } from 'react';
import { useAppStore } from '../../stores';
import { App } from '../../types';
import Finder from './Finder';
import TextEditor from './TextEditor';
import Notes from './Notes';
import Terminal from './Terminal';
import Browser from './Browser';
import Settings from './Settings';
import { 
  AiFillFolder, 
  AiFillEdit, 
  AiFillCode, 
  AiFillSetting, 
  AiOutlineGlobal,
  AiOutlineFileText,
  AiOutlineDownload,
  AiOutlineCheck
} from 'react-icons/ai';

interface StoreApp {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  version: string;
  size: string;
  component: React.ComponentType;
  defaultSize?: { width: number; height: number };
}

const availableApps: StoreApp[] = [
  {
    id: 'finder',
    name: 'Finder',
    description: 'File manager for browsing and organizing your files',
    icon: <AiFillFolder className="text-4xl" />,
    category: 'Productivity',
    version: '1.0.0',
    size: '2.5 MB',
    component: Finder,
    defaultSize: { width: 900, height: 600 },
  },
  {
    id: 'texteditor',
    name: 'Text Editor',
    description: 'Simple text editor for creating and editing files',
    icon: <AiFillEdit className="text-4xl" />,
    category: 'Productivity',
    version: '1.0.0',
    size: '1.8 MB',
    component: TextEditor,
    defaultSize: { width: 800, height: 600 },
  },
  {
    id: 'notes',
    name: 'Notes',
    description: 'Take notes and keep your thoughts organized',
    icon: <AiOutlineFileText className="text-4xl" />,
    category: 'Productivity',
    version: '1.0.0',
    size: '1.2 MB',
    component: Notes,
    defaultSize: { width: 800, height: 600 },
  },
  {
    id: 'terminal',
    name: 'Terminal',
    description: 'Command-line interface for advanced users',
    icon: <AiFillCode className="text-4xl" />,
    category: 'Developer',
    version: '1.0.0',
    size: '3.1 MB',
    component: Terminal,
    defaultSize: { width: 700, height: 500 },
  },
  {
    id: 'browser',
    name: 'Browser',
    description: 'Web browser for surfing the internet',
    icon: <AiOutlineGlobal className="text-4xl" />,
    category: 'Internet',
    version: '1.0.0',
    size: '5.2 MB',
    component: Browser,
    defaultSize: { width: 1000, height: 700 },
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'System preferences and configuration',
    icon: <AiFillSetting className="text-4xl" />,
    category: 'System',
    version: '1.0.0',
    size: '0.8 MB',
    component: Settings,
    defaultSize: { width: 600, height: 500 },
  },
];

export default function AppStore() {
  const { apps, registerApp } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [installingId, setInstallingId] = useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(availableApps.map(app => app.category)))];

  const isInstalled = (appId: string) => {
    return apps.some(app => app.id === appId);
  };

  const handleInstall = async (storeApp: StoreApp) => {
    setInstallingId(storeApp.id);
    
    setTimeout(() => {
      const app: App = {
        id: storeApp.id,
        name: storeApp.name,
        icon: storeApp.icon,
        component: storeApp.component,
        defaultSize: storeApp.defaultSize,
      };
      registerApp(app);
      setInstallingId(null);
    }, 1500);
  };

  const filteredApps = availableApps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col bg-white">
      <div 
        className="border-b p-4"
        style={{
          background: 'linear-gradient(to bottom, #ffffff 0%, #f8f8f8 100%)',
          borderBottom: '0.5px solid rgba(0, 0, 0, 0.1)',
        }}
      >
        <h1 className="text-2xl font-semibold mb-4" style={{ color: '#1d1d1f' }}>App Store</h1>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 text-sm rounded-md border outline-none"
            style={{
              background: 'white',
              border: '0.5px solid rgba(0, 0, 0, 0.1)',
              color: '#1d1d1f',
            }}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 text-sm rounded-md border outline-none"
            style={{
              background: 'white',
              border: '0.5px solid rgba(0, 0, 0, 0.1)',
              color: '#1d1d1f',
            }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {filteredApps.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: '#666' }}>No apps found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApps.map((app) => {
              const installed = isInstalled(app.id);
              const installing = installingId === app.id;
              
              return (
                <div
                  key={app.id}
                  className="rounded-lg border p-4 transition-all duration-150 hover:shadow-lg"
                  style={{
                    background: 'white',
                    border: '0.5px solid rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <div className="flex items-start gap-4 mb-3">
                    <div className="flex-shrink-0 p-3 rounded-lg" style={{ background: '#f5f5f7' }}>
                      {app.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold mb-1 truncate" style={{ color: '#1d1d1f' }}>
                        {app.name}
                      </h3>
                      <p className="text-xs mb-2" style={{ color: '#666' }}>
                        {app.category} • {app.size}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm mb-4" style={{ color: '#666', lineHeight: '1.5' }}>
                    {app.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: '#999' }}>
                      v{app.version}
                    </span>
                    <button
                      onClick={() => handleInstall(app)}
                      disabled={installed || installing}
                      className="px-4 py-2 text-xs font-medium rounded-md transition-all duration-150 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: installed ? '#34c759' : installing ? '#999' : '#007aff',
                        color: 'white',
                        border: '0.5px solid rgba(0, 0, 0, 0.1)',
                      }}
                      onMouseEnter={(e) => {
                        if (!installed && !installing) {
                          e.currentTarget.style.background = '#0051d5';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!installed && !installing) {
                          e.currentTarget.style.background = '#007aff';
                        }
                      }}
                    >
                      {installing ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          Installing...
                        </>
                      ) : installed ? (
                        <>
                          <AiOutlineCheck />
                          Installed
                        </>
                      ) : (
                        <>
                          <AiOutlineDownload />
                          Install
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

