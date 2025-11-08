import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { OSSettings } from '@/types';

interface OSStore {
  settings: OSSettings;
  updateSettings: (settings: Partial<OSSettings>) => void;
}

const defaultWallpaper = 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=1920&q=80';

export const useOSStore = create<OSStore>()(
  persist(
    (set) => ({
      settings: {
        wallpaper: defaultWallpaper,
        isDarkMode: false,
        dockSize: 64,
      },
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: 'webos-settings',
    }
  )
);

