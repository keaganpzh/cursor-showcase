import Dexie, { Table } from 'dexie';
import { FileSystemNode } from '../types';

class FileSystemDatabase extends Dexie {
  nodes!: Table<FileSystemNode>;

  constructor() {
    super('WebOSFileSystem');
    this.version(1).stores({
      nodes: 'id, name, type, parentId, createdAt, modifiedAt',
    });
  }
}

const db = new FileSystemDatabase();

export const FileSystemService = {
  async getAllNodes(): Promise<FileSystemNode[]> {
    const nodes = await db.nodes.toArray();
    if (nodes.length === 0) {
      await this.initializeDefaultFilesystem();
      return await db.nodes.toArray();
    }
    return nodes;
  },

  async initializeDefaultFilesystem(): Promise<void> {
    const now = Date.now();
    const homeFolder: FileSystemNode = {
      id: 'home',
      name: 'Home',
      type: 'folder',
      parentId: null,
      createdAt: now,
      modifiedAt: now,
    };
    const documentsFolder: FileSystemNode = {
      id: 'documents',
      name: 'Documents',
      type: 'folder',
      parentId: 'home',
      createdAt: now,
      modifiedAt: now,
    };
    const desktopFolder: FileSystemNode = {
      id: 'desktop',
      name: 'Desktop',
      type: 'folder',
      parentId: 'home',
      createdAt: now,
      modifiedAt: now,
    };
    const welcomeFile: FileSystemNode = {
      id: 'welcome',
      name: 'Welcome.txt',
      type: 'file',
      parentId: 'documents',
      content: 'Welcome to WebOS Simulator!\n\nThis is a simulated macOS-like environment running in your browser.',
      createdAt: now,
      modifiedAt: now,
    };
    await db.nodes.bulkAdd([homeFolder, documentsFolder, desktopFolder, welcomeFile]);
  },

  async createNode(name: string, type: 'file' | 'folder', parentId: string | null): Promise<string> {
    const now = Date.now();
    const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const node: FileSystemNode = {
      id,
      name,
      type,
      parentId,
      content: type === 'file' ? '' : undefined,
      createdAt: now,
      modifiedAt: now,
    };
    await db.nodes.add(node);
    return id;
  },

  async deleteNode(id: string): Promise<void> {
    const node = await db.nodes.get(id);
    if (!node) return;
    
    if (node.type === 'folder') {
      const children = await db.nodes.where('parentId').equals(id).toArray();
      for (const child of children) {
        await this.deleteNode(child.id);
      }
    }
    await db.nodes.delete(id);
  },

  async renameNode(id: string, newName: string): Promise<void> {
    await db.nodes.update(id, { 
      name: newName,
      modifiedAt: Date.now(),
    });
  },

  async updateFileContent(id: string, content: string): Promise<void> {
    await db.nodes.update(id, {
      content,
      modifiedAt: Date.now(),
    });
  },

  async getNode(id: string): Promise<FileSystemNode | undefined> {
    return await db.nodes.get(id);
  },
};

