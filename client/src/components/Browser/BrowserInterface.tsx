import { useState, useEffect, useCallback } from 'react';
import AddressBar from './AddressBar';
import TabManager from './TabManager';
import ContentViewer from './ContentViewer';
import BookmarkManager from './BookmarkManager';
import { useUser } from '@/context/UserContext';
import { TabData, saveTabs, getTabs, addToHistory } from '@/lib/storage';
import { nanoid } from 'nanoid';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

// Simulação de conteúdo IPFS para demonstração
const mockIpfsContent: Record<string, string> = {
  'QmdefaultHome': `
    <html>
      <head><title>Internet 3.0 Home</title></head>
      <body>
        <h1>Bem-vindo à Internet 3.0</h1>
        <p>Este é o navegador descentralizado que permite acessar conteúdo IPFS, compartilhar arquivos P2P e muito mais.</p>
        <ul>
          <li>Acesso a conteúdo descentralizado</li>
          <li>Compartilhamento de arquivos</li>
          <li>Chat P2P seguro</li>
          <li>Feed social descentralizado</li>
        </ul>
      </body>
    </html>
  `,
  'QmSample1': `
    <html>
      <head><title>Exemplo de Página IPFS</title></head>
      <body>
        <h1>Página de Exemplo IPFS</h1>
        <p>Este é um exemplo de conteúdo armazenado na rede IPFS. O conteúdo é endereçado pelo hash e não por localização.</p>
        <p>Hash: QmSample1</p>
      </body>
    </html>
  `,
  'QmSample2': `
    <html>
      <head><title>Tecnologia Blockchain</title></head>
      <body>
        <h1>Tecnologia Blockchain e IPFS</h1>
        <p>A combinação de IPFS e Blockchain cria um sistema robusto para armazenamento e verificação de informações.</p>
        <p>Hash: QmSample2</p>
      </body>
    </html>
  `
};

export default function BrowserInterface() {
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ipfsConnected, setIpfsConnected] = useState(false);
  const [ipfsError, setIpfsError] = useState<string | null>(null);
  const { isAuthenticated, currentUser } = useUser();
  const { toast } = useToast();

  // Simular conexão com IPFS no carregamento inicial
  useEffect(() => {
    const connectToIpfs = async () => {
      try {
        setIpfsError(null);
        setIsLoading(true);

        // Simulação de conexão IPFS
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIpfsConnected(true);
        console.log("Simulação: IPFS conectado com sucesso");

        toast({
          title: "IPFS conectado",
          description: "Conexão com a rede IPFS estabelecida com sucesso",
        });
      } catch (error) {
        console.error("Erro ao conectar ao IPFS:", error);
        setIpfsError("Falha ao conectar à rede IPFS. Tente novamente mais tarde.");

        toast({
          title: "Erro de conexão IPFS",
          description: "Não foi possível conectar à rede IPFS",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    connectToIpfs();
  }, [toast]);

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
          const defaultTab = createDefaultTab();
          setTabs([defaultTab]);
          setActiveTabId(defaultTab.id);
        }
      } catch (error) {
        console.error('Erro ao carregar abas:', error);
        const defaultTab = createDefaultTab();
        setTabs([defaultTab]);
        setActiveTabId(defaultTab.id);
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

  const createDefaultTab = (): TabData => {
    return {
      id: nanoid(),
      title: 'Internet 3.0 Home',
      url: 'ipfs://QmdefaultHome',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  };

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

  // Função para buscar conteúdo IPFS
  const fetchIPFSContent = async (hash: string): Promise<string> => {
    // Simulação de busca no IPFS
    await new Promise(resolve => setTimeout(resolve, 800));

    // Verificar se temos conteúdo simulado para este hash
    if (mockIpfsContent[hash]) {
      return mockIpfsContent[hash];
    }

    // Hash padrão se não encontrar
    return mockIpfsContent.QmdefaultHome;
  };

  const navigateToUrl = async (url: string) => {
    if (!activeTabId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Otimizar URL antes de navegar
      const optimizedUrl = url.trim()
        .replace(/^(?!https?:\/\/)(?!ipfs:\/\/)/, 'https://')
        .replace(/([^:])\/\/+/g, '$1/');

      // Adicionar timestamp para evitar cache quando necessário
      const shouldBypassCache = url.includes('nocache=true');
      const finalUrl = shouldBypassCache ? `${optimizedUrl}&_t=${Date.now()}` : optimizedUrl;

      // Verificar se é um URL HTTP/HTTPS ou um hash IPFS
      const isHttpUrl = url.startsWith('http://') || url.startsWith('https://');

      if (isHttpUrl) {
        await handleHttpUrl(finalUrl);
      } else {
        await handleIpfsUrl(finalUrl);
      }
    } catch (error) {
      console.error('Erro ao navegar:', error);
      setError('Erro ao carregar página');
      toast({
        title: "Erro de navegação",
        description: "Não foi possível carregar o conteúdo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;

        updateTab(activeTabId, { 
          url: url,
          title: domain,
        });

        // Registrar no histórico
        const historyItem = {
          url: url,
          title: domain,
          timestamp: Date.now()
        };

        await addToHistory(historyItem);

        // Verificar se o proxy está funcionando
        try {
          const response = await fetch(proxyUrl, { method: 'HEAD' });
          if (!response.ok) {
            throw new Error(`Erro ${response.status}`);
          }
        } catch (error) {
          console.error('Erro ao acessar proxy:', error);
          toast({
            title: "Erro de conexão",
            description: "Não foi possível acessar o site através do proxy",
            variant: "destructive",
          });
          return;
        }
      } else {
        // Processamento de conteúdo IPFS
        let ipfsHash = url;

        // Se for uma URL formatada como ipfs://hash
        if (url.startsWith('ipfs://')) {
          ipfsHash = url.replace('ipfs://', '');
        }

        // Limpar qualquer prefixo /ipfs/
        if (ipfsHash.startsWith('/ipfs/')) {
          ipfsHash = ipfsHash.replace('/ipfs/', '');
        }

        // Criar hash se vazio
        if (!ipfsHash) {
          ipfsHash = 'QmdefaultHome';
        }

        // Atualizar aba com o novo URL
        updateTab(activeTabId, { 
          url: `ipfs://${ipfsHash}`,
          title: `IPFS: ${ipfsHash.substring(0, 10)}...`, 
        });

        // Simular busca de conteúdo IPFS
        await fetchIPFSContent(ipfsHash);

        // Registrar no histórico local
        const historyItem = {
          url: `ipfs://${ipfsHash}`,
          title: `IPFS: ${ipfsHash}`,
          timestamp: Date.now()
        };

        await addToHistory(historyItem);

        // Registrar no servidor se autenticado
        if (isAuthenticated && currentUser) {
          try {
            await fetch('/api/history', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: currentUser.id,
                ipfsHash,
                title: `IPFS: ${ipfsHash}`,
              }),
            });
          } catch (error) {
            console.error('Erro ao registrar histórico no servidor:', error);
          }
        }

        toast({
          title: "Navegação bem-sucedida",
          description: `Conteúdo IPFS carregado: ${ipfsHash.substring(0, 8)}...`,
        });
      }
    } catch (error) {
      console.error('Erro ao navegar para URL:', error);

      toast({
        title: "Erro de navegação",
        description: "Não foi possível carregar o conteúdo",
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

      // Exemplo de registro no servidor
      /* Na versão completa, isso seria enviado ao servidor 
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          title: activeTab.title,
          ipfsHash,
        }),
      });
      */

      // Simulação bem-sucedida
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
    <div className="flex flex-col h-full bg-card overflow-hidden">
      <div className="flex items-center h-7 border-b border-border bg-muted/30">
        <TabManager 
          tabs={tabs}
          activeTabId={activeTabId}
          onTabChange={setActiveTabId}
          onNewTab={createNewTab}
          onCloseTab={closeTab}
        />
      </div>

      <div className="flex items-center h-12 px-2 gap-2 border-b border-border bg-background">
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