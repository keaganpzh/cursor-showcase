import { useState } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { Monitor, Moon, Sun, Maximize } from 'lucide-react';

interface SettingsProps {
  windowId: string;
}

export default function Settings({ windowId }: SettingsProps) {
  const { settings, updateSettings } = useOSStore();
  const [activeTab, setActiveTab] = useState<'appearance' | 'display'>('appearance');

  const wallpapers = [
    { name: 'Default', url: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=1920&q=80' },
    { name: 'Mountains', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80' },
    { name: 'Ocean', url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&q=80' },
    { name: 'Forest', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80' },
    { name: 'Desert', url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80' },
    { name: 'Aurora', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80' },
  ];

  return (
    <div className="h-full flex bg-white dark:bg-gray-900">
      <div className="w-48 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`w-full text-left px-4 py-2 rounded-lg mb-2 transition-colors ${
              activeTab === 'appearance'
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Monitor size={16} className="inline mr-2" />
            Appearance
          </button>
          <button
            onClick={() => setActiveTab('display')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'display'
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Maximize size={16} className="inline mr-2" />
            Display
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {activeTab === 'appearance' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Appearance</h2>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">Theme</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => updateSettings({ isDarkMode: false })}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-colors ${
                    !settings.isDarkMode
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Sun size={20} />
                  <span className="text-gray-900 dark:text-gray-100">Light</span>
                </button>
                <button
                  onClick={() => updateSettings({ isDarkMode: true })}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-colors ${
                    settings.isDarkMode
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Moon size={20} />
                  <span className="text-gray-900 dark:text-gray-100">Dark</span>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">Wallpaper</h3>
              <div className="grid grid-cols-3 gap-4">
                {wallpapers.map((wallpaper) => (
                  <button
                    key={wallpaper.name}
                    onClick={() => updateSettings({ wallpaper: wallpaper.url })}
                    className={`relative overflow-hidden rounded-lg border-2 transition-all hover:scale-105 ${
                      settings.wallpaper === wallpaper.url
                        ? 'border-blue-500 shadow-lg'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <img
                      src={wallpaper.url}
                      alt={wallpaper.name}
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2">
                      {wallpaper.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'display' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Display</h2>
            
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">Dock Size</h3>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">Small</span>
                <input
                  type="range"
                  min="48"
                  max="96"
                  step="8"
                  value={settings.dockSize}
                  onChange={(e) => updateSettings({ dockSize: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Large</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-12">
                  {settings.dockSize}px
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

