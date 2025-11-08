import { useEffect, useState } from 'react';
import { useOSStore } from '@/store/useOSStore';
import MenuBar from './MenuBar';
import Dock from './Dock';
import WindowManager from './WindowManager';
import ContextMenu from './ContextMenu';

interface ContextMenuState {
  x: number;
  y: number;
  visible: boolean;
}

export default function Desktop() {
  const { settings } = useOSStore();
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    x: 0,
    y: 0,
    visible: false,
  });

  useEffect(() => {
    const handleClick = () => setContextMenu((prev) => ({ ...prev, visible: false }));
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    if (target.id === 'desktop-area') {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        visible: true,
      });
    }
  };

  return (
    <div
      className={`h-screen w-screen overflow-hidden font-sf-pro ${
        settings.isDarkMode ? 'dark' : ''
      }`}
      style={{
        backgroundImage: `url(${settings.wallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <MenuBar />
      
      <div
        id="desktop-area"
        className="h-[calc(100vh-28px-80px)] mt-[28px]"
        onContextMenu={handleContextMenu}
      >
        <WindowManager />
      </div>

      <Dock />

      {contextMenu.visible && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} />
      )}
    </div>
  );
}

