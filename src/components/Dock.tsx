import { useAppStore } from '../stores';
import { useSettingsStore } from '../stores';

export default function Dock() {
  const { apps, addWindow, windows } = useAppStore();
  const { settings } = useSettingsStore();
  const dockApps = apps.filter(app => ['finder', 'texteditor', 'terminal', 'settings', 'browser'].includes(app.id));

  const handleAppClick = (appId: string, appName: string) => {
    addWindow(appId, appName);
  };

  const isAppRunning = (appId: string) => {
    return windows.some(w => w.appId === appId);
  };

  return (
    <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 z-40">
      <div 
        className="flex items-end gap-1.5 px-2 py-2 rounded-3xl"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'saturate(180%) blur(30px)',
          WebkitBackdropFilter: 'saturate(180%) blur(30px)',
          border: '0.5px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
        }}
      >
        {dockApps.map((app) => {
          const running = isAppRunning(app.id);
          return (
            <button
              key={app.id}
              onClick={() => handleAppClick(app.id, app.name)}
              className="dock-icon group relative flex items-center justify-center transition-all duration-300 ease-out"
              style={{ 
                width: settings.dockSize, 
                height: settings.dockSize,
                transform: 'scale(1)',
              }}
              title={app.name}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.4) translateY(-8px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div 
                className="w-full h-full rounded-2xl flex items-center justify-center text-white text-2xl font-semibold relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                  border: '0.5px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <div className="relative z-10">{app.icon}</div>
                {running && (
                  <div 
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
                    }}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

