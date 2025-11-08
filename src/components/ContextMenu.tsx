import { useOSStore } from '@/store/useOSStore';

interface ContextMenuProps {
  x: number;
  y: number;
}

export default function ContextMenu({ x, y }: ContextMenuProps) {
  const { updateSettings } = useOSStore();

  const wallpapers = [
    { name: 'Default', url: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=1920&q=80' },
    { name: 'Mountains', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80' },
    { name: 'Ocean', url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&q=80' },
    { name: 'Forest', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80' },
  ];

  return (
    <div
      className="fixed bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg shadow-xl py-2 min-w-[200px] z-[9999]"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-1 text-xs font-semibold text-gray-500">Change Wallpaper</div>
      {wallpapers.map((wallpaper) => (
        <button
          key={wallpaper.name}
          className="w-full text-left px-4 py-2 hover:bg-blue-500 hover:text-white text-sm transition-colors"
          onClick={() => updateSettings({ wallpaper: wallpaper.url })}
        >
          {wallpaper.name}
        </button>
      ))}
    </div>
  );
}

