
import { Request, Response } from 'express';
import fetch from 'node-fetch';

export async function proxyHandler(req: Request, res: Response) {
  const targetUrl = req.query.url as string;

  if (!targetUrl) {
    return res.status(400).json({ error: 'URL não fornecida' });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      }
    });

    // Copiar headers relevantes
    Object.entries(response.headers.raw()).forEach(([key, value]) => {
      // Ignorar headers problemáticos
      if (!['connection', 'keep-alive', 'transfer-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    // Definir CORS para permitir iframe
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    
    // Streaming da resposta
    response.body.pipe(res);
    
  } catch (error) {
    console.error('Erro no proxy:', error);
    res.status(500).json({ error: 'Erro ao acessar URL' });
  }
}
