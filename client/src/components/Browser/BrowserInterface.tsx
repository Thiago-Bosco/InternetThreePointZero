import { useState, useEffect, useCallback } from "react";
import TabManager from "./TabManager";
import AddressBar from "./AddressBar";
import ContentViewer from "./ContentViewer"; // assuming you may want to use this later
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
  const { isAuthenticated, currentUser } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    const loadTabs = async () => {
      const savedTabs = await getTabs();
      if (savedTabs.length > 0) {
        setTabs(savedTabs);
        setActiveTabId(savedTabs[0].id);
      } else {
        const defaultTab = createDefaultTab();
        setTabs([defaultTab]);
        setActiveTabId(defaultTab.id);
      }
    };
    loadTabs();
  }, []);

  useEffect(() => {
    if (tabs.length > 0)
      saveTabs(tabs).catch((error) => {
        console.error("Error saving tabs:", error);
        toast({ title: "Erro ao salvar abas", variant: "destructive" });
      });
  }, [tabs, toast]);

  const createDefaultTab = useCallback(
    (): TabData => ({
      id: nanoid(),
      title: "Internet 3.0",
      url: "ipfs://QmdefaultHome",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
    [],
  );

  const createNewTab = useCallback(() => {
    const newTab = {
      id: nanoid(),
      title: "Nova Aba",
      url: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setTabs((prevTabs) => [...prevTabs, newTab]);
    setActiveTabId(newTab.id);
  }, []);

  const closeTab = useCallback(
    (id: string) => {
      if (tabs.length <= 1) return; // Prevent closing the last tab
      const filteredTabs = tabs.filter((tab) => tab.id !== id);
      setTabs(filteredTabs);
      if (activeTabId === id) {
        setActiveTabId(filteredTabs[0].id); // Set the first tab as active
      }
    },
    [tabs, activeTabId],
  );

  const updateTab = useCallback((id: string, data: Partial<TabData>) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === id ? { ...tab, ...data, updatedAt: Date.now() } : tab,
      ),
    );
  }, []);

  const navigateToUrl = useCallback(
    async (url: string) => {
      if (!activeTabId) return;

      try {
        setIsLoading(true);
        const cleanedUrl = url.trim();
        const isIPFS =
          cleanedUrl.startsWith("ipfs://") || cleanedUrl.startsWith("/ipfs/");
        const hash =
          cleanedUrl.replace("ipfs://", "").replace("/ipfs/", "") ||
          "QmdefaultHome";

        updateTab(activeTabId, {
          url: `ipfs://${hash}`,
          title: `IPFS: ${hash.slice(0, 8)}...`,
        });

        await addToHistory({
          url: `ipfs://${hash}`,
          title: hash,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error("Navigation error:", error);
        toast({ title: "Erro ao navegar", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    },
    [activeTabId, updateTab, toast],
  );

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  return (
    <div className="flex flex-col h-full">
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
      <ContentViewer content={mockIpfsContent.QmdefaultHome} />{" "}
      {/* Assuming ContentViewer will display the content */}
    </div>
  );
}
