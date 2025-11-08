import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Folder, File, ArrowLeft, Home, Trash2 } from 'lucide-react';
import { getFilesByParent, createFile, deleteFile, updateFile, getFileById } from '@/db/fileSystem';
import { FileSystemItem } from '@/types';

interface FinderProps {
  windowId: string;
}

export default function Finder({ windowId }: FinderProps) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>('home');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<'file' | 'folder' | null>(null);
  const [newItemName, setNewItemName] = useState('');

  const items = useLiveQuery(
    () => getFilesByParent(currentFolderId),
    [currentFolderId]
  );

  const currentFolder = useLiveQuery(
    () => currentFolderId ? getFileById(currentFolderId) : Promise.resolve(null),
    [currentFolderId]
  );

  useEffect(() => {
    setSelectedItem(null);
  }, [currentFolderId]);

  const handleItemDoubleClick = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      setCurrentFolderId(item.id);
    }
  };

  const handleBack = () => {
    if (currentFolder?.parentId !== undefined) {
      setCurrentFolderId(currentFolder.parentId);
    }
  };

  const handleCreateItem = async () => {
    if (newItemName.trim() && isCreating) {
      await createFile(newItemName, currentFolderId || 'home', '', isCreating);
      setNewItemName('');
      setIsCreating(null);
    }
  };

  const handleDeleteItem = async () => {
    if (selectedItem) {
      await deleteFile(selectedItem);
      setSelectedItem(null);
    }
  };

  const handleRename = async (itemId: string, newName: string) => {
    await updateFile(itemId, { name: newName });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <button
          onClick={handleBack}
          disabled={!currentFolder?.parentId && currentFolder?.parentId !== null}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          onClick={() => setCurrentFolderId('home')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          <Home size={18} />
        </button>
        <div className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentFolder?.name || 'Root'}
        </div>
        <button
          onClick={() => setIsCreating('folder')}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          New Folder
        </button>
        <button
          onClick={() => setIsCreating('file')}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          New File
        </button>
        {selectedItem && (
          <button
            onClick={handleDeleteItem}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isCreating && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateItem()}
              placeholder={`Enter ${isCreating} name...`}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleCreateItem}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setIsCreating(null);
                  setNewItemName('');
                }}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded text-sm hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-4">
          {items?.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                selectedItem === item.id
                  ? 'bg-blue-100 dark:bg-blue-900/30'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => setSelectedItem(item.id)}
              onDoubleClick={() => handleItemDoubleClick(item)}
            >
              <div className="flex flex-col items-center gap-2">
                {item.type === 'folder' ? (
                  <Folder size={48} className="text-blue-500" />
                ) : (
                  <File size={48} className="text-gray-500" />
                )}
                <span className="text-sm text-center break-words w-full text-gray-800 dark:text-gray-200">
                  {item.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {items?.length === 0 && !isCreating && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            This folder is empty
          </div>
        )}
      </div>
    </div>
  );
}

