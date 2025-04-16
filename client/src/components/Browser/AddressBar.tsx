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
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (inputUrl.trim()) {
      onNavigate(inputUrl.trim());
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
          placeholder="Digite um hash IPFS, ipfs://... ou https://..."
          className="pl-9 pr-12 h-10 bg-muted/50 border-muted hover:bg-background focus:bg-background transition-colors"
          disabled={isLoading}
        />
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