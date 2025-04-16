import { Plus, X } from "lucide-react";

interface Props {
  tabs: { id: string; title: string }[];
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
    <div className="flex gap-2 overflow-x-auto items-center">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center px-3 py-1 rounded-md text-sm cursor-pointer
            ${tab.id === activeTabId ? "bg-primary text-white" : "bg-muted text-foreground"}`}
        >
          {tab.title}
          {tabs.length > 1 && (
            <X
              size={14}
              className="ml-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id);
              }}
            />
          )}
        </div>
      ))}
      <button onClick={onNewTab} className="ml-2 p-1 hover:bg-accent rounded">
        <Plus size={16} />
      </button>
    </div>
  );
}
