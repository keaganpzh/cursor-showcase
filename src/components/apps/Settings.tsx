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
    <div className="h-full overflow-auto p-8" style={{ background: '#f5f5f7' }}>
      <h1 className="text-3xl font-semibold mb-8" style={{ color: '#1d1d1f' }}>Settings</h1>
      
      <div className="space-y-6 max-w-3xl">
        <div 
          className="rounded-2xl p-6"
          style={{
            background: 'white',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            border: '0.5px solid rgba(0, 0, 0, 0.1)',
          }}
        >
          <h2 className="text-xl font-semibold mb-6" style={{ color: '#1d1d1f' }}>Appearance</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-4" style={{ color: '#1d1d1f' }}>Wallpaper</label>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {presetWallpapers.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setLocalWallpaper(url);
                    updateSettings({ wallpaper: url });
                  }}
                  className={`aspect-video rounded-xl overflow-hidden transition-all duration-200 ${
                    localWallpaper === url ? 'ring-2 ring-blue-500 ring-offset-2' : 'ring-1 ring-gray-200'
                  }`}
                  style={{
                    boxShadow: localWallpaper === url 
                      ? '0 4px 12px rgba(0, 122, 255, 0.3)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <img src={url} alt={`Wallpaper ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <label className="inline-block px-4 py-2 text-xs font-medium text-white rounded-md cursor-pointer transition-all duration-150"
              style={{
                background: '#007aff',
                border: '0.5px solid rgba(0, 0, 0, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#0051d5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#007aff';
              }}
            >
              Choose Custom Image
              <input
                type="file"
                accept="image/*"
                onChange={handleWallpaperChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => updateSettings({ darkMode: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                style={{ accentColor: '#007aff' }}
              />
              <span className="text-sm font-medium" style={{ color: '#1d1d1f' }}>Dark Mode</span>
            </label>
          </div>
        </div>

        <div 
          className="rounded-2xl p-6"
          style={{
            background: 'white',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            border: '0.5px solid rgba(0, 0, 0, 0.1)',
          }}
        >
          <h2 className="text-xl font-semibold mb-6" style={{ color: '#1d1d1f' }}>Dock</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-3" style={{ color: '#1d1d1f' }}>
              Dock Size: <span className="text-blue-600">{settings.dockSize}px</span>
            </label>
            <input
              type="range"
              min="40"
              max="100"
              value={settings.dockSize}
              onChange={(e) => updateSettings({ dockSize: parseInt(e.target.value) })}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: 'linear-gradient(to right, #007aff 0%, #007aff ' + (settings.dockSize - 40) / 60 * 100 + '%, #e5e5e7 ' + (settings.dockSize - 40) / 60 * 100 + '%, #e5e5e7 100%)',
                accentColor: '#007aff',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

