import { useAppStore } from '../stores';
import { useSettingsStore } from '../stores';

export default function Dock() {
  const { apps, addWindow } = useAppStore();
  const { settings } = useSettingsStore();
  const dockApps = apps.filter(app => ['finder', 'texteditor', 'terminal', 'settings', 'browser'].includes(app.id));

  const handleAppClick = (appId: string, appName: string) => {
    addWindow(appId, appName);
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
      <div className="flex items-end gap-2 bg-black/30 backdrop-blur-xl rounded-2xl px-3 py-2 border border-white/20 shadow-2xl">
        {dockApps.map((app) => (
          <button
            key={app.id}
            onClick={() => handleAppClick(app.id, app.name)}
            className="dock-icon group relative flex items-center justify-center transition-all duration-200 hover:scale-125"
            style={{ width: settings.dockSize, height: settings.dockSize }}
            title={app.name}
          >
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-semibold shadow-lg group-hover:shadow-xl transition-shadow">
              {app.icon}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

