import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Send, UserPlus, ArrowLeft, RefreshCw } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

// Tipos
interface Contact {
  id: number;
  displayName: string;
  publicKey: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

interface ChatInterfaceProps {
  contact?: Contact;
  messages?: Message[];
  onBackClick?: () => void;
}

export default function ChatInterface() {
  const { isAuthenticated, currentUser } = useUser();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const { toast } = useToast();

  // Carregar contatos (simulação)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadContacts = async () => {
      setIsLoadingContacts(true);
      
      try {
        // Simular carregamento de rede
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Contatos simulados para demonstração
        const mockContacts: Contact[] = [
          {
            id: 1,
            displayName: 'Maria Silva',
            publicKey: 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCqJ8v0',
            isOnline: true,
          },
          {
            id: 2,
            displayName: 'João Oliveira',
            publicKey: 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC9Kf9N',
            isOnline: false,
            lastSeen: new Date(Date.now() - 1000 * 60 * 30) // 30 minutos atrás
          },
          {
            id: 3,
            displayName: 'Carla Mendes',
            publicKey: 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDLjMx8',
            isOnline: true
          }
        ];
        
        setContacts(mockContacts);
      } catch (error) {
        console.error('Erro ao carregar contatos:', error);
        toast({
          title: 'Erro ao carregar contatos',
          description: 'Não foi possível carregar sua lista de contatos',
          variant: 'destructive'
        });
      } finally {
        setIsLoadingContacts(false);
      }
    };
    
    loadContacts();
  }, [isAuthenticated, toast]);
  
  // Carregar mensagens quando um contato é selecionado
  useEffect(() => {
    if (!selectedContact) {
      setMessages([]);
      return;
    }
    
    const loadMessages = async () => {
      setIsLoadingMessages(true);
      
      try {
        // Simular carregamento de rede
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mensagens simuladas para demonstração
        const now = new Date();
        const mockMessages: Message[] = [
          {
            id: 1,
            senderId: selectedContact.id,
            receiverId: 0, // usuário atual
            content: 'Olá! Como você está?',
            timestamp: new Date(now.getTime() - 1000 * 60 * 25), // 25 minutos atrás
            status: 'read'
          },
          {
            id: 2,
            senderId: 0, // usuário atual
            receiverId: selectedContact.id,
            content: 'Estou bem, e você? Tenho boas notícias sobre o projeto!',
            timestamp: new Date(now.getTime() - 1000 * 60 * 20), // 20 minutos atrás
            status: 'read'
          },
          {
            id: 3,
            senderId: selectedContact.id,
            receiverId: 0,
            content: 'Ótimo! Quais são as novidades?',
            timestamp: new Date(now.getTime() - 1000 * 60 * 15), // 15 minutos atrás
            status: 'read'
          },
          {
            id: 4,
            senderId: 0,
            receiverId: selectedContact.id,
            content: 'Conseguimos integrar completamente a navegação IPFS com a interface descentralizada. Os arquivos agora são identificados pelo hash e não pela localização!',
            timestamp: new Date(now.getTime() - 1000 * 60 * 10), // 10 minutos atrás
            status: 'read'
          }
        ];
        
        setMessages(mockMessages);
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
        toast({
          title: 'Erro ao carregar mensagens',
          description: 'Não foi possível carregar o histórico de mensagens',
          variant: 'destructive'
        });
      } finally {
        setIsLoadingMessages(false);
      }
    };
    
    loadMessages();
  }, [selectedContact, toast]);
  
  // Enviar mensagem
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;
    
    setIsSendingMessage(true);
    
    try {
      // Simulação de envio
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Criar nova mensagem
      const newMsg: Message = {
        id: Date.now(),
        senderId: 0, // usuário atual
        receiverId: selectedContact.id,
        content: newMessage,
        timestamp: new Date(),
        status: 'sent'
      };
      
      // Adicionar à lista
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      // Simular recebimento de confirmação
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMsg.id 
              ? { ...msg, status: 'delivered' } 
              : msg
          )
        );
      }, 1000);
      
      // Simulação de resposta automática
      setTimeout(() => {
        const response: Message = {
          id: Date.now() + 1,
          senderId: selectedContact.id,
          receiverId: 0,
          content: 'Isso é incrível! Como funciona a recuperação de conteúdo se um nó estiver offline?',
          timestamp: new Date(),
          status: 'sent'
        };
        
        setMessages(prev => [...prev, response]);
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: 'Erro ao enviar mensagem',
        description: 'A mensagem não pôde ser enviada. Verifique sua conexão.',
        variant: 'destructive'
      });
    } finally {
      setIsSendingMessage(false);
    }
  };
  
  // Formatar hora da mensagem
  const formatMessageTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Formatar status "visto por último"
  const formatLastSeen = (date?: Date): string => {
    if (!date) return 'Há muito tempo';
    
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Agora mesmo';
    if (diffMinutes < 60) return `Há ${diffMinutes} minutos`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Há ${diffHours} horas`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Há ${diffDays} dias`;
  };
  
  // Renderizar iniciais para avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };
  
  // Renderizar lista de contatos
  const renderContactsList = () => {
    if (!isAuthenticated) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <Users size={48} className="text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Faça login para acessar seus contatos</h3>
          <p className="text-muted-foreground">
            Você precisa estar autenticado para utilizar o chat descentralizado
          </p>
        </div>
      );
    }
    
    if (isLoadingContacts) {
      return (
        <div className="flex justify-center items-center h-[300px]">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando contatos...</p>
          </div>
        </div>
      );
    }
    
    if (contacts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px] p-4 text-center">
          <Users size={40} className="text-muted-foreground mb-3" />
          <h3 className="text-base font-medium mb-1">Nenhum contato encontrado</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Adicione contatos para começar a conversar
          </p>
          <Button variant="outline" className="gap-1">
            <UserPlus size={16} />
            <span>Adicionar Contato</span>
          </Button>
        </div>
      );
    }
    
    return (
      <div className="divide-y">
        {contacts.map(contact => (
          <div 
            key={contact.id}
            className={`flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
              selectedContact?.id === contact.id ? 'bg-muted' : ''
            }`}
            onClick={() => setSelectedContact(contact)}
          >
            <div className="relative">
              <Avatar>
                <AvatarImage src={contact.avatarUrl} alt={contact.displayName} />
                <AvatarFallback>{getInitials(contact.displayName)}</AvatarFallback>
              </Avatar>
              
              {contact.isOnline && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <h3 className="font-medium truncate">{contact.displayName}</h3>
                {!contact.isOnline && contact.lastSeen && (
                  <span className="text-xs text-muted-foreground">
                    {formatLastSeen(contact.lastSeen)}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {contact.isOnline ? (
                  <span className="text-green-600 dark:text-green-400">Online</span>
                ) : (
                  'Offline'
                )}
              </div>
            </div>
          </div>
        ))}
        
        <div className="p-3">
          <Button variant="outline" size="sm" className="w-full gap-1">
            <UserPlus size={14} />
            <span>Adicionar Contato</span>
          </Button>
        </div>
      </div>
    );
  };
  
  // Renderizar conversa
  const renderConversation = () => {
    if (!selectedContact) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <Users size={48} className="text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Selecione um contato</h3>
          <p className="text-muted-foreground">
            Escolha um contato para iniciar uma conversa
          </p>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col h-full">
        {/* Cabeçalho da conversa */}
        <div className="flex items-center gap-3 p-3 border-b">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setSelectedContact(null)}
          >
            <ArrowLeft size={18} />
          </Button>
          
          <div className="relative">
            <Avatar>
              <AvatarImage src={selectedContact.avatarUrl} alt={selectedContact.displayName} />
              <AvatarFallback>{getInitials(selectedContact.displayName)}</AvatarFallback>
            </Avatar>
            
            {selectedContact.isOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{selectedContact.displayName}</h3>
            <div className="text-xs text-muted-foreground">
              {selectedContact.isOnline ? (
                <span className="text-green-600 dark:text-green-400">Online</span>
              ) : (
                `Visto por último ${formatLastSeen(selectedContact.lastSeen)}`
              )}
            </div>
          </div>
        </div>
        
        {/* Área de mensagens */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {isLoadingMessages ? (
            <div className="flex justify-center items-center h-full">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Carregando mensagens...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Send size={32} className="text-muted-foreground mb-3" />
              <h3 className="text-base font-medium mb-1">Nenhuma mensagem</h3>
              <p className="text-sm text-muted-foreground">
                Envie uma mensagem para iniciar a conversa
              </p>
            </div>
          ) : (
            messages.map(message => {
              const isCurrentUser = message.senderId === 0;
              
              return (
                <div 
                  key={message.id} 
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${
                      isCurrentUser 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    <div className="text-sm">{message.content}</div>
                    <div className="flex items-center justify-end mt-1 gap-1">
                      <span className="text-xs opacity-70">
                        {formatMessageTime(message.timestamp)}
                      </span>
                      
                      {isCurrentUser && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs">
                                {message.status === 'sent' && '✓'}
                                {message.status === 'delivered' && '✓✓'}
                                {message.status === 'read' && '✓✓'}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {message.status === 'sent' && 'Enviado'}
                              {message.status === 'delivered' && 'Entregue'}
                              {message.status === 'read' && 'Lido'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Formulário de envio */}
        <div className="p-3 border-t">
          <form 
            className="flex gap-2" 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <Input
              placeholder="Digite uma mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isSendingMessage}
            />
            <Button 
              type="submit" 
              disabled={!newMessage.trim() || isSendingMessage}
            >
              <Send size={16} />
            </Button>
          </form>
        </div>
      </div>
    );
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Chat Descentralizado</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 h-[calc(100%-65px)]">
        <div className="grid md:grid-cols-[300px_1fr] h-full divide-x">
          <div className={`${selectedContact ? 'hidden md:block' : 'block'}`}>
            {renderContactsList()}
          </div>
          
          <div className={`${!selectedContact ? 'hidden md:block' : 'block'} h-full`}>
            {renderConversation()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}