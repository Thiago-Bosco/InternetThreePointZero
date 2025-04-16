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
  Plus,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

interface TabProps {
  title: string;
  active: boolean;
  favicon?: string;
  onClose: () => void;
  onClick: () => void;
}

const Tab = ({ title, active, favicon, onClose, onClick }: TabProps) => (
  <div
    className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-t-lg border-t-2 border-l border-r cursor-pointer max-w-[180px] min-w-[120px]",
      active
        ? "bg-background border-border"
        : "bg-card/50 border-transparent hover:bg-accent/30 transition-all",
    )}
    onClick={onClick}
  >
    {favicon ? (
      <img src={favicon} alt="" className="w-4 h-4 rounded-full" />
    ) : (
      <div className="w-4 h-4 bg-primary/20 rounded-full flex items-center justify-center">
        <span className="text-xs text-primary">{title.charAt(0)}</span>
      </div>
    )}
    <span className="text-sm font-medium truncate flex-1">{title}</span>
    <button
      className="p-1 rounded-full hover:bg-accent transition-all"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <X size={14} />
    </button>
  </div>
);

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Bar with Tabs */}
      <header className="bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30 flex flex-col">
        {/* Tabs Row */}
        <div className="flex items-end h-10 px-2 pt-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              title={tab.title}
              active={tab.id === activeTabId}
              onClose={() => handleTabClose(tab.id)}
              onClick={() => setActiveTabId(tab.id)}
            />
          ))}
          <button
            className="p-1 rounded-md hover:bg-accent ml-1 mt-1 transition-all"
            onClick={handleNewTab}
            title="Nova guia"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Address and Controls Row */}
        <div className="flex items-center gap-2 px-4 h-12 border-b border-border/50">
          {/* Navigation Controls */}
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-full hover:bg-accent text-muted-foreground transition-all">
              <ArrowLeft size={18} />
            </button>
            <button className="p-1.5 rounded-full hover:bg-accent text-muted-foreground transition-all">
              <ArrowRight size={18} />
            </button>
            <button className="p-1.5 rounded-full hover:bg-accent text-muted-foreground transition-all">
              <RefreshCcw size={18} />
            </button>
            <button className="p-1.5 rounded-full hover:bg-accent text-muted-foreground transition-all">
              <Home size={18} />
            </button>
          </div>

          {/* Address Bar from AddressBar component */}
          <div className="flex-1">
            <AddressBar
              url={activeTab?.url || ''}
              isLoading={false}
              onNavigate={(url) => console.log('Navigate to:', url)}
            />
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-full hover:bg-accent relative transition-all">
              <Bell size={18} className="text-muted-foreground" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            <button className="p-1.5 rounded-full hover:bg-accent transition-all">
              <Settings size={18} className="text-muted-foreground" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-accent transition-all">
              <Menu size={18} className="text-muted-foreground" />
            </button>
            <div className="ml-1 w-8 h-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
              <User size={16} className="text-primary" />
            </div>
          </div>
        </div>

        {/* Bookmarks Bar */}
        <div className="flex items-center h-8 px-4 text-xs text-muted-foreground bg-card/30 border-b border-border/30">
          <div className="flex items-center gap-4">
            {bookmarks.map((bookmark, index) => (
              <a
                key={index}
                href={bookmark.url}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-primary/15 flex items-center justify-center">
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

      {/* Content */}
      <main className="flex-1 bg-background">{children}</main>

      {/* Status Bar */}
      <footer className="h-6 bg-card/50 border-t border-border/30 flex items-center px-4">
        <div className="text-xs text-muted-foreground flex items-center gap-4">
          <span>Seguro</span>
          <span>https://website.com</span>
        </div>
      </footer>
    </div>
  );
}
