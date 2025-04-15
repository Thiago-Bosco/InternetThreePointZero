import { useState, useEffect } from 'react';
import { useP2P } from '@/context/P2PContext';
import { Skeleton } from '@/components/ui/skeleton';

interface ContentViewerProps {
  ipfsHash: string;
  isLoading: boolean;
}

export default function ContentViewer({ ipfsHash, isLoading }: ContentViewerProps) {
  const [content, setContent] = useState<string | null>(null);
  const [contentType, setContentType] = useState<string>('text/html');
  const [error, setError] = useState<string | null>(null);
  const { fetchIPFSContent } = useP2P();
  
  useEffect(() => {
    const loadContent = async () => {
      if (!ipfsHash) {
        setContent(null);
        setError(null);
        return;
      }
      
      try {
        // Buscar conteúdo do IPFS
        const data = await fetchIPFSContent(ipfsHash);
        
        // Converter para string
        const textDecoder = new TextDecoder('utf-8');
        const contentText = textDecoder.decode(data);
        
        // Tentar determinar o tipo de conteúdo
        let detectedType = 'text/plain';
        
        if (contentText.trim().startsWith('<!DOCTYPE html>') || 
            contentText.trim().startsWith('<html>')) {
          detectedType = 'text/html';
        } else if (contentText.trim().startsWith('{') || 
                  contentText.trim().startsWith('[')) {
          detectedType = 'application/json';
        }
        
        setContentType(detectedType);
        setContent(contentText);
        setError(null);
      } catch (error: any) {
        console.error('Erro ao carregar conteúdo:', error);
        setContent(null);
        setError(`Erro ao carregar conteúdo: ${error.message}`);
      }
    };
    
    if (!isLoading && ipfsHash) {
      loadContent();
    }
  }, [ipfsHash, isLoading, fetchIPFSContent]);
  
  if (isLoading) {
    return (
      <div className="p-4 h-full">
        <Skeleton className="w-full h-8 mb-4" />
        <Skeleton className="w-3/4 h-6 mb-2" />
        <Skeleton className="w-5/6 h-6 mb-2" />
        <Skeleton className="w-2/3 h-6 mb-6" />
        
        <Skeleton className="w-full h-40 mb-4" />
        
        <Skeleton className="w-full h-6 mb-2" />
        <Skeleton className="w-4/5 h-6 mb-2" />
        <Skeleton className="w-3/5 h-6 mb-2" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full">
        <div className="bg-red-50 text-red-500 p-4 rounded-md max-w-md">
          <h3 className="text-lg font-medium mb-2">Erro ao carregar conteúdo</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }
  
  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Internet 3.0</h1>
          <p className="text-muted-foreground mb-6">
            Digite um hash IPFS na barra de endereço para começar a navegar 
            na web descentralizada.
          </p>
          <div className="border border-dashed border-border rounded-md p-4 text-sm text-muted-foreground">
            <p className="mb-2">Exemplos de formato:</p>
            <code className="block mb-1">ipfs://QmHash...</code>
            <code className="block">QmHash...</code>
          </div>
        </div>
      </div>
    );
  }
  
  if (contentType === 'text/html') {
    // Sandbox para conteúdo HTML
    return (
      <iframe
        sandbox="allow-scripts allow-same-origin"
        srcDoc={content}
        className="w-full h-full border-none"
        title={`IPFS Content: ${ipfsHash}`}
      />
    );
  } else if (contentType === 'application/json') {
    // Formatar e exibir JSON
    try {
      const formattedJson = JSON.stringify(JSON.parse(content), null, 2);
      return (
        <pre className="p-4 font-mono text-sm overflow-auto h-full bg-card text-card-foreground">
          {formattedJson}
        </pre>
      );
    } catch {
      // Se não for JSON válido, exibir como texto
      return (
        <pre className="p-4 font-mono text-sm overflow-auto h-full bg-card text-card-foreground">
          {content}
        </pre>
      );
    }
  } else {
    // Exibir como texto simples
    return (
      <pre className="p-4 font-mono text-sm overflow-auto h-full bg-card text-card-foreground">
        {content}
      </pre>
    );
  }
}
