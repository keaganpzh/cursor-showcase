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
        className="w-full h-full bg-white rounded-t-lg shadow-2xl flex flex-col overflow-hidden"
        onClick={() => setActiveWindow(windowState.id)}
      >
        <div className="bg-gray-200 h-8 flex items-center justify-between px-3 rounded-t-lg border-b border-gray-300">
          <div className="flex items-center gap-2">
            <button
              onClick={() => closeWindow(windowState.id)}
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
            />
            <button
              onClick={() => minimizeWindow(windowState.id)}
              className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
            />
            <button
              onClick={() => maximizeWindow(windowState.id)}
              className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
            />
          </div>
          <div className="flex-1 text-center text-sm font-medium text-gray-700">
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

