import { useEffect, useState } from 'react';

// Simulação de conteúdo IPFS para demonstração
const mockIpfsContent: Record<string, string> = {
  'QmdefaultHome': `
    <html>
      <head>
        <title>Internet 3.0 Home</title>
        <style>
          body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
          h1 { color: #3366cc; }
          ul { padding-left: 1.5rem; }
          li { margin-bottom: 0.5rem; }
        </style>
      </head>
      <body>
        <h1>Bem-vindo à Internet 3.0</h1>
        <p>Este é o navegador descentralizado que permite acessar conteúdo IPFS, compartilhar arquivos P2P e muito mais.</p>
        <ul>
          <li><strong>Acesso a conteúdo descentralizado</strong> - Navegue em páginas hospedadas no IPFS</li>
          <li><strong>Compartilhamento de arquivos</strong> - Compartilhe arquivos diretamente com outros usuários</li>
          <li><strong>Chat P2P seguro</strong> - Comunique-se de forma privada e segura</li>
          <li><strong>Feed social descentralizado</strong> - Publique e interaja sem intermediários</li>
        </ul>
        <p>Para testar a navegação, digite um dos seguintes hashes na barra de endereço:</p>
        <ul>
          <li>QmSample1 - Página de exemplo</li>
          <li>QmSample2 - Informações sobre blockchain</li>
        </ul>
      </body>
    </html>
  `,
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
        if (mockIpfsContent[ipfsHash]) {
          setContent(mockIpfsContent[ipfsHash]);
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
                <h1>Conteúdo IPFS não encontrado</h1>
                <p>Não foi possível encontrar o conteúdo com o hash <strong>${ipfsHash}</strong>.</p>
                <p>Verifique se o hash está correto ou tente acessar outro conteúdo.</p>
                <a class="back" href="ipfs://QmdefaultHome">Voltar para a página inicial</a>
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
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
  
  // Renderizar URL HTTP diretamente em um iframe com barra de status
  if (isDirectHttpUrl && httpUrl) {
    // Verificar se é YouTube ou outro site que normalmente bloqueia iframes
    const isYouTube = httpUrl.includes('youtube.com') || httpUrl.includes('youtu.be');
    const isGoogleService = httpUrl.includes('google.com') || httpUrl.includes('gmail.com');
    const isRestrictedSite = isYouTube || isGoogleService || 
                            httpUrl.includes('facebook.com') || 
                            httpUrl.includes('instagram.com') ||
                            httpUrl.includes('twitter.com') ||
                            httpUrl.includes('x.com');
    
    // Usar proxy para todos os sites, especialmente os que normalmente bloqueiam iframes
    let displayUrl = `/api/proxy?url=${encodeURIComponent(httpUrl)}`;
    let embeddingNotice = null;
    
    // Mostrar banner informativo para sites com modo de privacidade
    if (isRestrictedSite) {
      embeddingNotice = (
        <div className="bg-blue-100 border-b border-blue-200 p-2 text-sm text-blue-800">
          <div className="flex items-center">
            <div className="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p>
              <strong>Modo de Privacidade:</strong> Navegando em <span className="font-mono">{httpUrl}</span> através do proxy Internet 3.0
            </p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="h-full flex flex-col">
        <div className="bg-blue-50 p-2 text-xs border-b border-blue-200 flex items-center justify-between">
          <div>
            <span className="font-semibold">Internet 3.0:</span> Navegando em conteúdo web tradicional
          </div>
          <div className="text-blue-600">
            <a href="ipfs://QmdefaultHome" className="hover:underline">Voltar para IPFS</a>
          </div>
        </div>
        <div className="flex-1 relative">
          <iframe 
            src={displayUrl}
            title={`Web Content: ${displayUrl}`}
            className="w-full h-full border-none absolute inset-0"
            sandbox="allow-scripts allow-same-origin allow-forms"
            referrerPolicy="no-referrer"
          />
          {embeddingNotice}
        </div>
      </div>
    );
  }
  
  // Renderizar conteúdo IPFS simulado em um iframe
  return (
    <div className="h-full">
      <iframe 
        srcDoc={content}
        title={`IPFS Content: ${ipfsHash}`}
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}