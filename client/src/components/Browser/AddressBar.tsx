import { useState, FormEvent, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, ArrowRight, Search } from 'lucide-react';

interface AddressBarProps {
  url: string;
  isLoading: boolean;
  onNavigate: (url: string) => void;
}

export default function AddressBar({ url, isLoading, onNavigate }: AddressBarProps) {
  const [inputUrl, setInputUrl] = useState(url);

  // Atualizar o input quando a URL mudar externamente
  useState(() => {
    setInputUrl(url);
  });

  const mockIpfsContent = {
    'QmdefaultHome': { 
      keywords: ['home', 'inicio', 'principal'], 
      title: 'Página Inicial', 
      description: 'Página inicial da Internet 3.0',
      type: 'webpage'
    },
    'QmSample1': { 
      keywords: ['tutorial', 'ipfs', 'blockchain'], 
      title: 'Tutorial IPFS', 
      description: 'Guia básico sobre IPFS',
      type: 'article'
    },
    'QmSample2': { 
      keywords: ['blockchain', 'tech', 'descentralização'], 
      title: 'Tecnologia Blockchain', 
      description: 'Explicação sobre blockchain e IPFS',
      type: 'article'
    },
    'search-not-found': {
      keywords: [], 
      title: 'Busca sem resultados', 
      description: 'Nenhum resultado encontrado para sua busca.',
      type: 'error'
    }
  };

  const searchTypes = ['webpage', 'article', 'image', 'video', 'audio'];


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedUrl = inputUrl.trim();

    // Se não for uma URL válida, tratar como pesquisa
    if (!trimmedUrl.startsWith('http://') && 
        !trimmedUrl.startsWith('https://') && 
        !trimmedUrl.startsWith('ipfs://')) {
      onNavigate(`search:${trimmedUrl}`);
    } else {
      onNavigate(trimmedUrl);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleRefresh = () => {
    onNavigate(url);
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
      <Button 
        type="button"
        variant="ghost" 
        size="icon"
        disabled={isLoading}
        title="Atualizar"
        onClick={handleRefresh}
        className="hover:bg-accent"
      >
        <RefreshCw size={16} className={`transition-all duration-300 ${isLoading ? 'animate-spin text-primary' : ''}`} />
      </Button>

      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search size={16} className="text-muted-foreground/60" />
        </div>
        <Input
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite um hash IPFS, ipfs://... ou https://..., ou ?palavra-chave"
          className="pl-9 pr-12 h-10 bg-muted/50 border-muted hover:bg-background focus:bg-background transition-colors focus-within:ring-2 focus-within:ring-primary/20"
          disabled={isLoading}
          autoComplete="off"
          spellCheck="false"
          type="url"
          list="search-suggestions"
        />
        <datalist id="search-suggestions">
          {searchTypes.map(type => (
            <option key={type} value={`?type:${type}`} />
          ))}
        </datalist>
      </div>

      <Button 
        type="submit" 
        variant="ghost"
        size="icon"
        disabled={isLoading || !inputUrl.trim()}
        title="Navegar"
        className="hover:bg-accent"
      >
        <ArrowRight size={16} className="text-primary" />
      </Button>
    </form>
  );
}