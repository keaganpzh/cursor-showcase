import { useState, useEffect, useRef } from 'react';
import { useSettingsStore } from '../stores';

interface DesktopProps {
  onContextMenu?: (e: React.MouseEvent) => void;
}

interface SelectionBox {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export default function Desktop({ onContextMenu }: DesktopProps) {
  const { settings } = useSettingsStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const isDraggingRef = useRef(false);
  const desktopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      // Only clear selection if not dragging
      if (!isDraggingRef.current) {
        setSelectionBox(null);
      }
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // Only start selection on left click and if clicking directly on desktop (not on windows or other elements)
      const target = e.target as HTMLElement;
      
      if (e.button !== 0 || !desktopRef.current) return;
      
      // Check if clicking on a window, dock, menu bar, or other interactive elements
      const isWindow = target.closest('.react-rnd') || target.closest('[data-window]');
      const isDock = target.closest('[data-dock]') || target.closest('.dock-container');
      const isMenuBar = target.closest('[data-menubar]') || target.closest('.menubar');
      const isInteractive = target.closest('button') || target.closest('a') || target.closest('input');
      
      // Only start selection if clicking on empty desktop space
      if (!isWindow && !isDock && !isMenuBar && !isInteractive) {
        // Check if the click is within the desktop bounds
        const rect = desktopRef.current.getBoundingClientRect();
        const clickX = e.clientX;
        const clickY = e.clientY;
        
        if (
          clickX >= rect.left &&
          clickX <= rect.right &&
          clickY >= rect.top &&
          clickY <= rect.bottom
        ) {
          const startX = clickX - rect.left;
          const startY = clickY - rect.top;
          
          isDraggingRef.current = true;
          setSelectionBox({
            startX,
            startY,
            currentX: startX,
            currentY: startY,
          });
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current && selectionBox && desktopRef.current) {
        const rect = desktopRef.current.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        setSelectionBox({
          ...selectionBox,
          currentX,
          currentY,
        });
      }
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        // Clear selection box after a short delay
        setTimeout(() => {
          setSelectionBox(null);
        }, 100);
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selectionBox]);

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

  const getSelectionBoxStyle = () => {
    if (!selectionBox) return {};
    
    const left = Math.min(selectionBox.startX, selectionBox.currentX);
    const top = Math.min(selectionBox.startY, selectionBox.currentY);
    const width = Math.abs(selectionBox.currentX - selectionBox.startX);
    const height = Math.abs(selectionBox.currentY - selectionBox.startY);
    
    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  };

  return (
    <div
      ref={desktopRef}
      className="desktop-background absolute inset-0 bg-cover bg-center bg-no-repeat"
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
      {selectionBox && (
        <div
          className="absolute pointer-events-none z-10"
          style={{
            ...getSelectionBoxStyle(),
            border: '1px solid rgba(0, 122, 255, 0.8)',
            background: 'rgba(0, 122, 255, 0.1)',
            borderRadius: '2px',
            boxShadow: '0 0 0 1px rgba(0, 122, 255, 0.3)',
          }}
        />
      )}
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

