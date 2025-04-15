import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import {
  Globe,
  FileText,
  MessageSquare,
  Rss,
  User,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated, logout, currentUser } = useUser();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMobile();

  const navigationItems = [
    { path: '/', label: 'Navegador', icon: <Globe className="h-5 w-5 mr-2" /> },
    { path: '/files', label: 'Arquivos', icon: <FileText className="h-5 w-5 mr-2" /> },
    { path: '/chat', label: 'Chat', icon: <MessageSquare className="h-5 w-5 mr-2" /> },
    { path: '/feed', label: 'Feed', icon: <Rss className="h-5 w-5 mr-2" /> },
    { path: '/identity', label: 'Identidade', icon: <User className="h-5 w-5 mr-2" /> },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Botão móvel para abrir menu lateral */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-primary text-primary-foreground"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      )}

      {/* Barra lateral / Menu de navegação */}
      <aside 
        className={`
          ${isMobile ? 'fixed z-40 top-0 left-0 h-full shadow-xl' : 'relative'}
          ${sidebarOpen || !isMobile ? 'w-64' : 'w-0'} 
          bg-sidebar transition-all duration-300 overflow-hidden
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-sidebar-border">
            <h1 className="text-2xl font-bold text-sidebar-foreground">Internet 3.0</h1>
            <p className="text-sm text-sidebar-foreground/70">
              Navegação descentralizada
            </p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={closeSidebar}
              >
                <a
                  className={`
                    flex items-center px-4 py-3 rounded-md transition-colors
                    ${location === item.path 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/10'}
                  `}
                >
                  {item.icon}
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                    <span className="text-sidebar-accent-foreground font-medium">
                      {currentUser?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sidebar-foreground">
                      {currentUser?.username}
                    </p>
                    <p className="text-xs text-sidebar-foreground/70">
                      Conectado
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full justify-start bg-sidebar text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent/10 hover:text-sidebar-foreground"
                  onClick={() => {
                    logout();
                    closeSidebar();
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            ) : (
              <p className="text-sm text-sidebar-foreground/70">
                Não conectado
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay para fechar o menu no mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Conteúdo principal */}
      <main className={`flex-1 overflow-auto`}>
        <div className={`container py-6 ${isMobile ? 'px-4 pt-16' : 'px-6'}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
