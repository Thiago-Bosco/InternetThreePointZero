import { pgTable, text, serial, integer, boolean, jsonb, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Usuário - informações básicas do usuário
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  publicKey: text("publicKey").notNull(),
  privateKeyEncrypted: text("privateKeyEncrypted").notNull(),
  profileIpfsHash: text("profileIpfsHash"),
  createdAt: timestamp("createdAt").defaultNow(),
});

// Favoritos - lista de favoritos do usuário
export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  title: text("title").notNull(),
  ipfsHash: text("ipfsHash").notNull(),
  dateAdded: timestamp("dateAdded").defaultNow(),
});

// Arquivos - registros de arquivos compartilhados
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  fileName: text("fileName").notNull(),
  fileSize: integer("fileSize").notNull(),
  ipfsHash: text("ipfsHash").notNull(),
  isPublic: boolean("isPublic").default(true),
  mimeType: text("mimeType"),
  dateUploaded: timestamp("dateUploaded").defaultNow(),
});

// Contatos - lista de contatos do usuário
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  contactUsername: text("contactUsername").notNull(),
  contactPublicKey: text("contactPublicKey").notNull(),
  lastConnected: timestamp("lastConnected"),
});

// Postagens de feed - conteúdo publicado no feed pessoal
export const feedPosts = pgTable("feedPosts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  content: text("content").notNull(),
  ipfsHash: text("ipfsHash").notNull(),
  attachments: jsonb("attachments").$type<string[]>(),
  datePosted: timestamp("datePosted").defaultNow(),
});

// Histórico de navegação 
export const browsingHistory = pgTable("browsingHistory", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  ipfsHash: text("ipfsHash").notNull(),
  title: text("title"),
  visitedAt: timestamp("visitedAt").defaultNow(),
});

// Definição de schemas para inserção

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({
  id: true,
  dateAdded: true,
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true, 
  dateUploaded: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
});

export const insertFeedPostSchema = createInsertSchema(feedPosts).omit({
  id: true,
  datePosted: true,
});

export const insertBrowsingHistorySchema = createInsertSchema(browsingHistory).omit({
  id: true,
  visitedAt: true,
});

// Tipos de Inserção
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type InsertFeedPost = z.infer<typeof insertFeedPostSchema>;
export type InsertBrowsingHistory = z.infer<typeof insertBrowsingHistorySchema>;

// Tipos de Seleção
export type User = typeof users.$inferSelect;
export type Bookmark = typeof bookmarks.$inferSelect;
export type File = typeof files.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type FeedPost = typeof feedPosts.$inferSelect;
export type BrowsingHistory = typeof browsingHistory.$inferSelect;
