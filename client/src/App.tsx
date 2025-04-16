import { useState, useEffect, useCallback } from "react";
import { Switch, Route } from "wouter";
import { UserContextProvider } from "./context/UserContext";
import { P2PContextProvider } from "./context/P2PContext";
import MainLayout from "./components/ui/MainLayout";
import BrowserInterface from "./components/Browser/BrowserInterface";
import ChatInterface from "./components/Chat/ChatInterface";
import FeedComponent from "./components/Feed/FeedComponent";
import IdentityManager from "./components/Identity/IdentityManager";
import DownloadPage from "./pages/Download";
import NotFound from "./pages/not-found";

/**
 * Internet 3.0 - Navegador Descentralizado
 * 
 * Aplicativo completo com navegação IPFS, compartilhamento de arquivos P2P,
 * chat descentralizado, feed social e gerenciamento de identidade.
 */
function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initStatus, setInitStatus] = useState<{
    message: string;
    progress: number;
    error?: string;
  }>({
    message: "Inicializando o ambiente...",
    progress: 0
  });

  // Função simulada para inicializar os componentes do navegador
  const initializeEnvironment = useCallback(async () => {
    try {
      // Simular inicialização de componentes
      setInitStatus({
        message: "Verificando conexão com o servidor...",
        progress: 20
      });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setInitStatus({
        message: "Inicializando módulo IPFS...",
        progress: 40
      });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setInitStatus({
        message: "Preparando Interface P2P...",
        progress: 60
      });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setInitStatus({
        message: "Configurando criptografia...",
        progress: 80
      });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setInitStatus({
        message: "Finalizado! Carregando aplicação...",
        progress: 100
      });
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setIsInitializing(false);
    } catch (error) {
      console.error("Erro ao inicializar:", error);
      setInitStatus({
        message: "Erro ao inicializar",
        progress: 0,
        error: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  }, []);

  useEffect(() => {
    initializeEnvironment();
  }, [initializeEnvironment]);

  // Tela de inicialização
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Internet 3.0</h1>
            <p className="text-blue-300">Navegador Descentralizado</p>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-6 shadow-xl border border-slate-700">
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-slate-300">{initStatus.message}</span>
                <span className="text-blue-400">{initStatus.progress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${initStatus.progress}%` }}
                ></div>
              </div>
            </div>
            
            {initStatus.error && (
              <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">
                <p className="font-medium mb-1">Erro na inicialização:</p>
                <p>{initStatus.error}</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center text-slate-500 text-sm">
            <p>©2025 Projeto Internet 3.0</p>
            <p className="mt-1">Navegação descentralizada, privacidade e segurança</p>
          </div>
        </div>
      </div>
    );
  }

  // Aplicação principal
  return (
    <UserContextProvider>
      <P2PContextProvider>
        <MainLayout>
          <Switch>
            <Route path="/" component={BrowserInterface} />
            <Route path="/files" component={() => (
              <div className="space-y-6">
                <p className="bg-blue-50 p-4 rounded-md border border-blue-100 text-blue-800 mb-4">
                  Módulo de compartilhamento de arquivos disponível para download nesta versão beta.
                </p>
              </div>
            )} />
            <Route path="/chat" component={ChatInterface} />
            <Route path="/feed" component={FeedComponent} />
            <Route path="/identity" component={IdentityManager} />
            <Route path="/download" component={DownloadPage} />
            <Route path="/tests" component={TestRunner} />
            <Route component={NotFound} />
          </Switch>
        </MainLayout>
      </P2PContextProvider>
    </UserContextProvider>
  );
}

export default App;
