import { useState, useRef, useEffect } from 'react';
import { useFileSystemStore } from '../../stores';

interface Command {
  command: string;
  output: string;
}

export default function Terminal() {
  const { nodes, getChildren, getNode, createNode, updateFileContent } = useFileSystemStore();
  const [commands, setCommands] = useState<Command[]>([
    { command: '', output: 'Welcome to WebOS Terminal\nType "help" for available commands.' },
  ]);
  const [currentPath, setCurrentPath] = useState<string[]>(['home']);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [commands]);

  const getCurrentFolderId = () => currentPath[currentPath.length - 1] || 'home';

  const executeCommand = async (cmd: string) => {
    const [command, ...args] = cmd.trim().split(' ');
    let output = '';

    switch (command.toLowerCase()) {
      case 'ls':
        const children = getChildren(getCurrentFolderId());
        output = children.length === 0 
          ? 'Empty directory' 
          : children.map(n => `${n.type === 'folder' ? '📁' : '📄'} ${n.name}`).join('\n');
        break;

      case 'cd':
        if (args.length === 0) {
          setCurrentPath(['home']);
          output = 'Changed to home directory';
        } else {
          const targetName = args[0];
          const folderChildren = getChildren(getCurrentFolderId());
          const target = folderChildren.find(n => n.name === targetName && n.type === 'folder');
          if (target) {
            setCurrentPath([...currentPath, target.id]);
            output = `Changed to ${targetName}`;
          } else {
            output = `cd: no such file or directory: ${targetName}`;
          }
        }
        break;

      case 'pwd':
        const pathNames = currentPath.map(id => {
          const node = getNode(id);
          return node?.name || id;
        });
        output = '/' + pathNames.join('/');
        break;

      case 'echo':
        output = args.join(' ');
        break;

      case 'touch':
        if (args.length > 0) {
          const fileName = args[0];
          await createNode(fileName, 'file', getCurrentFolderId());
          output = `Created file: ${fileName}`;
        } else {
          output = 'touch: missing file operand';
        }
        break;

      case 'mkdir':
        if (args.length > 0) {
          const folderName = args[0];
          await createNode(folderName, 'folder', getCurrentFolderId());
          output = `Created directory: ${folderName}`;
        } else {
          output = 'mkdir: missing operand';
        }
        break;

      case 'cat':
        if (args.length > 0) {
          const fileName = args[0];
          const fileChildren = getChildren(getCurrentFolderId());
          const file = fileChildren.find(n => n.name === fileName && n.type === 'file');
          if (file) {
            output = file.content || '(empty file)';
          } else {
            output = `cat: ${fileName}: No such file or directory`;
          }
        } else {
          output = 'cat: missing file operand';
        }
        break;

      case 'clear':
        setCommands([]);
        return;

      case 'help':
        output = `Available commands:
  ls          - List directory contents
  cd <dir>    - Change directory
  pwd         - Print working directory
  echo <text> - Print text
  touch <file>- Create a file
  mkdir <dir> - Create a directory
  cat <file>  - Display file contents
  clear       - Clear terminal
  help        - Show this help message`;
        break;

      case '':
        output = '';
        break;

      default:
        output = `Command not found: ${command}. Type "help" for available commands.`;
    }

    setCommands([...commands, { command: cmd, output }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      executeCommand(input);
      setInput('');
    } else {
      setCommands([...commands, { command: '', output: '' }]);
    }
  };

  const getPrompt = () => {
    const currentFolder = getNode(getCurrentFolderId());
    return `user@webos:${currentFolder?.name || 'home'}$ `;
  };

  return (
    <div className="h-full flex flex-col bg-black text-green-400 font-mono text-sm">
      <div ref={outputRef} className="flex-1 overflow-auto p-4">
        {commands.map((cmd, idx) => (
          <div key={idx} className="mb-2">
            {cmd.command && (
              <div className="text-white">
                <span className="text-green-400">{getPrompt()}</span>
                {cmd.command}
              </div>
            )}
            {cmd.output && (
              <div className="mt-1 whitespace-pre-wrap">{cmd.output}</div>
            )}
          </div>
        ))}
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-green-400">{getPrompt()}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent text-white outline-none border-none"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}

