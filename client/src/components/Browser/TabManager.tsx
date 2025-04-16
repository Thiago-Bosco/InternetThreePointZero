import { useState } from 'react';
import { TabData } from '@/lib/storage';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  onCloseTab 
}: TabManagerProps) {
  return (
    <div className="flex items-center flex-1 h-8 overflow-hidden">
      <ScrollArea className="flex-1 h-full" orientation="horizontal">
        <div className="flex h-full">
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeTabId}
              onClick={() => onTabChange(tab.id)}
              onClose={() => onCloseTab(tab.id)}
            />
          ))}
        </div>
      </ScrollArea>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onNewTab}
        className="h-10 w-10 flex-shrink-0"
        title="Nova aba"
      >
        <Plus size={18} />
      </Button>
    </div>
  );
}

interface TabProps {
  tab: TabData;
  isActive: boolean;
  onClick: () => void;
  onClose: () => void;
}

function Tab({ tab, isActive, onClick, onClose }: TabProps) {
  const [isHovering, setIsHovering] = useState(false);
  
  // Calcular favicon, usar padrão se não existir
  const favicon = tab.favicon || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Ccircle cx="12" cy="12" r="10"/%3E%3C/svg%3E';
  
  // Truncar título se muito longo
  const displayTitle = tab.title || 'Nova aba';
  const truncatedTitle = displayTitle.length > 20 
    ? displayTitle.substring(0, 18) + '...'
    : displayTitle;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center h-full px-3 py-2 border-r border-border min-w-[120px] max-w-[200px] cursor-pointer group transition-colors relative ${
              isActive 
                ? 'bg-background text-foreground' 
                : 'bg-muted/40 text-muted-foreground hover:bg-muted'
            }`}
            onClick={onClick}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <img 
                src={favicon} 
                alt="" 
                className="w-4 h-4 flex-shrink-0" 
              />
              <span className="truncate flex-1">{truncatedTitle}</span>
            </div>
            
            <button
              className={`ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-full p-0.5 ${
                isHovering ? 'opacity-100' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              title="Fechar aba"
            >
              <X size={14} />
            </button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{displayTitle}</p>
          {tab.url && <p className="text-xs text-muted-foreground">{tab.url}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}