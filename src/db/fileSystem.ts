import Dexie, { Table } from 'dexie';
import { FileSystemItem } from '@/types';

class FileSystemDB extends Dexie {
  files!: Table<FileSystemItem, string>;

  constructor() {
    super('WebOSFileSystem');
    this.version(1).stores({
      files: 'id, name, type, parentId, createdAt, modifiedAt'
    });
  }
}

export const db = new FileSystemDB();

export const initializeFileSystem = async () => {
  const count = await db.files.count();
  
  if (count === 0) {
    const now = new Date();
    
    const rootFolders = [
      { id: 'home', name: 'Home', type: 'folder' as const, parentId: null, createdAt: now, modifiedAt: now },
      { id: 'documents', name: 'Documents', type: 'folder' as const, parentId: 'home', createdAt: now, modifiedAt: now },
      { id: 'downloads', name: 'Downloads', type: 'folder' as const, parentId: 'home', createdAt: now, modifiedAt: now },
      { id: 'desktop', name: 'Desktop', type: 'folder' as const, parentId: 'home', createdAt: now, modifiedAt: now },
      { id: 'applications', name: 'Applications', type: 'folder' as const, parentId: null, createdAt: now, modifiedAt: now },
    ];

    const sampleFiles = [
      {
        id: 'welcome-txt',
        name: 'Welcome.txt',
        type: 'file' as const,
        parentId: 'documents',
        content: 'Welcome to WebOS Simulator!\n\nThis is a browser-based macOS simulation.\nFeel free to explore and interact with the environment.',
        createdAt: now,
        modifiedAt: now
      },
      {
        id: 'readme-txt',
        name: 'README.txt',
        type: 'file' as const,
        parentId: 'desktop',
        content: 'WebOS Simulator - macOS-style Desktop Environment\n\nFeatures:\n- Virtual File System\n- Text Editor\n- Terminal\n- Finder\n- Settings',
        createdAt: now,
        modifiedAt: now
      }
    ];

    await db.files.bulkAdd([...rootFolders, ...sampleFiles]);
  }
};

export const createFile = async (name: string, parentId: string, content = '', type: FileType = 'file'): Promise<FileSystemItem> => {
  const now = new Date();
  const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const item: FileSystemItem = {
    id,
    name,
    type,
    parentId,
    content: type === 'file' ? content : undefined,
    createdAt: now,
    modifiedAt: now
  };

  await db.files.add(item);
  return item;
};

export const updateFile = async (id: string, updates: Partial<FileSystemItem>): Promise<void> => {
  await db.files.update(id, { ...updates, modifiedAt: new Date() });
};

export const deleteFile = async (id: string): Promise<void> => {
  const item = await db.files.get(id);
  if (item?.type === 'folder') {
    const children = await db.files.where('parentId').equals(id).toArray();
    for (const child of children) {
      await deleteFile(child.id);
    }
  }
  await db.files.delete(id);
};

export const getFilesByParent = async (parentId: string | null): Promise<FileSystemItem[]> => {
  return await db.files.where('parentId').equals(parentId).toArray();
};

export const getFileById = async (id: string): Promise<FileSystemItem | undefined> => {
  return await db.files.get(id);
};

