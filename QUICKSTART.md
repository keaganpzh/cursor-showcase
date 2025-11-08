# Quick Start Guide - WebOS Simulator

## Getting Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open in Browser
Navigate to `http://localhost:5173` (or the URL shown in terminal)

## First Steps in WebOS

### Explore the Dock
- Hover over the dock icons at the bottom to see the magnification effect
- Click any icon to open an application:
  - 📁 **Finder** - Browse files and folders
  - 📝 **Text Editor** - Create and edit text files
  - ⌘ **Terminal** - Run mock shell commands
  - ⚙️ **Settings** - Customize appearance
  - 🌐 **Browser** - Placeholder app

### Try These Actions

#### In Finder:
1. Click "New Folder" to create a folder
2. Click "New File" to create a file
3. Double-click folders to navigate
4. Click the back arrow or home icon to navigate
5. Select an item and click the trash icon to delete

#### In Text Editor:
1. Type some text
2. Change the filename at the top
3. Click "Save" to save to the virtual file system
4. Click "Open" to open existing files from Documents

#### In Terminal:
1. Type `help` to see available commands
2. Try `ls` to list files in current directory
3. Try `cd Documents` to navigate to Documents folder
4. Try `touch myfile.txt` to create a new file
5. Try `cat Welcome.txt` to read a file
6. Use arrow keys to navigate command history

#### In Settings:
1. Switch between Light and Dark themes
2. Try different wallpapers
3. Adjust the dock size with the slider

### Window Management
- **Drag** the title bar to move windows
- **Resize** by dragging edges/corners
- **Red button** - Close window
- **Yellow button** - Minimize window (minimize again to restore)
- **Green button** - Toggle fullscreen
- **Click** anywhere on a window to bring it to front

### Desktop Actions
- **Right-click** on desktop to change wallpaper
- Open multiple windows at once
- Arrange windows as needed

## Building for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

The production build will be in the `dist/` directory, ready to deploy to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

## Troubleshooting

### Port Already in Use
If port 5173 is busy, Vite will automatically use the next available port.

### Dependencies Not Installing
Try:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Application Not Loading
1. Check browser console for errors
2. Make sure you're using a modern browser (Chrome, Firefox, Safari)
3. Try clearing browser cache and reloading

### File System Not Persisting
- Check if IndexedDB is enabled in your browser
- Some browsers in private/incognito mode may not persist data

## Tech Stack Overview

- **React 18** - Component-based UI
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first styling
- **Zustand** - State management
- **Dexie.js** - IndexedDB wrapper
- **react-rnd** - Drag and resize functionality

## Next Steps

- Explore the codebase in `src/` directory
- Check out the detailed README.md for architecture details
- Try modifying wallpapers or adding new applications
- Customize the theme colors in `tailwind.config.js`

Happy exploring! 🎉

