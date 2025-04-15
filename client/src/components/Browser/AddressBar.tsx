import { useState, KeyboardEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw } from 'lucide-react';

interface AddressBarProps {
  url: string;
  isLoading: boolean;
  onNavigate: (url: string) => void;
}

export default function AddressBar({ url, isLoading, onNavigate }: AddressBarProps) {
  const [inputValue, setInputValue] = useState(url);
  
  // Atualizar o valor de entrada quando a URL mudar
  useState(() => {
    setInputValue(url);
  });
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onNavigate(inputValue.trim());
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        onNavigate(inputValue.trim());
      }
    }
  };
  
  const handleRefresh = () => {
    if (url) {
      onNavigate(url);
    }
  };
  
  return (
    <div className="flex-1 flex items-center gap-2">
      <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Digite um hash IPFS ou ipfs://..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9 bg-card"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        
        <Button 
          type="submit" 
          size="sm" 
          variant="ghost"
          disabled={isLoading}
        >
          IR
        </Button>
      </form>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={handleRefresh}
        disabled={isLoading || !url}
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
}
