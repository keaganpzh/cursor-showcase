import { useState, useEffect } from 'react';
import { useSettingsStore } from '../stores';

interface DesktopProps {
  onContextMenu?: (e: React.MouseEvent) => void;
}

export default function Desktop({ onContextMenu }: DesktopProps) {
  const { settings } = useSettingsStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
    onContextMenu?.(e);
  };

  const handleChangeWallpaper = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const { updateSettings } = useSettingsStore.getState();
          updateSettings({ wallpaper: event.target?.result as string });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
    setContextMenu(null);
  };

  return (
    <div
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: settings.wallpaper && (settings.wallpaper.startsWith('http') || settings.wallpaper.startsWith('data:'))
          ? `url(${settings.wallpaper})` 
          : 'none',
        backgroundColor: settings.wallpaper && (settings.wallpaper.startsWith('http') || settings.wallpaper.startsWith('data:'))
          ? 'transparent' 
          : settings.wallpaper || '#1e1e1e',
      }}
      onContextMenu={handleRightClick}
    >
      {contextMenu && (
        <div
          className="fixed z-50 min-w-[180px] rounded-lg overflow-hidden"
          style={{ 
            left: contextMenu.x, 
            top: contextMenu.y,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 0.5px rgba(0, 0, 0, 0.1)',
            border: '0.5px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <button
            onClick={handleChangeWallpaper}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white transition-colors duration-150"
          >
            Change Wallpaper
          </button>
        </div>
      )}
    </div>
  );
}

