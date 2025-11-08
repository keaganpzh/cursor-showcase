import { useState, useEffect } from 'react';
import { Save, FolderOpen } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { getFilesByParent, updateFile, createFile, getFileById } from '@/db/fileSystem';

interface TextEditorProps {
  windowId: string;
}

export default function TextEditor({ windowId }: TextEditorProps) {
  const [content, setContent] = useState('');
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [fileName, setFileName] = useState('Untitled');
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<string | null>('documents');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const files = useLiveQuery(
    () => getFilesByParent(currentFolder),
    [currentFolder]
  );

  const textFiles = files?.filter(f => f.type === 'file');

  useEffect(() => {
    if (currentFileId) {
      loadFile(currentFileId);
    }
  }, [currentFileId]);

  const loadFile = async (fileId: string) => {
    const file = await getFileById(fileId);
    if (file) {
      setContent(file.content || '');
      setFileName(file.name);
      setCurrentFileId(file.id);
      setHasUnsavedChanges(false);
    }
  };

  const handleSave = async () => {
    if (currentFileId) {
      await updateFile(currentFileId, { content });
      setHasUnsavedChanges(false);
    } else {
      const newFile = await createFile(fileName, currentFolder || 'documents', content, 'file');
      setCurrentFileId(newFile.id);
      setHasUnsavedChanges(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleNewFile = () => {
    setContent('');
    setCurrentFileId(null);
    setFileName('Untitled');
    setHasUnsavedChanges(false);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={fileName}
            onChange={(e) => {
              setFileName(e.target.value);
              setHasUnsavedChanges(true);
            }}
            className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium"
          />
          {hasUnsavedChanges && <span className="text-orange-500 text-sm">●</span>}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleNewFile}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
          >
            New
          </button>
          <button
            onClick={() => setShowFilePicker(!showFilePicker)}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2"
          >
            <FolderOpen size={16} />
            Open
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      {showFilePicker && (
        <div className="p-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Open File:</div>
          <div className="space-y-1 max-h-40 overflow-auto">
            {textFiles?.map((file) => (
              <button
                key={file.id}
                onClick={() => {
                  loadFile(file.id);
                  setShowFilePicker(false);
                }}
                className="w-full text-left px-3 py-2 bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded text-sm"
              >
                {file.name}
              </button>
            ))}
            {(!textFiles || textFiles.length === 0) && (
              <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
                No files in Documents folder
              </div>
            )}
          </div>
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        className="flex-1 p-4 resize-none focus:outline-none font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        placeholder="Start typing..."
      />
    </div>
  );
}

