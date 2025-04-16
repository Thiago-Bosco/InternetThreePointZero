
import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { Home, Folder, MessageSquare, Rss, Shield, Settings, Download, Search, Star, Menu, Bell, User } from 'lucide-react';
import { cn } from "@/lib/utils";

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
      <header className="h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b flex items-center fixed top-0 w-full z-50">
        <div className="container mx-auto flex items-center px-4">
          <div className="flex items-center gap-4 flex-1">
            <button className="p-2 hover:bg-accent rounded-full">
              <Menu size={20} className="text-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Internet 3.0
              </span>
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-medium rounded-full dark:bg-blue-900 dark:text-blue-300">
                Beta
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-accent rounded-full">
              <Bell size={18} className="text-foreground" />
            </button>
            <button className="p-2 hover:bg-accent rounded-full">
              <Settings size={18} className="text-foreground" />
            </button>
            <button className="ml-2 flex items-center gap-2 px-3 py-1.5 hover:bg-accent rounded-full">
              <User size={18} className="text-foreground" />
              <span className="text-sm font-medium">Perfil</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex pt-14">
        <nav className="w-16 bg-card/50 backdrop-blur fixed h-full flex flex-col items-center py-4 gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;

            return (
              <button
                key={item.href}
                onClick={() => window.location.href = item.href}
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-xl transition-all",
                  "hover:bg-accent hover:scale-105",
                  isActive && "bg-primary/10 text-primary shadow-sm"
                )}
                title={item.label}
              >
                <Icon size={20} />
              </button>
            );
          })}

          <div className="mt-auto">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-accent hover:scale-105 transition-all"
              title="Baixar Navegador"
              onClick={() => window.location.href = '/download'}
            >
              <Download size={20} />
            </button>
          </div>
        </nav>

        <main className="flex-1 ml-16 p-6 bg-background/50">
          {children}
        </main>
      </div>
    </div>
  );
}
