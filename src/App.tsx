import { useEffect } from 'react';
import Desktop from './components/Desktop';
import Dock from './components/Dock';
import MenuBar from './components/MenuBar';
import WindowManager from './components/WindowManager';
import { useAppStore } from './stores';
import { useFileSystemStore } from './stores';
import { useSettingsStore } from './stores';
import { registerApps } from './apps';

function App() {
  const { registerApp } = useAppStore();
  const { loadNodes } = useFileSystemStore();
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
    loadNodes();
    registerApps(registerApp);
  }, [registerApp, loadNodes, loadSettings]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Desktop />
      <MenuBar />
      <WindowManager />
      <Dock />
    </div>
  );
}

export default App;

