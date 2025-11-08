import { useState, useEffect } from 'react';
import { useAppStore } from '../stores';

export default function MenuBar() {
  const { windows, activeWindowId } = useAppStore();
  const activeWindow = windows.find(w => w.id === activeWindowId);
  const activeApp = activeWindow ? useAppStore.getState().apps.find(a => a.id === activeWindow.appId) : null;

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const [time, setTime] = useState(getCurrentTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getCurrentTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-6 bg-black/40 backdrop-blur-md border-b border-white/10 z-50 flex items-center px-4 text-white text-xs">
      <div className="flex items-center gap-4 flex-1">
        <button className="hover:bg-white/10 px-2 py-1 rounded transition-colors">
          🍎
        </button>
        {activeApp && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">{activeApp.name}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="w-1 h-1 bg-white rounded-full"></div>
        <div className="w-1 h-1 bg-white rounded-full"></div>
        <div className="w-1 h-1 bg-white rounded-full"></div>
        <span className="font-medium">{time}</span>
      </div>
    </div>
  );
}

