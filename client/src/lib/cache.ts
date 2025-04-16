
export class SmartCache {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'internet3_cache';
  private readonly STORE_NAME = 'cached_content';

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
      };
    });
  }

  async set(key: string, value: any, ttl: number = 3600000) {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
    const store = transaction.objectStore(this.STORE_NAME);

    const item = {
      id: key,
      value,
      expires: Date.now() + ttl
    };

    return new Promise((resolve, reject) => {
      const request = store.put(item);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async get(key: string): Promise<any> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
    const store = transaction.objectStore(this.STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const item = request.result;
        if (!item) return resolve(null);
        
        if (item.expires < Date.now()) {
          this.delete(key);
          resolve(null);
        } else {
          resolve(item.value);
        }
      };
    });
  }

  async delete(key: string) {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
    const store = transaction.objectStore(this.STORE_NAME);

    return new Promise<void>((resolve, reject) => {
      const request = store.delete(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}
