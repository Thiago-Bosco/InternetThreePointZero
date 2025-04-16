import { ReactNode, useState } from "react";
import { useLocation } from "wouter";
import {
  Home,
  RefreshCcw,
  ArrowLeft,
  ArrowRight,
  Star,
  Bell,
  Settings,
  Menu,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const [tabs, setTabs] = useState([
    { id: 1, title: "Nova guia", url: "/" },
    { id: 2, title: "Microsoft Bing", url: "/bing" },
    { id: 3, title: "GitHub", url: "/github" },
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [bookmarks, setBookmarks] = useState([
    { title: "GitHub", url: "/github" },
    { title: "ChatGPT", url: "/chatgpt" },
  ]);

  const handleTabClose = (id: number) => {
    if (tabs.length > 1) {
      setTabs(tabs.filter((tab) => tab.id !== id));
      if (activeTabId === id) {
        setActiveTabId(tabs[0].id === id ? tabs[1].id : tabs[0].id);
      }
    }
  };

  const handleNewTab = () => {
    const newId = Math.max(...tabs.map((tab) => tab.id)) + 1;
    setTabs([...tabs, { id: newId, title: "Nova guia", url: "/" }]);
    setActiveTabId(newId);
  };

  const handleNavigate = (url: string) => {
    setSearchValue(url); // Update searchValue when navigating
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30 flex flex-col">
        {/* Endereço e controles */}
        <div className="flex items-center gap-2 px-4 h-12 border-b border-border/50">
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-full hover:bg-accent text-muted-foreground">
              <ArrowLeft size={18} />
            </button>
            <button className="p-1.5 rounded-full hover:bg-accent text-muted-foreground">
              <ArrowRight size={18} />
            </button>
            <button className="p-1.5 rounded-full hover:bg-accent text-muted-foreground">
              <RefreshCcw size={18} />
            </button>
            <button className="p-1.5 rounded-full hover:bg-accent text-muted-foreground">
              <Home size={18} />
            </button>
          </div>

          <div className="flex-1 relative">
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-[10px] text-primary">
                    {tabs
                      .find((tab) => tab.id === activeTabId)
                      ?.title.charAt(0)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">https://</span>
              </div>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchValue.trim()) {
                    if (!searchValue.startsWith('http://') && 
                        !searchValue.startsWith('https://') && 
                        !searchValue.startsWith('ipfs://')) {
                      handleNavigate(`search:${searchValue}`);
                    } else {
                      handleNavigate(searchValue);
                    }
                  }
                }}
                className="w-full h-9 pl-20 pr-10 rounded-full bg-accent/50 border border-border/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 focus:outline-none"
                placeholder="Pesquisar ou inserir endereço"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <button className="p-1 rounded-full hover:bg-accent/80">
                  <Star size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-full hover:bg-accent relative">
              <Bell size={18} className="text-muted-foreground" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            <button className="p-1.5 rounded-full hover:bg-accent">
              <Settings size={18} className="text-muted-foreground" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-accent">
              <Menu size={18} className="text-muted-foreground" />
            </button>
            <div className="ml-1 w-8 h-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
              <User size={16} className="text-primary" />
            </div>
          </div>
        </div>

        {/* Barra de favoritos */}
        <div className="flex items-center h-8 px-4 text-xs text-muted-foreground bg-card/30 border-b border-border/30">
          <div className="flex items-center gap-4">
            {bookmarks.map((bookmark, index) => (
              <a
                key={index}
                href={bookmark.url}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <div className="w-3.5 h-3.5 rounded-sm bg-primary/15 flex items-center justify-center">
                  <span className="text-[8px] text-primary/80">
                    {bookmark.title.charAt(0)}
                  </span>
                </div>
                <span>{bookmark.title}</span>
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* Conteúdo da página */}
      <main className="flex-1 bg-background">{children}</main>

      {/* Rodapé / barra de status */}
      <footer className="h-6 bg-card/50 border-t border-border/30 flex items-center px-4">
        <div className="text-xs text-muted-foreground flex items-center gap-4">
          <span>Seguro</span>
          <span>https://website.com</span>
        </div>
      </footer>
    </div>
  );
}