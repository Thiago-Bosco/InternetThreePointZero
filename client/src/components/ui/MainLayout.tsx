
import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { Home, Folder, MessageSquare, Rss, Shield, Settings, Download } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { href: '/', label: 'Navegador', icon: Home },
    { href: '/files', label: 'Arquivos', icon: Folder },
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/feed', label: 'Feed', icon: Rss },
    { href: '/identity', label: 'Identidade', icon: Shield },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-card shadow-sm border-b border-border h-14 flex-shrink-0">
        <div className="h-full px-4 flex items-center justify-between max-w-[1920px] mx-auto">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              Internet 3.0
            </h1>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full dark:bg-blue-900 dark:text-blue-300">
              Beta
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sobre
            </button>
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Documentação
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <nav className="w-16 md:w-48 border-r border-border bg-card/50 flex-shrink-0">
          <div className="py-4 flex flex-col h-full">
            <div className="space-y-2 px-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <div 
                    key={item.href}
                    className={`
                      flex items-center px-3 py-2.5 rounded-lg text-sm cursor-pointer
                      ${isActive 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
                      }
                    `}
                    onClick={() => window.location.href = item.href}
                  >
                    <Icon size={20} className="mr-3 flex-shrink-0" />
                    <span className="hidden md:inline">{item.label}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-auto px-3">
              <div className="border-t border-border pt-4 mt-4 space-y-2">
                <div 
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-800/60 transition-colors cursor-pointer"
                  onClick={() => window.location.href = '/download'}
                >
                  <Download size={20} className="mr-3 flex-shrink-0" />
                  <span className="hidden md:inline">Baixar Navegador</span>
                </div>
                
                <div 
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  onClick={() => window.location.href = '/settings'}
                >
                  <Settings size={20} className="mr-3 flex-shrink-0" />
                  <span className="hidden md:inline">Configurações</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1 p-4 overflow-auto">
          <div className="mx-auto max-w-[1920px] h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
