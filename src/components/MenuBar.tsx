import { useEffect, useState } from 'react';
import { Apple, Search, Wifi, Battery } from 'lucide-react';
import { useWindowStore } from '@/store/useWindowStore';
import { useAppStore } from '@/store/useAppStore';

export default function MenuBar() {
  const [time, setTime] = useState(new Date());
  const { windows } = useWindowStore();
  const { applications } = useAppStore();

  const activeWindow = windows.length > 0 
    ? windows.reduce((prev, current) => (prev.zIndex > current.zIndex ? prev : current))
    : null;

  const activeApp = activeWindow 
    ? applications.find(app => app.id === activeWindow.appId) 
    : null;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-[28px] bg-black/20 backdrop-blur-macos text-white flex items-center justify-between px-4 z-50 text-sm">
      <div className="flex items-center gap-4">
        <Apple size={16} className="cursor-pointer" />
        <span className="font-semibold">{activeApp?.name || 'Finder'}</span>
        <span className="cursor-pointer">File</span>
        <span className="cursor-pointer">Edit</span>
        <span className="cursor-pointer">View</span>
        <span className="cursor-pointer">Window</span>
        <span className="cursor-pointer">Help</span>
      </div>

      <div className="flex items-center gap-4">
        <Search size={14} className="cursor-pointer" />
        <Wifi size={14} className="cursor-pointer" />
        <Battery size={14} className="cursor-pointer" />
        <div className="cursor-pointer">
          <span>{formatDate(time)}</span>
          <span className="ml-2">{formatTime(time)}</span>
        </div>
      </div>
    </div>
  );
}

