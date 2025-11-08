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

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const [time, setTime] = useState(getCurrentTime());
  const [date, setDate] = useState(getCurrentDate());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getCurrentTime());
      setDate(getCurrentDate());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 right-0 h-7 z-50 flex items-center px-3 text-white text-xs font-medium"
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '0.5px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="flex items-center gap-6 flex-1">
        <button 
          className="hover:bg-white/10 px-2.5 py-1 rounded transition-all duration-150 text-base leading-none"
          style={{ fontFamily: 'system-ui' }}
        >
          🍎
        </button>
        {activeApp && (
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 hover:bg-white/10 rounded transition-colors cursor-default font-medium">
              {activeApp.name}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] leading-none opacity-70 hover:opacity-100 cursor-pointer transition-opacity">File</span>
              <span className="text-[10px] leading-none opacity-70 hover:opacity-100 cursor-pointer transition-opacity">Edit</span>
              <span className="text-[10px] leading-none opacity-70 hover:opacity-100 cursor-pointer transition-opacity">View</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 bg-white/80 rounded-full"></div>
          <div className="w-1 h-1 bg-white/80 rounded-full"></div>
          <div className="w-1 h-1 bg-white/80 rounded-full"></div>
        </div>
        <div className="flex flex-col items-end leading-tight">
          <span className="text-[11px] font-medium">{time}</span>
          <span className="text-[9px] opacity-70">{date}</span>
        </div>
      </div>
    </div>
  );
}

