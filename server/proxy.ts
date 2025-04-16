import { Request, Response } from "express";
import fetch from "node-fetch";
import { JSDOM } from "jsdom"; // Vamos adicionar essa dependência

// Cache simples em memória
const cache = new Map<
  string,
  { content: any; timestamp: number; headers: any }
>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export async function proxyHandler(req: Request, res: Response) {
  const targetUrl = req.query.url as string;
  const noCache = req.query.nocache === "true";
  const mode = (req.query.mode as string) || "default"; // Novo parâmetro: 'default', 'raw', 'iframe'

  if (!targetUrl) {
    return res.status(400).json({ error: "URL não fornecida" });
  }

  // Verificar cache
  if (!noCache && cache.has(targetUrl)) {
    const cached = cache.get(targetUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("Cache hit:", targetUrl);
      // Restaurar headers do cache
      restoreHeaders(res, cached.headers);
      setSecurityHeaders(res);
      return res.status(200).send(cached.content);
    }
    cache.delete(targetUrl);
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        ...(req.headers.referer && { Referer: req.headers.referer }),
        ...(req.headers.cookie && { Cookie: req.headers.cookie }),
      },
      body: ["POST", "PUT", "PATCH"].includes(req.method)
        ? JSON.stringify(req.body)
        : undefined,
      redirect: "follow",
    });

    // Capturar headers para o cache
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Configurar headers de resposta
    response.headers.forEach((value, key) => {
      if (
        ![
          "connection",
          "keep-alive",
          "transfer-encoding",
          "content-encoding",
        ].includes(key.toLowerCase())
      ) {
        res.setHeader(key, value);
      }
    });

    // Adicionar headers CORS e segurança
    setSecurityHeaders(res);

    const contentType = response.headers.get("content-type") || "";
    const isHtml = contentType.includes("text/html");

    // Configurar status da resposta
    res.status(response.status);

    // Processar conteúdo baseado no modo e tipo
    if (mode === "raw" || !isHtml) {
      // Modo raw ou conteúdo não-HTML: servir diretamente
      const buffer = await response.buffer();
      cacheContent(targetUrl, buffer, responseHeaders, noCache);
      return res.send(buffer);
    } else {
      // Modo default ou iframe para HTML: processar e modificar HTML
      const htmlContent = await response.text();
      let modifiedHtml = htmlContent;

      if (mode === "iframe") {
        modifiedHtml = processHtmlForIframe(htmlContent, targetUrl);
      } else {
        modifiedHtml = processHtml(htmlContent, targetUrl);
      }

      cacheContent(targetUrl, modifiedHtml, responseHeaders, noCache);
      return res.send(modifiedHtml);
    }
  } catch (error) {
    console.error("Erro no proxy:", error);
    res
      .status(500)
      .json({ error: "Erro ao acessar URL", details: error.message });
  }
}

// Função para restaurar os headers da resposta
function restoreHeaders(res: Response, headers: Record<string, string>) {
  Object.entries(headers).forEach(([key, value]) => {
    if (
      ![
        "connection",
        "keep-alive",
        "transfer-encoding",
        "content-encoding",
      ].includes(key.toLowerCase())
    ) {
      res.setHeader(key, value);
    }
  });
}

// Função para adicionar headers de segurança
function setSecurityHeaders(res: Response) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("X-Frame-Options", "ALLOWALL");
  res.setHeader(
    "Content-Security-Policy",
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;",
  );
}

// Função de cache simplificada
function cacheContent(
  url: string,
  content: any,
  headers: Record<string, string>,
  noCache: boolean,
) {
  if (!noCache) {
    cache.set(url, {
      content,
      timestamp: Date.now(),
      headers,
    });
  }
}

// Processa HTML para funcionar bem dentro de iframes
function processHtmlForIframe(html: string, baseUrl: string) {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Adicionar base href para resolver caminhos relativos
    let baseElement = document.querySelector("base");
    if (!baseElement) {
      baseElement = document.createElement("base");
      document.head.insertBefore(baseElement, document.head.firstChild);
    }
    baseElement.href = baseUrl;

    // Modificar links e formulários
    modifyLinksAndForms(document, baseUrl);

    // Remover scripts desnecessários
    document.querySelectorAll("script").forEach((script) => {
      if (script.getAttribute("src")?.includes("www.youtube.com/")) {
        // Manter scripts críticos do YouTube
      } else {
        script.remove();
      }
    });

    return dom.serialize();
  } catch (error) {
    console.error("Erro ao processar HTML para iframe:", error);
    return html; // Retornar HTML original em caso de erro
  }
}

// Modificar links e formulários para o modo iframe
function modifyLinksAndForms(document: Document, baseUrl: string) {
  document.querySelectorAll("a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href && !href.startsWith("javascript:") && !href.startsWith("#")) {
      let fullUrl = new URL(href, baseUrl).toString();
      link.setAttribute(
        "href",
        `/api/proxy?url=${encodeURIComponent(fullUrl)}&mode=iframe`,
      );
      link.setAttribute("target", "_self");
    }
  });

  document.querySelectorAll("form").forEach((form) => {
    const action = form.getAttribute("action") || "";
    if (action) {
      const fullUrl = new URL(action, baseUrl).toString();
      form.setAttribute(
        "action",
        `/api/proxy?url=${encodeURIComponent(fullUrl)}&mode=iframe`,
      );
    }
    form.setAttribute("target", "_self");
  });
}

// Processa HTML para resolver links e recursos
function processHtml(html: string, baseUrl: string) {
  // Atualizar links e src de maneira mais segura
  return html
    .replace(
      /href="(?!http|\/\/|#|javascript:)([^"]*)"/g,
      (match, p1) => `href="${new URL(p1, baseUrl).toString()}"`,
    )
    .replace(
      /src="(?!http|\/\/|data:)([^"]*)"/g,
      (match, p1) => `src="${new URL(p1, baseUrl).toString()}"`,
    );
}
