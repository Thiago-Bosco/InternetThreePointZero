import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useP2P } from '@/context/P2PContext';
import ChatInterface from '@/components/Chat/ChatInterface';
import ContactList from '@/components/Chat/ContactList';
import { Contact } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';

export default function Chat() {
  const { isAuthenticated, currentUser } = useUser();
  const { connectToPeer, state } = useP2P();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContactUsername, setNewContactUsername] = useState('');
  const [newContactPublicKey, setNewContactPublicKey] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const { toast } = useToast();
  const isMobile = useMobile();
  const [showChat, setShowChat] = useState(!isMobile);
  
  // Carregar contatos quando o componente for montado
  useEffect(() => {
    const loadContacts = async () => {
      if (!isAuthenticated || !currentUser) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/users/${currentUser.id}/contacts`);
        
        if (response.ok) {
          const contactsData = await response.json();
          setContacts(contactsData);
          
          // Selecionar o primeiro contato automaticamente se houver
          if (contactsData.length > 0 && !isMobile) {
            setSelectedContactId(contactsData[0].id);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar contatos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContacts();
  }, [isAuthenticated, currentUser, isMobile]);
  
  const handleAddContact = async () => {
    if (!isAuthenticated || !currentUser) {
      toast({
        title: "Não autenticado",
        description: "É necessário estar conectado para adicionar contatos",
        variant: "destructive",
      });
      return;
    }
    
    if (!newContactUsername || !newContactPublicKey) {
      toast({
        title: "Informações incompletas",
        description: "Por favor, preencha o nome de usuário e a chave pública",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          contactUsername: newContactUsername,
          contactPublicKey: newContactPublicKey,
          lastConnected: new Date(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao adicionar contato');
      }
      
      const newContact = await response.json();
      
      // Adicionar o novo contato à lista
      setContacts(prev => [...prev, newContact]);
      
      // Limpar o formulário e fechar o diálogo
      setNewContactUsername('');
      setNewContactPublicKey('');
      setIsAddingContact(false);
      
      toast({
        title: "Contato adicionado",
        description: `${newContactUsername} foi adicionado aos seus contatos`,
      });
      
      // Selecionar o novo contato
      setSelectedContactId(newContact.id);
      
      // Se for mobile, mostrar o chat
      if (isMobile) {
        setShowChat(true);
      }
      
      // Tentar conectar ao peer
      try {
        await connectToPeer(newContactUsername, newContactPublicKey);
      } catch (error) {
        console.error('Erro ao conectar ao peer:', error);
        toast({
          title: "Aviso",
          description: "Contato adicionado mas não foi possível estabelecer conexão P2P",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar contato:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o contato",
        variant: "destructive",
      });
    }
  };
  
  const handleContactSelect = (contactId: number) => {
    setSelectedContactId(contactId);
    
    // Se for mobile, mostrar o chat
    if (isMobile) {
      setShowChat(true);
    }
    
    // Encontrar o contato
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      // Tentar conectar ao peer se não estiver conectado
      if (!state.connectedPeers.includes(contact.contactUsername)) {
        connectToPeer(contact.contactUsername, contact.contactPublicKey)
          .catch(error => {
            console.error('Erro ao conectar ao peer:', error);
            toast({
              title: "Erro de conexão",
              description: "Não foi possível estabelecer conexão P2P com o contato",
              variant: "destructive",
            });
          });
      }
      
      // Atualizar último acesso
      fetch(`/api/contacts/${contactId}/lastConnected`, {
        method: 'PATCH',
      }).catch(error => {
        console.error('Erro ao atualizar último acesso:', error);
      });
    }
  };
  
  const selectedContact = contacts.find(contact => contact.id === selectedContactId);
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Chat P2P</h1>
      <p className="text-muted-foreground">
        Comunique-se diretamente com outros usuários via WebRTC criptografado
      </p>
      
      {!isAuthenticated ? (
        <div className="p-8 text-center border rounded-md bg-muted/30">
          <h3 className="text-xl font-semibold mb-2">Autenticação Necessária</h3>
          <p className="mb-4 text-muted-foreground">
            Você precisa estar conectado para usar o chat P2P
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[70vh] border rounded-md overflow-hidden">
          {/* Lista de contatos (sempre visível no desktop, condicional no mobile) */}
          {(!isMobile || !showChat) && (
            <div className="border-r">
              <div className="p-3 border-b flex justify-between items-center">
                <h3 className="font-medium">Contatos</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsAddingContact(true)}
                >
                  <PlusCircle className="h-5 w-5" />
                </Button>
              </div>
              
              <ContactList 
                contacts={contacts} 
                isLoading={isLoading}
                selectedContactId={selectedContactId}
                onContactSelect={handleContactSelect}
                connectedPeers={state.connectedPeers}
              />
            </div>
          )}
          
          {/* Interface de chat (sempre visível no desktop, condicional no mobile) */}
          {(!isMobile || showChat) && (
            <div className={`md:col-span-2 flex flex-col ${isMobile ? 'h-[70vh]' : ''}`}>
              {selectedContact ? (
                <ChatInterface 
                  contact={selectedContact}
                  messages={state.messages[selectedContact.contactUsername] || []}
                  onBackClick={isMobile ? () => setShowChat(false) : undefined}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <h3 className="text-xl font-semibold mb-2">Nenhum contato selecionado</h3>
                  <p className="text-muted-foreground mb-6">
                    Selecione um contato da lista ou adicione um novo contato para começar a conversar
                  </p>
                  <Button onClick={() => setIsAddingContact(true)}>
                    Adicionar Contato
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Diálogo para adicionar contato */}
      <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Contato</DialogTitle>
            <DialogDescription>
              Adicione um novo contato para iniciar uma conversa P2P
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nome de usuário</Label>
              <Input
                id="username"
                value={newContactUsername}
                onChange={(e) => setNewContactUsername(e.target.value)}
                placeholder="Nome do contato"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="publicKey">Chave Pública</Label>
              <Input
                id="publicKey"
                value={newContactPublicKey}
                onChange={(e) => setNewContactPublicKey(e.target.value)}
                placeholder="Chave pública do contato"
              />
              <p className="text-xs text-muted-foreground">
                A chave pública pode ser encontrada na seção de identidade do contato
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={handleAddContact}>
              Adicionar Contato
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
