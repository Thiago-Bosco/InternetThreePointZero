
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { History, Trash2, ExternalLink } from 'lucide-react';

interface HistoryViewerProps {
  history: {url: string; title: string; timestamp: Date}[];
  onNavigate: (url: string) => void;
  onClear: () => void;
}

export default function HistoryViewer({ history, onNavigate, onClear }: HistoryViewerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="hover:bg-accent"
        title="Histórico"
      >
        <History size={18} />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History size={18} />
              Histórico de Navegação
            </DialogTitle>
          </DialogHeader>

          <div className="flex justify-end mb-4">
            <Button variant="destructive" size="sm" onClick={onClear}>
              <Trash2 size={14} className="mr-2" />
              Limpar Histórico
            </Button>
          </div>

          <ScrollArea className="h-[400px] rounded-md border p-4">
            {history.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Nenhum histórico encontrado
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 hover:bg-accent rounded-md group"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="font-medium truncate">{entry.title}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {entry.url}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={() => {
                          onNavigate(entry.url);
                          setOpen(false);
                        }}
                      >
                        <ExternalLink size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
