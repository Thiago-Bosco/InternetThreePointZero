import { TabData } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TabManagerProps {
  tabs: TabData[];
  activeTabId: string | null;
  onTabChange: (tabId: string) => void;
  onNewTab: () => void;
  onCloseTab: (tabId: string) => void;
}

export default function TabManager({
  tabs,
  activeTabId,
  onTabChange,
  onNewTab,
  onCloseTab,
}: TabManagerProps) {
  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
  };
  
  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    onCloseTab(tabId);
  };
  
  return (
    <div className="flex-1 flex items-center overflow-hidden">
      <ScrollArea className="flex-1 h-full">
        <div className="flex">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`
                flex items-center min-w-[150px] max-w-[200px] h-10 px-3 
                border-r border-border
                cursor-pointer select-none
                ${activeTabId === tab.id 
                  ? 'bg-background text-foreground' 
                  : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'}
              `}
              onClick={() => handleTabClick(tab.id)}
            >
              <div className="flex-1 truncate mr-2 text-sm">
                {tab.title || 'Nova Aba'}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 rounded-full hover:bg-muted/70"
                onClick={(e) => handleCloseTab(e, tab.id)}
                disabled={tabs.length <= 1}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
      <Button
        variant="ghost"
        size="sm"
        onClick={onNewTab}
        className="h-10 w-10 flex-shrink-0 border-l border-border rounded-none"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
