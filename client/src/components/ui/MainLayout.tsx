import { ReactNode, useState } from "react";
import { useLocation, Link } from "wouter";
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
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Navegador", icon: Home },
    { href: "/files", label: "Arquivos", icon: Folder },
    { href: "/chat", label: "Chat", icon: MessageSquare, badge: 3 },
    { href: "/feed", label: "Feed", icon: Rss },
    { href: "/identity", label: "Identidade", icon: Shield },
  ];

  const toggleNav = () => setIsNavExpanded(!isNavExpanded);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b flex items-center fixed top-0 w-full z-50">
        <div className="container mx-auto flex items-center px-4">
          <div className="flex items-center gap-4 flex-1">
            <button
              className="p-2 hover:bg-accent rounded-full transition-colors"
              onClick={toggleNav}
              aria-label="Menu de navegação"
            >
              <Menu size={20} className="text-foreground" />
            </button>

            </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-accent rounded-full relative transition-colors">
              <Bell size={18} className="text-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            <button className="p-2 hover:bg-accent rounded-full transition-colors">
              <Settings size={18} className="text-foreground" />
            </button>
            <button className="ml-2 flex items-center gap-2 px-3 py-1.5 hover:bg-accent rounded-full transition-colors">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <User size={16} />
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                Perfil
              </span>
            </button>
          </div>
        </div>
      </header>

      

      <div className="flex-1 flex">
        {/* Sidebar */}
        <nav
          className={cn(
            "bg-card/50 backdrop-blur fixed h-[calc(100vh-3.5rem)] top-14 flex flex-col py-4 gap-2 border-r transition-all duration-300 z-40",
            isNavExpanded ? "w-56 items-start px-4" : "w-16 items-center",
          )}
        >
          <div className="flex items-center justify-end w-full mb-2">
            {isNavExpanded && (
              <button
                onClick={toggleNav}
                className="p-1 hover:bg-accent rounded-full"
              >
                <ChevronLeft size={16} />
              </button>
            )}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center gap-3 transition-all",
                    isNavExpanded
                      ? "w-full px-3 py-2 rounded-lg"
                      : "w-10 h-10 justify-center rounded-xl",
                    "hover:bg-accent hover:scale-105",
                    isActive && "bg-primary/10 text-primary shadow-sm",
                  )}
                  title={item.label}
                >
                  <div className="relative">
                    <Icon size={20} />
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[10px] flex items-center justify-center text-primary-foreground font-medium">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {isNavExpanded && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </a>
              </Link>
            );
          })}

          <div className="mt-auto">
            <Link href="/download">
              <a
                className={cn(
                  "flex items-center gap-3 transition-all",
                  isNavExpanded
                    ? "w-full px-3 py-2 rounded-lg"
                    : "w-10 h-10 justify-center rounded-xl",
                  "hover:bg-accent hover:scale-105",
                )}
                title="Baixar Navegador"
              >
                <Download size={20} />
                {isNavExpanded && (
                  <span className="text-sm font-medium">Baixar</span>
                )}
              </a>
            </Link>
          </div>
        </nav>

        {/* Content */}
        <main
          className={cn(
            "flex-1 p-6 mt-14 transition-all duration-300",
            isNavExpanded ? "ml-56" : "ml-16",
          )}
        >
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
