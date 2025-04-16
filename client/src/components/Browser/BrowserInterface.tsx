import { useState, useEffect } from "react";
import TabManager from "./TabManager";
import AddressBar from "./AddressBar";
import ContentViewer from "./ContentViewer";
import BookmarkManager from "./BookmarkManager";
import { useUser } from "@/context/UserContext";
import { getTabs, saveTabs, addToHistory, TabData } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { nanoid } from "nanoid";

const mockIpfsContent = {
  QmdefaultHome: `
    <html>
      <head><title>Internet 3.0</title></head>
      <body><h1>Bem-vindo à Internet 3.0</h1></body>
    </html>
  `,
};

export default function BrowserInterface() {
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<{url: string; title: string; timestamp: number}[]>([]);
  const { isAuthenticated, currentUser } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      const saved = await getTabs();
      if (saved.length > 0) {
        setTabs(saved);
        setActiveTabId(saved[0].id);
      } else {
        const defaultTab = createDefaultTab();
        setTabs([defaultTab]);
        setActiveTabId(defaultTab.id);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (tabs.length) saveTabs(tabs).catch(console.error);
  }, [tabs]);

  const createDefaultTab = (): TabData => ({
    id: nanoid(),
    title: "Internet 3.0",
    url: "ipfs://QmdefaultHome",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const createNewTab = () => {
    const newTab = {
      id: nanoid(),
      title: "Nova Aba",
      url: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (id: string) => {
    if (tabs.length <= 1) return;
    const filtered = tabs.filter((t) => t.id !== id);
    setTabs(filtered);
    if (activeTabId === id) setActiveTabId(filtered[0].id);
  };

  const updateTab = (id: string, data: Partial<TabData>) => {
    setTabs(
      tabs.map((t) =>
        t.id === id ? { ...t, ...data, updatedAt: Date.now() } : t,
      ),
    );
  };

  const navigateToUrl = async (url: string) => {
    if (!activeTabId) return;
    try {
      setIsLoading(true);
      const cleaned = url.trim();
      const isIPFS =
        cleaned.startsWith("ipfs://") || cleaned.startsWith("/ipfs/");
      const hash =
        cleaned.replace("ipfs://", "").replace("/ipfs/", "") || "QmdefaultHome";

      updateTab(activeTabId, {
        url: `ipfs://${hash}`,
        title: `IPFS: ${hash.slice(0, 8)}...`,
      });

      await addToHistory({
        url: `ipfs://${hash}`,
        title: hash,
        timestamp: Date.now(),
      });
    } catch {
      toast({ title: "Erro ao navegar", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="flex flex-col h-full">
      {/* Header: Tabs + AddressBar */}
      <div className="flex items-center justify-between border-b border-border bg-muted px-3 h-12 gap-2">
        <TabManager
          tabs={tabs}
          activeTabId={activeTabId}
          onTabChange={setActiveTabId}
          onNewTab={createNewTab}
          onCloseTab={closeTab}
        />
        <AddressBar
          url={activeTab?.url || ""}
          isLoading={isLoading}
          onNavigate={navigateToUrl}
        />
        <BookmarkManager
          onAddBookmark={() => {}}
          userId={currentUser?.id}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {/* Viewer */}
      <div className="flex-1 overflow-auto bg-card">
        <ContentViewer
          ipfsHash={activeTab?.url?.replace("ipfs://", "") || ""}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
