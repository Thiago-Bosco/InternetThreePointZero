import { useState, useRef, useEffect } from 'react';
import { Contact } from '@shared/schema';
import { useP2P } from '@/context/P2PContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, PaperclipIcon, Send, ShieldAlert, ShieldCheck, User, Wifi, WifiOff } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatInterfaceProps {
  contact: Contact;
  messages: Array<{sender: string, content: string, timestamp: Date}>;
  onBackClick?: () => void;
}

export default function ChatInterface({ contact, messages, onBackClick }: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState('');
  const { sendMessageToPeer, state } = useP2P();
  const { toast } = useToast();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);
  
  const isConnected = state.connectedPeers.includes(contact.contactUsername);
  
  // Função para determinar se uma mensagem é do usuário atual
  const isOwnMessage = (sender: string) => sender === 'me' || sender.toLowerCase() === 'me';
  
  // Rolar para a última mensagem quando mensagens forem adicionadas
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Efeito do tempo de digitação
  useEffect(() => {
    if (newMessage.length > 0 && !isTyping) {
      setIsTyping(true);
    }
    
    // Limpar o timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Definir novo timeout
    typingTimeoutRef.current = window.setTimeout(() => {
      setIsTyping(false);
    }, 1000);
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [newMessage, isTyping]);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    if (!isConnected) {
      toast({
        title: "Não conectado",
        description: "Não é possível enviar mensagens porque o contato não está conectado",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await sendMessageToPeer(contact.contactUsername, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive",
      });
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Formatar data da mensagem
  const formatMessageTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Cabeçalho do chat */}
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBackClick && (
            <Button variant="ghost" size="sm" onClick={onBackClick} className="md:hidden">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{contact.contactUsername}</p>
              <div className="flex items-center text-xs text-muted-foreground">
                {isConnected ? (
                  <>
                    <Wifi className="h-3 w-3 mr-1 text-green-500" />
                    <span>Conectado</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 mr-1 text-red-500" />
                    <span>Desconectado</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="h-5 w-5 text-green-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Criptografado ponta a ponta</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Área de mensagens */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhuma mensagem. Comece a conversar!
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div 
                key={index}
                className={`flex ${isOwnMessage(message.sender) ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`
                    max-w-[80%] rounded-lg p-3
                    ${isOwnMessage(message.sender) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'}
                  `}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  <div 
                    className={`
                      text-xs mt-1 flex justify-end
                      ${isOwnMessage(message.sender) 
                        ? 'text-primary-foreground/70' 
                        : 'text-muted-foreground'}
                    `}
                  >
                    {formatMessageTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messageEndRef} />
        </div>
      </ScrollArea>
      
      {/* Entrada de mensagem */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Textarea
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] max-h-[120px]"
            disabled={!isConnected}
          />
          <div className="flex flex-col gap-2">
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !isConnected}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {!isConnected && (
          <div className="mt-2 text-xs flex items-center text-red-500">
            <ShieldAlert className="h-3 w-3 mr-1" />
            <span>Não é possível enviar mensagens porque o contato não está conectado</span>
          </div>
        )}
      </div>
    </div>
  );
}
