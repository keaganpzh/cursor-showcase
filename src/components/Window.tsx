import { Rnd } from 'react-rnd';
import { WindowState } from '../types';
import { useAppStore } from '../stores';

interface WindowProps {
  window: WindowState;
}

export default function Window({ window: windowState }: WindowProps) {
  const { closeWindow, updateWindow, setActiveWindow, minimizeWindow, maximizeWindow } = useAppStore();
  const app = useAppStore.getState().apps.find(a => a.id === windowState.appId);
  const AppComponent = app?.component;

  if (!AppComponent) return null;

  const handleDragStart = () => {
    setActiveWindow(windowState.id);
  };

  const handleResizeStop = (_e: any, _direction: any, ref: HTMLElement) => {
    updateWindow(windowState.id, {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
    });
  };

  const handleDragStop = (_e: any, d: { x: number; y: number }) => {
    updateWindow(windowState.id, {
      x: d.x,
      y: d.y,
    });
  };

  if (windowState.minimized) {
    return null;
  }

  const windowStyle = windowState.maximized
    ? {
        x: 0,
        y: 24,
        width: window.innerWidth,
        height: window.innerHeight - 24 - 80,
      }
    : {
        x: windowState.x,
        y: windowState.y,
        width: windowState.width,
        height: windowState.height,
      };

  const isActive = windowState.id === useAppStore.getState().activeWindowId;

  return (
    <Rnd
      size={{ width: windowStyle.width, height: windowStyle.height }}
      position={{ x: windowStyle.x, y: windowStyle.y }}
      onDragStart={handleDragStart}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      minWidth={400}
      minHeight={300}
      bounds="parent"
      disableResizing={windowState.maximized}
      style={{ zIndex: windowState.zIndex }}
      className="window-container"
    >
      <div
        className="w-full h-full bg-white rounded-lg flex flex-col overflow-hidden"
        style={{
          boxShadow: isActive 
            ? '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 0.5px rgba(0, 0, 0, 0.1)' 
            : '0 10px 40px rgba(0, 0, 0, 0.2), 0 0 0 0.5px rgba(0, 0, 0, 0.05)',
          transition: 'box-shadow 0.2s ease-out',
        }}
        onClick={() => setActiveWindow(windowState.id)}
      >
        <div 
          className="h-10 flex items-center justify-between px-4 rounded-t-lg"
          style={{
            background: isActive 
              ? 'linear-gradient(to bottom, #f6f6f6 0%, #e8e8e8 100%)' 
              : 'linear-gradient(to bottom, #f0f0f0 0%, #e0e0e0 100%)',
            borderBottom: '0.5px solid rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeWindow(windowState.id);
              }}
              className="w-3 h-3 rounded-full transition-all duration-150 flex items-center justify-center group"
              style={{
                background: '#ff5f57',
                boxShadow: 'inset 0 0 0 0.5px rgba(0, 0, 0, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ff3b30';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ff5f57';
              }}
            >
              <span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">×</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                minimizeWindow(windowState.id);
              }}
              className="w-3 h-3 rounded-full transition-all duration-150 flex items-center justify-center group"
              style={{
                background: '#ffbd2e',
                boxShadow: 'inset 0 0 0 0.5px rgba(0, 0, 0, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ff9500';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffbd2e';
              }}
            >
              <span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">−</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                maximizeWindow(windowState.id);
              }}
              className="w-3 h-3 rounded-full transition-all duration-150 flex items-center justify-center group"
              style={{
                background: '#28c840',
                boxShadow: 'inset 0 0 0 0.5px rgba(0, 0, 0, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#34c759';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#28c840';
              }}
            >
              <span className="text-[6px] opacity-0 group-hover:opacity-100 transition-opacity">+</span>
            </button>
          </div>
          <div className="flex-1 text-center text-xs font-medium text-gray-700 select-none">
            {windowState.title}
          </div>
          <div className="w-16" />
        </div>
        <div className="flex-1 overflow-auto bg-white">
          <AppComponent />
        </div>
      </div>
    </Rnd>
  );
}

