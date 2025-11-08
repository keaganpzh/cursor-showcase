# WebOS Simulator - MacOS-Style Desktop Environment

A fully interactive, browser-based simulation of a macOS-like environment built with React, TypeScript, and modern web technologies.

![WebOS Simulator](https://images.unsplash.com/photo-1557683311-eac922347aa1?w=1200&q=80)

## 🌟 Features

### Desktop Environment
- **Desktop with Customizable Wallpaper** - Multiple wallpaper options with right-click context menu
- **Dock with Magnification Effect** - macOS-style dock with smooth hover animations
- **Menu Bar** - Dynamic menu bar showing active app, system indicators, and real-time clock
- **Window Management** - Full window operations: drag, resize, minimize, maximize, close
- **Dark Mode Support** - Toggle between light and dark themes

### Core Applications

#### 📁 Finder
- Browse virtual file system with hierarchical folder structure
- Create, rename, and delete files and folders
- Navigate through directories with back button and breadcrumb navigation
- Visual file/folder icons with grid layout

#### 📝 Text Editor
- Create and edit text files
- Save files to the virtual file system
- Open existing files from Documents folder
- Real-time unsaved changes indicator
- Multiple file support with file picker

#### ⌘ Terminal
- Interactive command-line interface with mock shell
- Supported commands:
  - `ls` - List directory contents
  - `cd` - Change directory
  - `pwd` - Print working directory
  - `touch` - Create new files
  - `cat` - Display file contents
  - `echo` - Print text
  - `clear` - Clear terminal
  - `help` - Show available commands
- Command history with arrow key navigation
- Auto-scrolling output

#### ⚙️ Settings
- **Appearance Tab**
  - Light/Dark theme toggle
  - 6 beautiful wallpaper options
- **Display Tab**
  - Adjustable dock size slider

#### 🌐 Browser
- Placeholder stub application showing "No Internet" message

### Virtual File System
- **Persistent Storage** - Uses IndexedDB for data persistence across browser sessions
- **Hierarchical Structure** - Nested folders and files
- **Default Folders** - Home, Documents, Downloads, Desktop, Applications
- **Sample Files** - Welcome.txt and README.txt included

## 🚀 Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast dev server and optimized builds)
- **State Management**: Zustand (lightweight and performant)
- **Styling**: TailwindCSS with custom macOS-inspired theme
- **Window Management**: react-rnd for drag & resize functionality
- **Database**: Dexie.js (IndexedDB wrapper) with React hooks
- **Icons**: Lucide React
- **Utilities**: clsx for conditional classNames

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── apps/              # Application components
│   │   ├── Finder.tsx
│   │   ├── TextEditor.tsx
│   │   ├── Terminal.tsx
│   │   ├── Settings.tsx
│   │   └── Browser.tsx
│   ├── Desktop.tsx        # Main desktop environment
│   ├── MenuBar.tsx        # Top menu bar
│   ├── Dock.tsx           # Bottom dock
│   ├── Window.tsx         # Window wrapper component
│   ├── WindowManager.tsx  # Window orchestration
│   └── ContextMenu.tsx    # Right-click context menu
├── store/
│   ├── useOSStore.ts      # OS settings (theme, wallpaper, dock)
│   ├── useWindowStore.ts  # Window state management
│   └── useAppStore.ts     # Application registry
├── db/
│   └── fileSystem.ts      # Virtual file system with IndexedDB
├── types/
│   └── index.ts           # TypeScript type definitions
├── App.tsx                # Root component
├── main.tsx               # Application entry point
└── index.css              # Global styles
```

## 🎨 Key Features Implementation

### Window Management
- Each window has independent state (position, size, z-index)
- Windows can be dragged, resized, minimized, and maximized
- Click to focus brings window to front
- macOS-style traffic light buttons (red, yellow, green)

### State Persistence
- OS settings (theme, wallpaper, dock size) persist via localStorage
- File system data persists via IndexedDB
- Session state maintained across page refreshes

### Responsive Design
- Scales to various screen sizes
- Minimum resolution: 1024x600
- Flexible layout system

### macOS-Inspired UI/UX
- Backdrop blur effects on menu bar and dock
- Smooth animations and transitions
- Hover effects and visual feedback
- System font stack matching macOS

## 🔒 Security & Sandboxing

- No access to user's actual file system
- All operations contained within browser storage
- No arbitrary code execution
- Fully sandboxed environment

## 🌐 Browser Compatibility

- Chrome/Edge (latest 2 versions)
- Safari (latest 2 versions)
- Firefox (latest 2 versions)

## 📝 Future Enhancements

Potential features for future versions:
- Drag & drop file operations in Finder
- Calculator app
- Calendar app
- Notes app with rich text editing
- Photo viewer
- Music player
- App Store for installing new apps
- Multi-user support with backend
- WebSocket-based file sharing
- More terminal commands
- Spotlight search functionality

## 🤝 Contributing

This is an educational/demonstration project. Feel free to fork and extend with your own applications and features!

## 📄 License

MIT License - feel free to use this project for learning, demos, or building upon.

## 🙏 Acknowledgments

- Inspired by macOS Big Sur and later versions
- Wallpaper images from Unsplash
- Icons from Lucide React

---

Built with ❤️ using modern web technologies
