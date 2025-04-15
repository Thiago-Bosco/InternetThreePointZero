
import { Request, Response } from 'express';
import fetch from 'node-fetch';

export async function proxyHandler(req: Request, res: Response) {
  const targetUrl = req.query.url as string;

  if (!targetUrl) {
    return res.status(400).json({ error: 'URL não fornecida' });
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        ...(req.headers.referer && { 'Referer': req.headers.referer }),
        ...(req.headers.cookie && { 'Cookie': req.headers.cookie })
      },
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined,
      redirect: 'follow'
    });

    // Copiar headers de resposta
    const headers = new Headers(response.headers);
    headers.forEach((value, key) => {
      if (!['connection', 'keep-alive', 'transfer-encoding', 'content-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    // Configurar CORS e segurança
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;");

    // Stream da resposta com o tipo de conteúdo correto
    res.status(response.status);
    
    if (response.body) {
      response.body.pipe(res);
    } else {
      res.end();
    }

  } catch (error) {
    console.error('Erro no proxy:', error);
    res.status(500).json({ error: 'Erro ao acessar URL', details: error.message });
  }
}
