import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { Home, Folder, MessageSquare, Rss, Shield, Settings, Download, Search, Star, Menu } from 'lucide-react';

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
      <header className="h-12 bg-background border-b flex items-center px-4 gap-2">
        <div className="flex items-center gap-2 flex-1">
          <button className="p-2 hover:bg-muted rounded-md">
            <Menu size={20} className="text-muted-foreground" />
          </button>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              Internet 3.0
            </span>
            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-medium rounded-full dark:bg-blue-900 dark:text-blue-300">
              Beta
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-muted rounded-md">
            <Star size={18} className="text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-md">
            <Settings size={18} className="text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex">
        <nav className="w-14 bg-card border-r flex flex-col items-center py-2 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;

            return (
              <button
                key={item.href}
                onClick={() => window.location.href = item.href}
                className={`
                  w-10 h-10 flex items-center justify-center rounded-md
                  ${isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
                title={item.label}
              >
                <Icon size={20} />
              </button>
            );
          })}

          <div className="mt-auto">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Baixar Navegador"
              onClick={() => window.location.href = '/download'}
            >
              <Download size={20} />
            </button>
          </div>
        </nav>

        <main className="flex-1 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}