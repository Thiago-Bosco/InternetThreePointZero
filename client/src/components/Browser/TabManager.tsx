
import { Plus, X, Globe } from "lucide-react";

interface Props {
  tabs: { id: string; title: string; icon?: string }[];
  activeTabId: string | null;
  onTabChange: (id: string) => void;
  onNewTab: () => void;
  onCloseTab: (id: string) => void;
}

export default function TabManager({
  tabs,
  activeTabId,
  onTabChange,
  onNewTab,
  onCloseTab,
}: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto items-center px-2">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors
            ${tab.id === activeTabId 
              ? "bg-accent text-accent-foreground" 
              : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}
        >
          {tab.icon ? (
            <img src={tab.icon} className="w-4 h-4" alt="" />
          ) : (
            <Globe size={14} className="text-muted-foreground" />
          )}
          <span className="max-w-[140px] truncate">{tab.title}</span>
          {tabs.length > 1 && (
            <X
              size={14}
              className="opacity-0 group-hover:opacity-100 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id);
              }}
            />
          )}
        </div>
      ))}
      <button 
        onClick={onNewTab} 
        className="p-1 hover:bg-accent rounded-md transition-colors"
        title="Nova aba"
      >
        <Plus size={16} className="text-muted-foreground" />
      </button>
    </div>
  );
}
