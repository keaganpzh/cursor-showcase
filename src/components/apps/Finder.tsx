import { useState, useEffect } from 'react';
import { useFileSystemStore } from '../../stores';
import { useAppStore } from '../../stores';
import { FileSystemNode } from '../../types';
import { AiFillFolder, AiFillFile } from 'react-icons/ai';

export default function Finder() {
  const { nodes, getChildren, getNode, createNode, deleteNode, renameNode, currentPath, navigateTo } = useFileSystemStore();
  const { addWindow } = useAppStore();
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
    <div className="h-full flex flex-col" style={{ background: '#f5f5f7' }}>
      <div 
        className="border-b p-3 flex items-center gap-3"
        style={{
          background: 'linear-gradient(to bottom, #ffffff 0%, #f8f8f8 100%)',
          borderBottom: '0.5px solid rgba(0, 0, 0, 0.1)',
        }}
      >
        <button
          onClick={goBack}
          disabled={currentPath.length === 0}
          className="px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: currentPath.length === 0 ? 'rgba(0, 0, 0, 0.05)' : '#007aff',
            color: currentPath.length === 0 ? '#666' : 'white',
            border: '0.5px solid rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            if (currentPath.length > 0) {
              e.currentTarget.style.background = '#0051d5';
            }
          }}
          onMouseLeave={(e) => {
            if (currentPath.length > 0) {
              e.currentTarget.style.background = '#007aff';
            }
          }}
        >
          ← Back
        </button>
        <div className="flex-1 text-xs font-medium text-gray-700 flex items-center gap-1">
          {currentPath.map((id, idx) => {
            const node = getNode(id);
            return (
              <span key={id} className="flex items-center gap-1">
                <span>{node?.name || id}</span>
                {idx < currentPath.length - 1 && <span className="text-gray-400">/</span>}
              </span>
            );
          })}
        </div>
        <button
          onClick={handleCreateFolder}
          className="px-3 py-1.5 text-xs font-medium text-white rounded-md transition-all duration-150"
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
          New Folder
        </button>
        <button
          onClick={handleCreateFile}
          className="px-3 py-1.5 text-xs font-medium text-white rounded-md transition-all duration-150"
          style={{
            background: '#34c759',
            border: '0.5px solid rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#28a745';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#34c759';
          }}
        >
          New File
        </button>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-6 gap-6">
          {children.map((node) => (
            <div
              key={node.id}
              draggable
              onDragStart={(e) => handleDragStart(e, node.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, currentFolderId)}
              className={`flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                selectedId === node.id 
                  ? 'bg-blue-100 scale-105' 
                  : 'hover:bg-white/60 hover:scale-105'
              }`}
              style={{
                boxShadow: selectedId === node.id 
                  ? '0 4px 12px rgba(0, 122, 255, 0.2)' 
                  : '0 2px 8px rgba(0, 0, 0, 0.05)',
              }}
              onClick={() => setSelectedId(node.id)}
              onDoubleClick={() => handleDoubleClick(node)}
            >
              <div className="text-5xl mb-2 filter drop-shadow-sm flex items-center justify-center">
                {node.type === 'folder' ? (
                  <AiFillFolder className="text-blue-500" />
                ) : (
                  <AiFillFile className="text-gray-600" />
                )}
              </div>
              {renamingId === node.id ? (
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={saveRename}
                  onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                  className="text-xs text-center border-2 border-blue-500 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              ) : (
                <div className="text-xs text-center break-words max-w-full font-medium text-gray-700 px-1">
                  {node.name}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {selectedId && (
        <div 
          className="border-t p-3 flex gap-2"
          style={{
            background: 'linear-gradient(to top, #ffffff 0%, #f8f8f8 100%)',
            borderTop: '0.5px solid rgba(0, 0, 0, 0.1)',
          }}
        >
          <button
            onClick={() => handleRename(getNode(selectedId)!)}
            className="px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-150"
            style={{
              background: 'white',
              border: '0.5px solid rgba(0, 0, 0, 0.1)',
              color: '#333',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f5f5f7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
            }}
          >
            Rename
          </button>
          <button
            onClick={() => handleDelete(selectedId)}
            className="px-4 py-1.5 text-xs font-medium text-white rounded-md transition-all duration-150"
            style={{
              background: '#ff3b30',
              border: '0.5px solid rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#d70015';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ff3b30';
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

