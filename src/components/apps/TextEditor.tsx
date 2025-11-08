import { useState, useEffect } from 'react';
import { useFileSystemStore } from '../../stores';
import { useAppStore } from '../../stores';

export default function TextEditor() {
  const { nodes, getNode, updateFileContent, createNode, loadNodes } = useFileSystemStore();
  const { activeWindowId, windows } = useAppStore();
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('Untitled');
  const [fileId, setFileId] = useState<string | null>(null);
  const [saved, setSaved] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNodes();
  }, [loadNodes]);

  useEffect(() => {
    const activeWindow = windows.find(w => w.id === activeWindowId);
    if (activeWindow?.title && activeWindow.title !== 'Text Editor') {
      const file = nodes.find(n => n.name === activeWindow.title && n.type === 'file');
      if (file) {
        setFileId(file.id);
        setFileName(file.name);
        setContent(file.content || '');
        setSaved(true);
      } else {
        setFileId(null);
        setFileName('Untitled');
        setContent('');
        setSaved(true);
      }
    } else {
      setFileId(null);
      setFileName('Untitled');
      setContent('');
      setSaved(true);
    }
  }, [activeWindowId, windows, nodes]);

  const handleSave = async () => {
    if (fileId) {
      try {
        await updateFileContent(fileId, content);
        setSaved(true);
      } catch (error) {
        console.error('Failed to save file:', error);
        setError('Failed to save file. Please try again.');
      }
    } else {
      const name = prompt('File name:', fileName);
      if (name && name.trim()) {
        try {
          const homeFolder = nodes.find(n => n.id === 'home');
          const parentId = homeFolder?.id || null;
          const newFileId = await createNode(name.trim(), 'file', parentId);
          if (newFileId) {
            await updateFileContent(newFileId, content);
            setFileId(newFileId);
            setFileName(name.trim());
            setSaved(true);
          }
        } catch (error) {
          console.error('Failed to create file:', error);
          alert('Failed to create file. Please try again.');
        }
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {error && (
        <div className="p-2 bg-red-50 border-b border-red-200 text-xs text-red-600">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}
      <div 
        className="border-b p-3 flex items-center justify-between"
        style={{
          background: 'linear-gradient(to bottom, #ffffff 0%, #f8f8f8 100%)',
          borderBottom: '0.5px solid rgba(0, 0, 0, 0.1)',
        }}
      >
        <span className="text-xs font-medium text-gray-700">{fileName}</span>
        <div className="flex items-center gap-3">
          {!saved && (
            <span className="text-xs text-orange-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
              Unsaved
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-medium text-white rounded-md transition-all duration-150"
            style={{
              background: '#007aff',
              border: '0.5px solid rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#0051d5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#007aff';
            }}
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
        className="flex-1 w-full p-6 font-mono text-sm border-none outline-none resize-none bg-white"
        style={{
          color: '#1d1d1f',
          lineHeight: '1.6',
        }}
        placeholder="Start typing..."
      />
    </div>
  );
}

