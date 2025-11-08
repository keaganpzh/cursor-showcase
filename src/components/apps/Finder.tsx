import { useState, useEffect } from 'react';
import { useFileSystemStore } from '../../stores';
import { FileSystemNode } from '../../types';

export default function Finder() {
  const { nodes, getChildren, getNode, createNode, deleteNode, renameNode, currentPath, navigateTo } = useFileSystemStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    if (currentPath.length === 0) {
      navigateTo(['home']);
    }
  }, [currentPath, navigateTo]);

  const currentFolderId = currentPath[currentPath.length - 1] || 'home';
  const currentFolder = getNode(currentFolderId);
  const children = getChildren(currentFolderId);

  const handleDoubleClick = (node: FileSystemNode) => {
    if (node.type === 'folder') {
      navigateTo([...currentPath, node.id]);
    } else {
      const { addWindow } = require('../../stores').useAppStore.getState();
      addWindow('texteditor', node.name);
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt('Folder name:');
    if (name) {
      await createNode(name, 'folder', currentFolderId);
    }
  };

  const handleCreateFile = async () => {
    const name = prompt('File name:');
    if (name) {
      await createNode(name, 'file', currentFolderId);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteNode(id);
    }
  };

  const handleRename = (node: FileSystemNode) => {
    setRenamingId(node.id);
    setNewName(node.name);
  };

  const saveRename = async () => {
    if (renamingId && newName.trim()) {
      await renameNode(renamingId, newName.trim());
      setRenamingId(null);
      setNewName('');
    }
  };

  const handleDragStart = (e: React.DragEvent, nodeId: string) => {
    setDraggedId(nodeId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    if (draggedId) {
      const draggedNode = getNode(draggedId);
      if (draggedNode && draggedNode.parentId !== targetFolderId) {
        await deleteNode(draggedId);
        await createNode(draggedNode.name, draggedNode.type, targetFolderId);
        if (draggedNode.type === 'file' && draggedNode.content) {
          const newNodes = useFileSystemStore.getState().nodes;
          const newNode = newNodes.find(n => n.name === draggedNode.name && n.parentId === targetFolderId);
          if (newNode) {
            await useFileSystemStore.getState().updateFileContent(newNode.id, draggedNode.content);
          }
        }
      }
      setDraggedId(null);
    }
  };

  const goBack = () => {
    if (currentPath.length > 0) {
      navigateTo(currentPath.slice(0, -1));
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-gray-100 border-b border-gray-300 p-2 flex items-center gap-2">
        <button
          onClick={goBack}
          disabled={currentPath.length === 0}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Back
        </button>
        <div className="flex-1 text-sm text-gray-600">
          {currentPath.map((id, idx) => {
            const node = getNode(id);
            return (
              <span key={id}>
                {node?.name || id}
                {idx < currentPath.length - 1 && ' / '}
              </span>
            );
          })}
        </div>
        <button
          onClick={handleCreateFolder}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          New Folder
        </button>
        <button
          onClick={handleCreateFile}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          New File
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-6 gap-4">
          {children.map((node) => (
            <div
              key={node.id}
              draggable
              onDragStart={(e) => handleDragStart(e, node.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, currentFolderId)}
              className={`flex flex-col items-center p-3 rounded-lg cursor-pointer transition-colors ${
                selectedId === node.id ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
              onClick={() => setSelectedId(node.id)}
              onDoubleClick={() => handleDoubleClick(node)}
            >
              <div className="text-4xl mb-2">
                {node.type === 'folder' ? '📁' : '📄'}
              </div>
              {renamingId === node.id ? (
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={saveRename}
                  onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                  className="text-xs text-center border border-blue-500 rounded px-1"
                  autoFocus
                />
              ) : (
                <div className="text-xs text-center break-words max-w-full">
                  {node.name}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {selectedId && (
        <div className="border-t border-gray-300 p-2 bg-gray-100 flex gap-2">
          <button
            onClick={() => handleRename(getNode(selectedId)!)}
            className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Rename
          </button>
          <button
            onClick={() => handleDelete(selectedId)}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

