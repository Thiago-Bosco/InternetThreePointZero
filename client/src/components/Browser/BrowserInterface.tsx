import { useState, useEffect } from 'react';
import AddressBar from './AddressBar';
import TabManager from './TabManager';
import ContentViewer from './ContentViewer';
import BookmarkManager from './BookmarkManager';
import { useP2P } from '@/context/P2PContext';
import { useUser } from '@/context/UserContext';
import { TabData, saveTabs, getTabs } from '@/lib/storage';
import { nanoid } from 'nanoid';
import { useToast } from '@/hooks/use-toast';

export default function BrowserInterface() {
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { fetchIPFSContent } = useP2P();
  const { isAuthenticated, currentUser } = useUser();
  const { toast } = useToast();
  
  // Carregar abas salvas no armazenamento local
  useEffect(() => {
    const loadTabs = async () => {
      try {
        const savedTabs = await getTabs();
        
        if (savedTabs.length > 0) {
          setTabs(savedTabs);
          setActiveTabId(savedTabs[0].id);
        } else {
          // Criar uma nova aba se não houver nenhuma
          createNewTab();
        }
      } catch (error) {
        console.error('Erro ao carregar abas:', error);
        createNewTab();
      }
    };
    
    loadTabs();
  }, []);
  
  // Salvar abas quando mudarem
  useEffect(() => {
    if (tabs.length > 0) {
      saveTabs(tabs).catch(error => {
        console.error('Erro ao salvar abas:', error);
      });
    }
  }, [tabs]);
  
  const createNewTab = () => {
    const newTab: TabData = {
      id: nanoid(),
      title: 'Nova Aba',
      url: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    setTabs(prevTabs => [...prevTabs, newTab]);
    setActiveTabId(newTab.id);
  };
  
  const closeTab = (tabId: string) => {
    // Não permitir fechar a última aba
    if (tabs.length <= 1) {
      return;
    }
    
    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.id !== tabId);
      
      // Se a aba ativa foi fechada, definir outra aba como ativa
      if (activeTabId === tabId) {
        setActiveTabId(newTabs[0].id);
      }
      
      return newTabs;
    });
  };
  
  const updateTab = (tabId: string, updates: Partial<TabData>) => {
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === tabId 
          ? { ...tab, ...updates, updatedAt: Date.now() } 
          : tab
      )
    );
  };
  
  const navigateToUrl = async (url: string) => {
    if (!activeTabId) return;
    
    setIsLoading(true);
    
    try {
      // Determinar se é um hash IPFS ou um URL formatado
      let ipfsHash = url;
      
      // Se for uma URL formatada como ipfs://hash
      if (url.startsWith('ipfs://')) {
        ipfsHash = url.replace('ipfs://', '');
      }
      
      // Limpar qualquer prefixo /ipfs/
      if (ipfsHash.startsWith('/ipfs/')) {
        ipfsHash = ipfsHash.replace('/ipfs/', '');
      }
      
      // Atualizar aba com o novo URL
      updateTab(activeTabId, { 
        url: `ipfs://${ipfsHash}`,
        title: `IPFS: ${ipfsHash.substring(0, 8)}...`, 
      });
      
      // Registrar no histórico de navegação se o usuário estiver autenticado
      if (isAuthenticated && currentUser) {
        fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            ipfsHash,
            title: `IPFS: ${ipfsHash}`,
          }),
        }).catch(error => {
          console.error('Erro ao registrar histórico:', error);
        });
      }
      
      // Buscar conteúdo IPFS
      await fetchIPFSContent(ipfsHash);
      
      toast({
        title: "Navegação bem-sucedida",
        description: `Conteúdo IPFS carregado: ${ipfsHash.substring(0, 8)}...`,
      });
    } catch (error) {
      console.error('Erro ao navegar para URL:', error);
      
      toast({
        title: "Erro de navegação",
        description: "Não foi possível carregar o conteúdo IPFS",
        variant: "destructive",
      });
      
      // Atualizar aba para mostrar o erro
      updateTab(activeTabId, { 
        title: 'Erro de navegação',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const addBookmark = async () => {
    if (!activeTabId || !isAuthenticated || !currentUser) {
      toast({
        title: "Erro ao adicionar favorito",
        description: "Você precisa estar conectado para adicionar favoritos",
        variant: "destructive",
      });
      return;
    }
    
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    if (!activeTab || !activeTab.url) {
      toast({
        title: "Erro ao adicionar favorito",
        description: "Nenhuma página carregada para adicionar aos favoritos",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Extrair hash IPFS da URL
      const ipfsHash = activeTab.url.startsWith('ipfs://')
        ? activeTab.url.replace('ipfs://', '')
        : activeTab.url;
      
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          title: activeTab.title,
          ipfsHash,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao adicionar favorito');
      }
      
      toast({
        title: "Favorito adicionado",
        description: `"${activeTab.title}" foi adicionado aos seus favoritos`,
      });
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      
      toast({
        title: "Erro ao adicionar favorito",
        description: "Não foi possível salvar o favorito",
        variant: "destructive",
      });
    }
  };
  
  const activeTab = activeTabId ? tabs.find(tab => tab.id === activeTabId) : null;
  
  return (
    <div className="flex flex-col h-full border border-border rounded-md overflow-hidden">
      <div className="flex items-center border-b border-border">
        <TabManager 
          tabs={tabs}
          activeTabId={activeTabId}
          onTabChange={setActiveTabId}
          onNewTab={createNewTab}
          onCloseTab={closeTab}
        />
      </div>
      
      <div className="flex items-center p-2 gap-2 border-b border-border">
        <AddressBar 
          url={activeTab?.url || ''}
          isLoading={isLoading}
          onNavigate={navigateToUrl}
        />
        <BookmarkManager 
          onAddBookmark={addBookmark} 
          userId={currentUser?.id}
          isAuthenticated={isAuthenticated}
        />
      </div>
      
      <div className="flex-1 overflow-auto bg-card">
        <ContentViewer 
          ipfsHash={activeTab?.url?.replace('ipfs://', '') || ''}
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
}
