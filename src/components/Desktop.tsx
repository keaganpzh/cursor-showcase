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
          className="fixed bg-white/90 backdrop-blur-md rounded-lg shadow-lg py-1 z-50 min-w-[180px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={handleChangeWallpaper}
            className="w-full text-left px-4 py-2 hover:bg-blue-500 hover:text-white transition-colors"
          >
            Change Wallpaper
          </button>
        </div>
      )}
    </div>
  );
}

