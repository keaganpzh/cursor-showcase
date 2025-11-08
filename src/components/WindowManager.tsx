import { Rnd } from 'react-rnd';
import { useAppStore } from '../stores';
import Window from './Window';

export default function WindowManager() {
  const { windows } = useAppStore();

  return (
    <>
      {windows.map((window) => (
        <Window key={window.id} window={window} />
      ))}
    </>
  );
}

