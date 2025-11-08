import { useState, useEffect } from 'react';
import { useFileSystemStore } from '../../stores';
import { useAppStore } from '../../stores';

export default function TextEditor() {
  const { nodes, getNode, updateFileContent, createNode } = useFileSystemStore();
  const { activeWindowId, windows } = useAppStore();
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('Untitled');
  const [fileId, setFileId] = useState<string | null>(null);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    const activeWindow = windows.find(w => w.id === activeWindowId);
    if (activeWindow?.title && activeWindow.title !== 'Text Editor') {
      const file = nodes.find(n => n.name === activeWindow.title && n.type === 'file');
      if (file) {
        setFileId(file.id);
        setFileName(file.name);
        setContent(file.content || '');
        setSaved(true);
      }
    }
  }, [activeWindowId, windows, nodes]);

  const handleSave = async () => {
    if (fileId) {
      await updateFileContent(fileId, content);
      setSaved(true);
    } else {
      const name = prompt('File name:', fileName);
      if (name) {
        const homeFolder = nodes.find(n => n.id === 'home');
        const newFileId = await createNode(name, 'file', homeFolder?.id || null);
        await updateFileContent(newFileId, content);
        setFileId(newFileId);
        setFileName(name);
        setSaved(true);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-gray-100 border-b border-gray-300 p-2 flex items-center justify-between">
        <span className="text-sm text-gray-600">{fileName}</span>
        <div className="flex gap-2">
          {!saved && <span className="text-xs text-orange-500">Unsaved</span>}
          <button
            onClick={handleSave}
            className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setSaved(false);
        }}
        className="flex-1 w-full p-4 font-mono text-sm border-none outline-none resize-none"
        placeholder="Start typing..."
      />
    </div>
  );
}

