import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowRight } from 'lucide-react';

interface AddressBarProps {
  url: string;
  isLoading: boolean;
  onNavigate: (url: string) => void;
}

export default function AddressBar({ url, isLoading, onNavigate }: AddressBarProps) {
  const handleRefresh = () => {
    onNavigate(url);
  };

  return (
    <div className="flex items-center gap-2">
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
    </div>
  );
}