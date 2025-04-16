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
      <header className="bg-card/40 backdrop-blur-md supports-[backdrop-filter]:bg-card/20 flex flex-col border-b border-border/20 shadow-sm">
        {/* Endereço e controles */}
        <div className="flex items-center gap-4 px-5 h-16 border-b border-border/10">
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl hover:bg-accent/90 text-muted-foreground/70 hover:text-foreground transition-all duration-200 active:scale-95">
              <ArrowLeft size={18} />
            </button>
            <button className="p-2.5 rounded-xl hover:bg-accent/90 text-muted-foreground/70 hover:text-foreground transition-all duration-200 active:scale-95">
              <ArrowRight size={18} />
            </button>
            <button className="p-2.5 rounded-xl hover:bg-accent/90 text-muted-foreground/70 hover:text-foreground transition-all duration-200 active:scale-95">
              <RefreshCcw size={18} />
            </button>
            <button className="p-2.5 rounded-xl hover:bg-accent/90 text-muted-foreground/70 hover:text-foreground transition-all duration-200 active:scale-95">
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
                    const trimmedValue = searchValue.trim();
                    if (trimmedValue.match(/^(https?:\/\/|ipfs:\/\/)/i)) {
                      handleNavigate(trimmedValue);
                    } else if (trimmedValue.includes('.')) {
                      handleNavigate(`https://${trimmedValue}`);
                    } else {
                      handleNavigate(`search:${trimmedValue}`);
                    }
                  }
                }}
                className="w-full h-11 pl-20 pr-12 rounded-2xl bg-accent/40 hover:bg-accent/50 border border-border/20 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200"
                placeholder="Pesquisar ou inserir endereço"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <button className="p-1.5 rounded-xl hover:bg-background/80 hover:text-foreground transition-all duration-200">
                  <Star size={16} className="text-muted-foreground/70" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-2">
            <button className="p-2.5 rounded-xl hover:bg-accent/90 relative group transition-all duration-200">
              <Bell size={18} className="text-muted-foreground/70 group-hover:text-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-4 ring-background"></span>
            </button>
            <button className="p-2.5 rounded-xl hover:bg-accent/90 group transition-all duration-200">
              <Settings size={18} className="text-muted-foreground/70 group-hover:text-foreground" />
            </button>
            <button className="p-2.5 rounded-xl hover:bg-accent/90 group transition-all duration-200">
              <Menu size={18} className="text-muted-foreground/70 group-hover:text-foreground" />
            </button>
            <div className="ml-2 w-10 h-10 rounded-xl overflow-hidden bg-primary/10 hover:bg-primary/15 flex items-center justify-center transition-all duration-200 cursor-pointer">
              <User size={18} className="text-primary/70" />
            </div>
          </div>
        </div>

        
      </header>

      {/* Conteúdo da página */}
      <main className="flex-1 bg-background">{children}</main>

      {/* Rodapé / barra de status */}
      <footer className="h-10 bg-card/40 backdrop-blur-md supports-[backdrop-filter]:bg-card/20 border-t border-border/10 flex items-center px-5 shadow-sm">
        <div className="text-xs text-muted-foreground/60 flex items-center gap-4">
          <span className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60 ring-4 ring-primary/20" />
            <span className="font-medium text-primary/70">Seguro</span>
          </span>
          <span className="opacity-50 hover:opacity-70 transition-opacity">https://website.com</span>
        </div>
      </footer>
    </div>
  );
}