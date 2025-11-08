import { useWindowStore } from '@/store/useWindowStore';
import Window from './Window';
import Finder from './apps/Finder';
import TextEditor from './apps/TextEditor';
import Terminal from './apps/Terminal';
import Settings from './apps/Settings';
import Browser from './apps/Browser';

const componentMap: Record<string, React.ComponentType<{ windowId: string }>> = {
  finder: Finder,
  'text-editor': TextEditor,
  terminal: Terminal,
  settings: Settings,
  browser: Browser,
};

export default function WindowManager() {
  const { windows } = useWindowStore();

  return (
    <>
      {windows.map((window) => {
        const Component = componentMap[window.appId] || Finder;
        
        return (
          <Window key={window.id} windowId={window.id}>
            <Component windowId={window.id} />
          </Window>
        );
      })}
    </>
  );
}

