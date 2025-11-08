import { useEffect } from 'react';
import Desktop from './components/Desktop';
import { initializeFileSystem } from './db/fileSystem';

export default function App() {
  useEffect(() => {
    initializeFileSystem().catch(console.error);
  }, []);

  return <Desktop />;
}

