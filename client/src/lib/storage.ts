// Interface para armazenamento local
interface LocalStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Implementação usando IndexedDB para armazenamento local
export class IndexedDBStorage implements LocalStorage {
  private dbName: string;
  private storeName: string;
  private db: IDBDatabase | null = null;

  constructor(dbName: string = 'internet3DB', storeName: string = 'keyValueStore') {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  // Inicializar o banco de dados
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = (event) => {
        console.error('Erro ao abrir o IndexedDB:', event);
        reject(new Error('Falha ao abrir o banco de dados'));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Criar store se não existir
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };
    });
  }

  // Obter um item do armazenamento
  async getItem(key: string): Promise<string | null> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.value);
        } else {
          resolve(null);
        }
      };

      request.onerror = (event) => {
        console.error('Erro ao recuperar item:', event);
        reject(new Error('Falha ao recuperar item do armazenamento'));
      };
    });
  }

  // Armazenar um item
  async setItem(key: string, value: string): Promise<void> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put({ key, value });

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        console.error('Erro ao armazenar item:', event);
        reject(new Error('Falha ao armazenar item'));
      };
    });
  }

  // Remover um item
  async removeItem(key: string): Promise<void> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        console.error('Erro ao remover item:', event);
        reject(new Error('Falha ao remover item'));
      };
    });
  }

  // Limpar todos os itens
  async clear(): Promise<void> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        console.error('Erro ao limpar armazenamento:', event);
        reject(new Error('Falha ao limpar armazenamento'));
      };
    });
  }
}

// Criar instância singleton do armazenamento local
export const localStorageInstance = new IndexedDBStorage();

// Funções auxiliares para trabalhar com objetos JSON
export async function storeJSON(key: string, value: any): Promise<void> {
  try {
    const jsonString = JSON.stringify(value);
    await localStorageInstance.setItem(key, jsonString);
  } catch (error) {
    console.error('Erro ao armazenar objeto JSON:', error);
    throw error;
  }
}

export async function retrieveJSON<T>(key: string, defaultValue: T | null = null): Promise<T | null> {
  try {
    const jsonString = await localStorageInstance.getItem(key);
    if (!jsonString) return defaultValue;
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Erro ao recuperar objeto JSON:', error);
    return defaultValue;
  }
}

// Funções para armazenamento de abas do navegador
export interface TabData {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  createdAt: number;
  updatedAt: number;
}

export async function saveTabs(tabs: TabData[]): Promise<void> {
  return storeJSON('browser_tabs', tabs);
}

export async function getTabs(): Promise<TabData[]> {
  return retrieveJSON<TabData[]>('browser_tabs', []) || [];
}

// Funções para armazenamento de histórico local
export interface HistoryItem {
  url: string;
  title: string;
  timestamp: number;
}

export async function addToHistory(item: HistoryItem): Promise<void> {
  const history = await retrieveJSON<HistoryItem[]>('browser_history', []) || [];
  history.unshift(item);
  // Limitar tamanho do histórico a 100 itens
  if (history.length > 100) {
    history.pop();
  }
  return storeJSON('browser_history', history);
}

export async function getHistory(): Promise<HistoryItem[]> {
  return retrieveJSON<HistoryItem[]>('browser_history', []) || [];
}

export async function clearHistory(): Promise<void> {
  return storeJSON('browser_history', []);
}
