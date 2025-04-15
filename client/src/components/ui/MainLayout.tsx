import { ReactNode } from 'react';
import { useLocation, Link } from 'wouter';
import { Home, Folder, MessageSquare, Rss, Shield } from 'lucide-react';

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
      <header className="bg-card shadow border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              Internet 3.0
            </h1>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full dark:bg-blue-900 dark:text-blue-300">
              Beta
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sobre
            </button>
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Documentação
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        <nav className="w-16 md:w-56 border-r border-border bg-card/50 flex-shrink-0">
          <div className="py-4 flex flex-col h-full">
            <div className="space-y-1 px-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link key={item.href} href={item.href}>
                    <a
                      className={`
                        flex items-center px-2 py-2 rounded-md text-sm
                        ${isActive 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
                        }
                      `}
                    >
                      <Icon size={20} className="mr-3 flex-shrink-0" />
                      <span className="hidden md:inline">{item.label}</span>
                    </a>
                  </Link>
                );
              })}
            </div>
            
            <div className="mt-auto px-2">
              <div className="border-t border-border pt-4 mt-4">
                <a 
                  href="#" 
                  className="flex items-center px-2 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Shield size={20} className="mr-3 flex-shrink-0" />
                  <span className="hidden md:inline">Configurações</span>
                </a>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="mx-auto max-w-6xl h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}