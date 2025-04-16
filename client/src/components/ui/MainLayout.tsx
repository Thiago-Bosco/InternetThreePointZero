import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { 
  Home, 
  Folder, 
  MessageSquare, 
  Rss, 
  Shield, 
  Settings, 
  Download, 
  Search, 
  Star, 
  Menu, 
  Bell, 
  User,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Plus
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const isMobile = useIsMobile();

  const navItems = [
    { href: '/', label: 'Navegador', icon: Home },
    { href: '/files', label: 'Arquivos', icon: Folder },
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/feed', label: 'Feed', icon: Rss },
    { href: '/identity', label: 'Identidade', icon: Shield },
  ];

  const TopBar = () => (
    <div className="h-16 flex items-center justify-center px-4 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
      <div className="w-full max-w-2xl flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1 h-10 bg-muted rounded-full flex items-center px-4 gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Pesquisar ou digitar endereço"
            className="bg-transparent border-none focus:outline-none text-sm flex-1"
          />
        </div>

        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );


  const SideNav = () => (
    <div className="w-12 border-r bg-card/50 backdrop-blur flex flex-col items-center py-2 gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href;
        return (
          <Button
            key={item.href}
            onClick={() => window.location.href = item.href}
            variant={isActive ? "secondary" : "ghost"}
            size="icon"
            className="h-10 w-10"
          >
            <Icon className="h-5 w-5" />
          </Button>
        );
      })}
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 mt-auto"
        onClick={() => window.location.href = '/download'}
      >
        <Download className="h-5 w-5" />
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <div className="flex-1 flex">
        {!isMobile && <SideNav />}
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex flex-col h-full p-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  return (
                    <Button
                      key={item.href}
                      onClick={() => window.location.href = item.href}
                      variant={isActive ? "secondary" : "ghost"}
                      className="justify-start mb-1"
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  className="mt-auto justify-start"
                  onClick={() => window.location.href = '/download'}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar App
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        )}
        <main className="flex-1 px-4">
          <div className="max-w-2xl mx-auto py-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}