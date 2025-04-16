import { useEffect, useState } from 'react';

// Simulação de conteúdo IPFS para demonstração
const mockIpfsContent: Record<string, string | { title: string; description: string; keywords: string[]; content: string }> = {
  'QmdefaultHome': {
    title: 'Internet 3.0 Home',
    description: 'Página inicial da Internet 3.0',
    keywords: ['home', 'ipfs', 'p2p', 'descentralizado', 'inicio'],
    content: `
      <html>
        <head><title>Internet 3.0 Home</title></head>
        <body>
          <h1>Bem-vindo à Internet 3.0</h1>
          <p>Este é o navegador descentralizado que permite acessar conteúdo IPFS, compartilhar arquivos P2P e muito mais.</p>
          <ul>
            <li>Acesso a conteúdo descentralizado</li>
            <li>Compartilhamento de arquivos</li>
            <li>Chat P2P seguro</li>
            <li>Feed social descentralizado</li>
          </ul>
          <div id="search-results"></div>
        </body>
      </html>
    `
  },
  'QmSample1': `
    <html>
      <head>
        <title>Exemplo de Página IPFS</title>
        <style>
          body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
          h1 { color: #339933; }
          p { line-height: 1.6; }
          .hash { background: #f0f0f0; padding: 0.5rem; border-radius: 4px; font-family: monospace; }
        </style>
      </head>
      <body>
        <h1>Página de Exemplo IPFS</h1>
        <p>Este é um exemplo de conteúdo armazenado na rede IPFS. O conteúdo é endereçado pelo hash e não por localização.</p>
        <p>Ao contrário dos sites tradicionais, que são localizados por onde estão hospedados, no IPFS o conteúdo é 
        identificado pelo que ele é - seu hash criptográfico exclusivo.</p>
        <p>Hash: <span class="hash">QmSample1</span></p>
        <hr>
        <p><a href="ipfs://QmdefaultHome">Voltar para a página inicial</a></p>
      </body>
    </html>
  `,
  'QmSample2': `
    <html>
      <head>
        <title>Tecnologia Blockchain</title>
        <style>
          body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; background: #f7f9fc; }
          h1 { color: #5561c7; margin-bottom: 1.5rem; }
          h2 { color: #4b5563; margin-top: 2rem; }
          p { line-height: 1.7; color: #374151; }
          .hash { background: #e0e7ff; padding: 0.4rem 0.6rem; border-radius: 4px; font-family: monospace; }
        </style>
      </head>
      <body>
        <h1>Tecnologia Blockchain e IPFS</h1>
        <p>A combinação de IPFS e Blockchain cria um sistema robusto para armazenamento e verificação de informações.</p>

        <h2>Características principais:</h2>
        <ul>
          <li>Descentralização - Sem pontos centrais de controle</li>
          <li>Imutabilidade - Os dados não podem ser alterados retroativamente</li>
          <li>Resolução de conteúdo baseada em hash - Localização por conteúdo, não por servidor</li>
          <li>Resistência à censura - O conteúdo permanece disponível mesmo sob tentativas de bloqueio</li>
        </ul>

        <p>Hash: <span class="hash">QmSample2</span></p>
        <hr>
        <p><a href="ipfs://QmdefaultHome">Voltar para a página inicial</a></p>
      </body>
    </html>
  `
};

interface ContentViewerProps {
  ipfsHash: string;
  isLoading: boolean;
}

export default function ContentViewer({ ipfsHash, isLoading }: ContentViewerProps) {
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Estado para controlar se deve exibir iframe direto para URLs HTTP
  const [isDirectHttpUrl, setIsDirectHttpUrl] = useState(false);
  const [httpUrl, setHttpUrl] = useState('');

  useEffect(() => {
    if (!ipfsHash) {
      setContent('');
      setIsDirectHttpUrl(false);
      return;
    }

    // Verificar se é uma URL HTTP/HTTPS completa
    const isHttpUrl = ipfsHash.startsWith('http://') || ipfsHash.startsWith('https://');

    if (isHttpUrl) {
      // Definir para renderizar diretamente via iframe
      setIsDirectHttpUrl(true);
      setHttpUrl(ipfsHash);
      return;
    } else {
      // Resetar para modo IPFS se não for HTTP
      setIsDirectHttpUrl(false);
    }

    const loadContent = async () => {
      try {
        setError(null);

        // Simulação de busca de conteúdo
        await new Promise(resolve => setTimeout(resolve, 500));

        // Verificar se temos conteúdo simulado para este hash
        if (typeof mockIpfsContent[ipfsHash] === 'string') {
          setContent(mockIpfsContent[ipfsHash]);
        } else if (mockIpfsContent[ipfsHash]) {
          setContent(mockIpfsContent[ipfsHash].content);
        } else {
          // Se não tiver conteúdo específico IPFS, mostrar página de erro
          setContent(`
            <html>
              <head>
                <title>Conteúdo não encontrado</title>
                <style>
                  body { font-family: system-ui, sans-serif; max-width: 600px; margin: 2rem auto; padding: 2rem; background: #fff5f5; color: #7f1d1d; }
                  h1 { margin-bottom: 1rem; }
                  .back { margin-top: 2rem; color: #2563eb; text-decoration: none; }
                  .back:hover { text-decoration: underline; }
                </style>
              </head>
              <body>
                <div style="text-align: center; padding: 2rem;">
                  <h2 style="color: #666; margin-bottom: 1rem;">Conteúdo não encontrado</h2>
                  <p style="margin-bottom: 1rem;">O conteúdo solicitado não está disponível no momento.</p>
                  <div style="background: #f5f5f5; padding: 1rem; border-radius: 4px; margin: 1rem 0;">
                    <code style="color: #666;">${ipfsHash}</code>
                  </div>
                  <p style="color: #666; margin-bottom: 2rem;">
                    Sugestões:
                    <ul style="list-style: none; padding: 0;">
                      <li>• Verifique se o endereço está correto</li>
                      <li>• Tente uma nova busca usando palavras-chave</li>
                      <li>• Explore o conteúdo relacionado abaixo</li>
                    </ul>
                  </p>
                  <a 
                    href="ipfs://QmdefaultHome" 
                    style="display: inline-block; padding: 0.5rem 1rem; background: #0066cc; color: white; text-decoration: none; border-radius: 4px;"
                  >
                    Voltar para a página inicial
                  </a>
                </div>
              </body>
            </html>
          `);
        }
      } catch (err) {
        console.error('Erro ao carregar conteúdo:', err);
        setError('Erro ao carregar conteúdo. Verifique se o endereço está correto.');
      }
    };

    loadContent();
  }, [ipfsHash]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <div className="text-sm text-muted-foreground animate-pulse">
          Carregando conteúdo...
        </div>
        <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-progress"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <h3 className="font-medium mb-2">Erro ao carregar conteúdo</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!ipfsHash) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Internet 3.0</h2>
        <p className="text-muted-foreground">
          Digite um endereço IPFS na barra de endereço para começar a navegar pela web descentralizada.
        </p>
      </div>
    );
  }

  // Renderizar URL HTTP através do proxy
  if (isDirectHttpUrl && httpUrl) {
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(httpUrl)}`;

    return (
      <div className="h-full">
        <iframe 
          src={proxyUrl}
          title={`Web Content: ${httpUrl}`}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Renderizar conteúdo IPFS simulado em um iframe
  return (
    <div className="h-full overflow-auto bg-white dark:bg-zinc-900">
      <div className="max-w-full mx-auto relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="loading-spinner animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/>
          </div>
        ) : (
          <div 
            dangerouslySetInnerHTML={{ __html: content }} 
            className="prose dark:prose-invert max-w-none p-4"
          />
        )}
      </div>ose prose-sm md:prose-base dark:prose-invert max-w-none" />
      </div>
    </div>
  );
}