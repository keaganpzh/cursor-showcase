import { Rnd } from 'react-rnd';
import { X, Minus, Maximize2 } from 'lucide-react';
import { useWindowStore } from '@/store/useWindowStore';
import { ReactNode } from 'react';

interface WindowProps {
  windowId: string;
  children: ReactNode;
}

export default function Window({ windowId, children }: WindowProps) {
  const { getWindow, updateWindow, removeWindow, focusWindow, minimizeWindow, maximizeWindow } = useWindowStore();
  const windowState = getWindow(windowId);

  if (!windowState || windowState.isMinimized) return null;

  const handleDragStop = (_e: unknown, data: { x: number; y: number }) => {
    updateWindow(windowId, { x: data.x, y: data.y });
  };

  const handleResizeStop = (
    _e: unknown,
    _direction: unknown,
    ref: HTMLElement,
    _delta: unknown,
    position: { x: number; y: number }
  ) => {
    updateWindow(windowId, {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
      x: position.x,
      y: position.y,
    });
  };

  return (
    <Rnd
      position={{ x: windowState.x, y: windowState.y }}
      size={{ width: windowState.width, height: windowState.height }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      minWidth={400}
      minHeight={300}
      bounds="parent"
      dragHandleClassName="window-drag-handle"
      style={{ zIndex: windowState.zIndex }}
      onMouseDown={() => focusWindow(windowId)}
      disableDragging={windowState.isMaximized}
      enableResizing={!windowState.isMaximized}
    >
      <div className="h-full bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden flex flex-col">
        <div className="window-drag-handle h-10 bg-gray-100 dark:bg-gray-800 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 cursor-move">
          <div className="flex gap-2">
            <button
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
              onClick={() => removeWindow(windowId)}
              aria-label="Close"
            >
              <X size={8} className="text-red-900 opacity-0 hover:opacity-100 m-auto" />
            </button>
            <button
              className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
              onClick={() => minimizeWindow(windowId)}
              aria-label="Minimize"
            >
              <Minus size={8} className="text-yellow-900 opacity-0 hover:opacity-100 m-auto" />
            </button>
            <button
              className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
              onClick={() => maximizeWindow(windowId)}
              aria-label="Maximize"
            >
              <Maximize2 size={8} className="text-green-900 opacity-0 hover:opacity-100 m-auto" />
            </button>
          </div>

          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {windowState.title}
          </div>

          <div className="w-12" />
        </div>

        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </Rnd>
  );
}

