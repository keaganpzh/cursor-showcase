import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useWindowStore } from '@/store/useWindowStore';
import { useOSStore } from '@/store/useOSStore';

export default function Dock() {
  const { applications, dockApps } = useAppStore();
  const { addWindow } = useWindowStore();
  const { settings } = useOSStore();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const dockApplications = dockApps
    .map((appId) => applications.find((app) => app.id === appId))
    .filter(Boolean);

  const handleAppClick = (appId: string, appName: string) => {
    const centerX = window.innerWidth / 2 - 300;
    const centerY = window.innerHeight / 2 - 250;

    addWindow({
      appId,
      title: appName,
      x: centerX + Math.random() * 50,
      y: centerY + Math.random() * 50,
      width: 600,
      height: 500,
    });
  };

  const getIconSize = (index: number) => {
    if (hoveredIndex === null) return settings.dockSize;
    
    const distance = Math.abs(index - hoveredIndex);
    const maxScale = 1.5;
    const scaleDecrease = 0.2;
    const scale = Math.max(1, maxScale - distance * scaleDecrease);
    
    return settings.dockSize * scale;
  };

  return (
    <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-macos rounded-2xl px-2 py-2 shadow-2xl border border-white/20">
        <div className="flex items-end gap-2">
          {dockApplications.map((app, index) => {
            if (!app) return null;
            const size = getIconSize(index);
            
            return (
              <button
                key={app.id}
                className="transition-all duration-200 hover:transform hover:-translate-y-2 flex items-center justify-center bg-white/10 rounded-xl cursor-pointer hover:bg-white/20"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  fontSize: `${size * 0.6}px`,
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleAppClick(app.id, app.name)}
                title={app.name}
              >
                {app.icon}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

