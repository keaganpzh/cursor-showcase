import { useState } from 'react';
import { useSettingsStore } from '../../stores';

export default function Settings() {
  const { settings, updateSettings } = useSettingsStore();
  const [localWallpaper, setLocalWallpaper] = useState(settings.wallpaper);

  const handleWallpaperChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const wallpaper = event.target?.result as string;
        setLocalWallpaper(wallpaper);
        updateSettings({ wallpaper });
      };
      reader.readAsDataURL(file);
    }
  };

  const presetWallpapers = [
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920',
  ];

  return (
    <div className="h-full overflow-auto bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold mb-4">Appearance</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Wallpaper</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {presetWallpapers.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setLocalWallpaper(url);
                    updateSettings({ wallpaper: url });
                  }}
                  className={`aspect-video rounded-lg overflow-hidden border-2 ${
                    localWallpaper === url ? 'border-blue-500' : 'border-gray-300'
                  }`}
                >
                  <img src={url} alt={`Wallpaper ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleWallpaperChange}
              className="text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => updateSettings({ darkMode: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Dark Mode</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold mb-4">Dock</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Dock Size: {settings.dockSize}px
            </label>
            <input
              type="range"
              min="40"
              max="100"
              value={settings.dockSize}
              onChange={(e) => updateSettings({ dockSize: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

