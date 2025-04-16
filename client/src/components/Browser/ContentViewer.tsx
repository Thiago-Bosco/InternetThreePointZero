import { useEffect, useState } from 'react';

interface ContentViewerProps {
  ipfsHash: string;
  isLoading: boolean;
}

export default function ContentViewer({ ipfsHash, isLoading }: ContentViewerProps) {
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isDirectHttpUrl, setIsDirectHttpUrl] = useState(false);
  const [httpUrl, setHttpUrl] = useState('');

  useEffect(() => {
    if (!ipfsHash) {
      setContent('');
      setIsDirectHttpUrl(false);
      return;
    }

    const isHttpUrl = ipfsHash.startsWith('http://') || ipfsHash.startsWith('https://');

    if (isHttpUrl) {
      setIsDirectHttpUrl(true);
      setHttpUrl(ipfsHash);
      return;
    } else {
      setIsDirectHttpUrl(false);
    }

    const loadContent = async () => {
      try {
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 500));

        if (ipfsHash.includes('youtube.com') || ipfsHash.includes('youtu.be')) {
          // Tratamento especial para vídeos do YouTube
          const videoId = ipfsHash.includes('v=') 
            ? ipfsHash.split('v=')[1].split('&')[0]
            : ipfsHash.split('/').pop();
            
          setContent(`
            <div class="aspect-video w-full max-w-5xl mx-auto">
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/${videoId}?autoplay=0"
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
              </iframe>
            </div>
          `);
        } else {
          setContent(`
            <div class="p-4 text-center">
              <h2 class="text-2xl font-bold mb-4">Conteúdo não encontrado</h2>
              <p class="text-gray-600">O conteúdo com o hash ${ipfsHash} não está disponível.</p>
            </div>
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
          Digite um endereço IPFS ou URL para começar a navegar.
        </p>
      </div>
    );
  }

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

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="max-w-full mx-auto relative">
        <div 
          dangerouslySetInnerHTML={{ __html: content }} 
          className="prose dark:prose-invert max-w-none p-4"
        />
      </div>
    </div>
  );
}