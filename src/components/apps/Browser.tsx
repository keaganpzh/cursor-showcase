import { WifiOff } from 'lucide-react';

interface BrowserProps {
  windowId: string;
}

export default function Browser({ windowId }: BrowserProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <WifiOff size={64} className="text-gray-400 mb-4" />
      <h2 className="text-2xl font-semibold mb-2">No Internet Connection</h2>
      <p className="text-gray-600 dark:text-gray-400">
        This is a simulated browser environment
      </p>
    </div>
  );
}

