import { Contact } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Wifi, WifiOff, Clock } from 'lucide-react';

interface ContactListProps {
  contacts: Contact[];
  isLoading: boolean;
  selectedContactId: number | null;
  onContactSelect: (contactId: number) => void;
  connectedPeers: string[];
}

export default function ContactList({
  contacts,
  isLoading,
  selectedContactId,
  onContactSelect,
  connectedPeers
}: ContactListProps) {
  // Formatar data do último acesso
  const formatLastConnected = (date: Date | null | undefined) => {
    if (!date) return 'Nunca conectou';
    
    const now = new Date();
    const lastDate = new Date(date);
    const diffMs = now.getTime() - lastDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Agora mesmo';
    if (diffMinutes < 60) return `${diffMinutes} min atrás`;
    if (diffHours < 24) return `${diffHours} h atrás`;
    if (diffDays < 30) return `${diffDays} dias atrás`;
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(lastDate);
  };
  
  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (contacts.length === 0) {
    return (
      <div className="p-6 text-center">
        <User className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-3" />
        <h3 className="font-medium mb-1">Nenhum contato</h3>
        <p className="text-sm text-muted-foreground">
          Adicione contatos para começar a conversar
        </p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-[calc(100%-49px)]">
      <div className="p-2">
        {contacts.map((contact) => {
          const isConnected = connectedPeers.includes(contact.contactUsername);
          
          return (
            <div
              key={contact.id}
              className={`
                flex items-center gap-3 p-3 rounded-md cursor-pointer
                ${selectedContactId === contact.id ? 'bg-muted' : 'hover:bg-muted/50'}
              `}
              onClick={() => onContactSelect(contact.id)}
            >
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                {isConnected && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="font-medium truncate">{contact.contactUsername}</p>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatLastConnected(contact.lastConnected)}
                  </div>
                </div>
                
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {isConnected ? (
                    <>
                      <Wifi className="h-3 w-3 mr-1 text-green-500" />
                      <span className="text-green-600">Online</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span>Offline</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
