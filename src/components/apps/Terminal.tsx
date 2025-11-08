import { useState, useRef, useEffect } from 'react';
import { getFilesByParent, createFile, getFileById } from '@/db/fileSystem';
import { FileSystemItem } from '@/types';

interface TerminalProps {
  windowId: string;
}

interface TerminalLine {
  type: 'command' | 'output' | 'error';
  content: string;
}

export default function Terminal({ windowId }: TerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'output', content: 'WebOS Terminal v1.0' },
    { type: 'output', content: 'Type "help" for available commands' },
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [currentPath, setCurrentPath] = useState<string>('home');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  const executeCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    setLines(prev => [...prev, { type: 'command', content: `$ ${trimmedCmd}` }]);
    setCommandHistory(prev => [...prev, trimmedCmd]);

    const [command, ...args] = trimmedCmd.split(' ');

    try {
      switch (command) {
        case 'help':
          setLines(prev => [...prev, 
            { type: 'output', content: 'Available commands:' },
            { type: 'output', content: '  ls           - List files in current directory' },
            { type: 'output', content: '  cd <dir>     - Change directory' },
            { type: 'output', content: '  pwd          - Print working directory' },
            { type: 'output', content: '  touch <file> - Create a new file' },
            { type: 'output', content: '  cat <file>   - Display file contents' },
            { type: 'output', content: '  echo <text>  - Print text to console' },
            { type: 'output', content: '  clear        - Clear terminal screen' },
            { type: 'output', content: '  help         - Show this help message' },
          ]);
          break;

        case 'ls':
          const items = await getFilesByParent(currentPath);
          if (items.length === 0) {
            setLines(prev => [...prev, { type: 'output', content: '(empty directory)' }]);
          } else {
            items.forEach(item => {
              const icon = item.type === 'folder' ? '📁' : '📄';
              setLines(prev => [...prev, { type: 'output', content: `${icon} ${item.name}` }]);
            });
          }
          break;

        case 'pwd':
          const currentFolder = await getFileById(currentPath);
          setLines(prev => [...prev, { type: 'output', content: `/${currentFolder?.name || 'root'}` }]);
          break;

        case 'cd':
          if (!args[0]) {
            setCurrentPath('home');
            setLines(prev => [...prev, { type: 'output', content: 'Changed to home directory' }]);
          } else if (args[0] === '..') {
            const current = await getFileById(currentPath);
            if (current?.parentId) {
              setCurrentPath(current.parentId);
              setLines(prev => [...prev, { type: 'output', content: 'Changed to parent directory' }]);
            } else {
              setLines(prev => [...prev, { type: 'error', content: 'Already at root directory' }]);
            }
          } else {
            const items = await getFilesByParent(currentPath);
            const folder = items.find(item => item.name === args[0] && item.type === 'folder');
            if (folder) {
              setCurrentPath(folder.id);
              setLines(prev => [...prev, { type: 'output', content: `Changed to ${folder.name}` }]);
            } else {
              setLines(prev => [...prev, { type: 'error', content: `Directory not found: ${args[0]}` }]);
            }
          }
          break;

        case 'touch':
          if (!args[0]) {
            setLines(prev => [...prev, { type: 'error', content: 'Usage: touch <filename>' }]);
          } else {
            await createFile(args[0], currentPath, '', 'file');
            setLines(prev => [...prev, { type: 'output', content: `Created file: ${args[0]}` }]);
          }
          break;

        case 'cat':
          if (!args[0]) {
            setLines(prev => [...prev, { type: 'error', content: 'Usage: cat <filename>' }]);
          } else {
            const items = await getFilesByParent(currentPath);
            const file = items.find(item => item.name === args[0] && item.type === 'file');
            if (file) {
              setLines(prev => [...prev, { type: 'output', content: file.content || '(empty file)' }]);
            } else {
              setLines(prev => [...prev, { type: 'error', content: `File not found: ${args[0]}` }]);
            }
          }
          break;

        case 'echo':
          setLines(prev => [...prev, { type: 'output', content: args.join(' ') }]);
          break;

        case 'clear':
          setLines([]);
          break;

        default:
          setLines(prev => [...prev, { type: 'error', content: `Command not found: ${command}. Type "help" for available commands.` }]);
      }
    } catch (error) {
      setLines(prev => [...prev, { type: 'error', content: `Error: ${error}` }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(currentCommand);
      setCurrentCommand('');
      setHistoryIndex(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentCommand(commandHistory[newIndex]);
        }
      }
    }
  };

  return (
    <div 
      className="h-full bg-gray-900 text-green-400 p-4 font-mono text-sm overflow-auto"
      ref={containerRef}
      onClick={() => inputRef.current?.focus()}
    >
      {lines.map((line, index) => (
        <div 
          key={index}
          className={`mb-1 ${
            line.type === 'command' ? 'text-white font-semibold' :
            line.type === 'error' ? 'text-red-400' :
            'text-green-400'
          }`}
        >
          {line.content}
        </div>
      ))}
      
      <div className="flex items-center gap-2 text-white">
        <span className="text-blue-400">$</span>
        <input
          ref={inputRef}
          type="text"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-white"
          autoFocus
        />
      </div>
    </div>
  );
}

