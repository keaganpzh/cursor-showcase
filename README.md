# Yuvbuntu

A browser-based macOS-style desktop environment simulator built with React, TypeScript, and TailwindCSS.

## Features

- **Desktop Environment**: Full macOS-like desktop with customizable wallpaper, dock, and menu bar
- **Window Management**: Drag, resize, minimize, maximize, and close windows
- **Virtual File System**: Persistent in-browser filesystem using IndexedDB
- **Applications**:
  - **Finder**: Browse and manage files and folders with drag & drop
  - **Text Editor**: Create and edit text files
  - **Terminal**: Mock shell with commands (ls, cd, echo, touch, mkdir, cat, etc.)
  - **Settings**: Customize wallpaper, dark mode, and dock size
  - **Browser**: Simulated browser stub

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **Zustand** - State management
- **react-rnd** - Window dragging and resizing
- **Dexie.js** - IndexedDB wrapper for filesystem persistence

## Project Structure

```
src/
├── components/       # React components
│   ├── apps/        # Application components (Finder, Terminal, etc.)
│   ├── Desktop.tsx  # Desktop background and context menu
│   ├── Dock.tsx     # Application dock
│   ├── MenuBar.tsx  # Top menu bar
│   ├── Window.tsx   # Window component
│   └── WindowManager.tsx # Window management
├── stores/          # Zustand state stores
├── services/        # Services (filesystem)
├── types/           # TypeScript type definitions
└── apps/            # App registration
```

## Usage

1. Click apps in the dock to launch them
2. Right-click on the desktop to change wallpaper
3. Use Finder to browse and manage files
4. Open Settings to customize the environment
5. All data persists in browser storage (IndexedDB)

## Browser Compatibility

- Chrome (latest 2 versions)
- Safari (latest 2 versions)
- Firefox (latest 2 versions)

## License

MIT
