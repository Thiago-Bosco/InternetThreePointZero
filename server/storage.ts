import { 
  users, type User, type InsertUser,
  bookmarks, type Bookmark, type InsertBookmark,
  files, type File, type InsertFile,
  contacts, type Contact, type InsertContact,
  feedPosts, type FeedPost, type InsertFeedPost,
  browsingHistory, type BrowsingHistory, type InsertBrowsingHistory
} from "@shared/schema";

// Interface de armazenamento para todas as operações CRUD
export interface IStorage {
  // Usuários
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByPublicKey(publicKey: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Favoritos
  getBookmarks(userId: number): Promise<Bookmark[]>;
  getBookmark(id: number): Promise<Bookmark | undefined>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(id: number): Promise<void>;
  
  // Arquivos
  getFiles(userId: number): Promise<File[]>;
  getPublicFiles(): Promise<File[]>;
  getFileById(id: number): Promise<File | undefined>;
  getFileByHash(ipfsHash: string): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  updateFileVisibility(id: number, isPublic: boolean): Promise<File | undefined>;
  deleteFile(id: number): Promise<void>;
  
  // Contatos
  getContacts(userId: number): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContactLastConnected(id: number, lastConnected: Date): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<void>;
  
  // Feed
  getFeedPosts(userId: number): Promise<FeedPost[]>;
  getFeedPost(id: number): Promise<FeedPost | undefined>;
  createFeedPost(post: InsertFeedPost): Promise<FeedPost>;
  deleteFeedPost(id: number): Promise<void>;
  
  // Histórico
  getBrowsingHistory(userId: number, limit?: number): Promise<BrowsingHistory[]>;
  createBrowsingHistory(entry: InsertBrowsingHistory): Promise<BrowsingHistory>;
  clearBrowsingHistory(userId: number): Promise<void>;
}

// Implementação de armazenamento em memória
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bookmarks: Map<number, Bookmark>;
  private files: Map<number, File>;
  private contacts: Map<number, Contact>;
  private feedPosts: Map<number, FeedPost>;
  private browsingHistory: Map<number, BrowsingHistory>;
  
  private userIdCounter: number;
  private bookmarkIdCounter: number;
  private fileIdCounter: number;
  private contactIdCounter: number;
  private feedPostIdCounter: number;
  private browsingHistoryIdCounter: number;

  constructor() {
    this.users = new Map();
    this.bookmarks = new Map();
    this.files = new Map();
    this.contacts = new Map();
    this.feedPosts = new Map();
    this.browsingHistory = new Map();
    
    this.userIdCounter = 1;
    this.bookmarkIdCounter = 1;
    this.fileIdCounter = 1;
    this.contactIdCounter = 1;
    this.feedPostIdCounter = 1;
    this.browsingHistoryIdCounter = 1;
  }

  // Implementação de Usuários
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByPublicKey(publicKey: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.publicKey === publicKey
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  // Implementação de Favoritos
  async getBookmarks(userId: number): Promise<Bookmark[]> {
    return Array.from(this.bookmarks.values()).filter(
      (bookmark) => bookmark.userId === userId
    );
  }

  async getBookmark(id: number): Promise<Bookmark | undefined> {
    return this.bookmarks.get(id);
  }

  async createBookmark(bookmark: InsertBookmark): Promise<Bookmark> {
    const id = this.bookmarkIdCounter++;
    const dateAdded = new Date();
    const newBookmark: Bookmark = { ...bookmark, id, dateAdded };
    this.bookmarks.set(id, newBookmark);
    return newBookmark;
  }

  async deleteBookmark(id: number): Promise<void> {
    this.bookmarks.delete(id);
  }

  // Implementação de Arquivos
  async getFiles(userId: number): Promise<File[]> {
    return Array.from(this.files.values()).filter(
      (file) => file.userId === userId
    );
  }

  async getPublicFiles(): Promise<File[]> {
    return Array.from(this.files.values()).filter(
      (file) => file.isPublic === true
    );
  }

  async getFileById(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getFileByHash(ipfsHash: string): Promise<File | undefined> {
    return Array.from(this.files.values()).find(
      (file) => file.ipfsHash === ipfsHash
    );
  }

  async createFile(file: InsertFile): Promise<File> {
    const id = this.fileIdCounter++;
    const dateUploaded = new Date();
    const newFile: File = { ...file, id, dateUploaded };
    this.files.set(id, newFile);
    return newFile;
  }

  async updateFileVisibility(id: number, isPublic: boolean): Promise<File | undefined> {
    const file = this.files.get(id);
    if (!file) return undefined;
    
    const updatedFile: File = { ...file, isPublic };
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async deleteFile(id: number): Promise<void> {
    this.files.delete(id);
  }

  // Implementação de Contatos
  async getContacts(userId: number): Promise<Contact[]> {
    return Array.from(this.contacts.values()).filter(
      (contact) => contact.userId === userId
    );
  }

  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const id = this.contactIdCounter++;
    const newContact: Contact = { ...contact, id };
    this.contacts.set(id, newContact);
    return newContact;
  }

  async updateContactLastConnected(id: number, lastConnected: Date): Promise<Contact | undefined> {
    const contact = this.contacts.get(id);
    if (!contact) return undefined;
    
    const updatedContact: Contact = { ...contact, lastConnected };
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }

  async deleteContact(id: number): Promise<void> {
    this.contacts.delete(id);
  }

  // Implementação de Feed
  async getFeedPosts(userId: number): Promise<FeedPost[]> {
    return Array.from(this.feedPosts.values())
      .filter((post) => post.userId === userId)
      .sort((a, b) => b.datePosted.getTime() - a.datePosted.getTime());
  }

  async getFeedPost(id: number): Promise<FeedPost | undefined> {
    return this.feedPosts.get(id);
  }

  async createFeedPost(post: InsertFeedPost): Promise<FeedPost> {
    const id = this.feedPostIdCounter++;
    const datePosted = new Date();
    const newPost: FeedPost = { ...post, id, datePosted };
    this.feedPosts.set(id, newPost);
    return newPost;
  }

  async deleteFeedPost(id: number): Promise<void> {
    this.feedPosts.delete(id);
  }

  // Implementação de Histórico
  async getBrowsingHistory(userId: number, limit?: number): Promise<BrowsingHistory[]> {
    const history = Array.from(this.browsingHistory.values())
      .filter((entry) => entry.userId === userId)
      .sort((a, b) => b.visitedAt.getTime() - a.visitedAt.getTime());
    
    return limit ? history.slice(0, limit) : history;
  }

  async createBrowsingHistory(entry: InsertBrowsingHistory): Promise<BrowsingHistory> {
    const id = this.browsingHistoryIdCounter++;
    const visitedAt = new Date();
    const newEntry: BrowsingHistory = { ...entry, id, visitedAt };
    this.browsingHistory.set(id, newEntry);
    return newEntry;
  }

  async clearBrowsingHistory(userId: number): Promise<void> {
    for (const [id, entry] of this.browsingHistory.entries()) {
      if (entry.userId === userId) {
        this.browsingHistory.delete(id);
      }
    }
  }
}

// Instância compartilhada do armazenamento
export const storage = new MemStorage();
