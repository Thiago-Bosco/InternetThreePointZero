import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertBookmarkSchema, 
  insertFileSchema, 
  insertContactSchema, 
  insertFeedPostSchema, 
  insertBrowsingHistorySchema 
} from "@shared/schema";
import { z } from "zod";
import axios from 'axios'; // Import axios for making HTTP requests

export async function registerRoutes(app: Express): Promise<Server> {
  // Endpoint simples para teste de disponibilidade
  app.get('/api/test', (req: Request, res: Response) => {
    res.status(200).json({ 
      message: "Servidor está funcionando corretamente", 
      timestamp: new Date().toISOString() 
    });
  });

  // Respondendo a solicitações HEAD para testes mais leves
  app.head('/api/test', (req: Request, res: Response) => {
    res.status(200).end();
  });

  // Versão simplificada sem WebSocket para diagnóstico
  app.get('/api/status', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'online',
      serverTime: new Date().toISOString(),
      env: process.env.NODE_ENV,
      message: 'Servidor funcionando no modo diagnóstico'
    });
  });

  const httpServer = createServer(app);

  // WebSocket temporariamente desativado para diagnóstico
  console.log("Modo diagnóstico: WebSocket desativado temporariamente");

  // Rotas para gerenciar usuários
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);

      if (existingUser) {
        return res.status(409).json({ message: "Nome de usuário já existe" });
      }

      const newUser = await storage.createUser(userData);
      return res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // Retornar usuário sem a chave privada por segurança
      const { privateKeyEncrypted, ...safeUser } = user;
      return res.json(safeUser);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Rotas para favoritos
  app.get("/api/users/:userId/bookmarks", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const bookmarks = await storage.getBookmarks(userId);
      return res.json(bookmarks);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/bookmarks", async (req: Request, res: Response) => {
    try {
      const bookmarkData = insertBookmarkSchema.parse(req.body);
      const newBookmark = await storage.createBookmark(bookmarkData);
      return res.status(201).json(newBookmark);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.delete("/api/bookmarks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBookmark(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Rotas para arquivos
  app.get("/api/users/:userId/files", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const files = await storage.getFiles(userId);
      return res.json(files);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/files/public", async (req: Request, res: Response) => {
    try {
      const publicFiles = await storage.getPublicFiles();
      return res.json(publicFiles);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/files", async (req: Request, res: Response) => {
    try {
      const fileData = insertFileSchema.parse(req.body);
      const newFile = await storage.createFile(fileData);
      return res.status(201).json(newFile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.patch("/api/files/:id/visibility", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { isPublic } = req.body;

      if (typeof isPublic !== 'boolean') {
        return res.status(400).json({ message: "Campo isPublic é obrigatório e deve ser booleano" });
      }

      const updatedFile = await storage.updateFileVisibility(id, isPublic);

      if (!updatedFile) {
        return res.status(404).json({ message: "Arquivo não encontrado" });
      }

      return res.json(updatedFile);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.delete("/api/files/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFile(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Rotas para contatos
  app.get("/api/users/:userId/contacts", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const contacts = await storage.getContacts(userId);
      return res.json(contacts);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/contacts", async (req: Request, res: Response) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const newContact = await storage.createContact(contactData);
      return res.status(201).json(newContact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.patch("/api/contacts/:id/lastConnected", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const lastConnected = new Date();

      const updatedContact = await storage.updateContactLastConnected(id, lastConnected);

      if (!updatedContact) {
        return res.status(404).json({ message: "Contato não encontrado" });
      }

      return res.json(updatedContact);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.delete("/api/contacts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteContact(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Rotas para feed posts
  app.get("/api/users/:userId/feed", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const posts = await storage.getFeedPosts(userId);
      return res.json(posts);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/feed/posts", async (req: Request, res: Response) => {
    try {
      const postData = insertFeedPostSchema.parse(req.body);
      const newPost = await storage.createFeedPost(postData);
      return res.status(201).json(newPost);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.delete("/api/feed/posts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFeedPost(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Rotas para histórico de navegação
  app.get("/api/users/:userId/history", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const history = await storage.getBrowsingHistory(userId, limit);
      return res.json(history);
    } catch (error) {
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/history", async (req: Request, res: Response) => {
    try {
      const historyData = insertBrowsingHistorySchema.parse(req.body);
      const newEntry = await storage.createBrowsingHistory(historyData);
      return res.status(201).json(newEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.delete("/api/users/:userId/history", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      await storage.clearBrowsingHistory(userId);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Rota para o serviço de proxy (Node.js implementation)
  app.get("/api/proxy", async (req: Request, res: Response) => {
    const url = req.query.url as string;

    if (!url) {
      return res.status(400).json({ error: 'URL não fornecida' });
    }

    try {
      const response = await axios.get(url);
      res.status(response.status).send(response.data);
    } catch (error: any) {
      console.error("Proxy error:", error);
      res.status(error.response ? error.response.status : 500).json({ error: 'Erro ao acessar a URL' });
    }
  });

  return httpServer;
}