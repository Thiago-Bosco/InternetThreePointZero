import { useState, useRef, useEffect } from "react";
import { TabData } from "@/lib/storage";
import { Plus, X, ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);

  useEffect(() => {
    if (!scrollRef.current) return;
    const handleScroll = () => {
      const canScrollLeft = scrollRef.current.scrollLeft > 0;
      const canScrollRight =
        scrollRef.current.scrollLeft <
        scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      setShowScrollButtons(canScrollLeft || canScrollRight);
    };

    scrollRef.current.addEventListener("scroll", handleScroll);

    return () => {
      scrollRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="relative h-10">
      {showScrollButtons && (
        <div className="absolute left-0 top-0 bottom-0 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => (scrollRef.current!.scrollLeft -= 100)}
            className="rounded-full p-2"
          >
            <ChevronLeft size={16} />
          </Button>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto scroll-smooth"
      >
        {tabs.map((tab) => (
          <TooltipProvider key={tab.id}>
            <Tooltip>
              <TooltipTrigger>
                <div
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 cursor-pointer rounded-t-md transition-all",
                    activeTabId === tab.id
                      ? "bg-background border-primary text-foreground"
                      : "bg-card/50 hover:bg-accent/30",
                  )}
                  onClick={() => onTabChange(tab.id)}
                >
                  <Globe size={14} className="text-muted-foreground" />
                  <span className="truncate">{tab.title}</span>
                  <X
                    size={12}
                    className="ml-2 text-muted-foreground cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>{tab.title}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      {showScrollButtons && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => (scrollRef.current!.scrollLeft += 100)}
            className="rounded-full p-2"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={onNewTab}
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-10"
      >
        <Plus size={18} />
      </Button>
    </div>
  );
}
