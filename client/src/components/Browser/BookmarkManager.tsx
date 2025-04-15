import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, Star } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';

interface BookmarkItem {
  id: number;
  title: string;
  ipfsHash: string;
  dateAdded: Date;
}

interface BookmarkManagerProps {
  onAddBookmark: () => void;
  userId?: number;
  isAuthenticated: boolean;
}

export default function BookmarkManager({ 
  onAddBookmark, 
  userId, 
  isAuthenticated 
}: BookmarkManagerProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Função para carregar favoritos do servidor
  const loadBookmarks = async () => {
    if (!isAuthenticated || !userId) {
      setBookmarks([]);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simular carregamento de favoritos
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Favoritos simulados para demonstração
      const mockBookmarks = [
        {
          id: 1,
          title: 'Página inicial Internet 3.0',
          ipfsHash: 'QmdefaultHome',
          dateAdded: new Date()
        },
        {
          id: 2,
          title: 'Exemplo de página IPFS',
          ipfsHash: 'QmSample1',
          dateAdded: new Date()
        },
        {
          id: 3,
          title: 'Informações sobre Blockchain',
          ipfsHash: 'QmSample2',
          dateAdded: new Date()
        }
      ];
      
      setBookmarks(mockBookmarks);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isAuthenticated && userId) {
      loadBookmarks();
    }
  }, [isAuthenticated, userId]);
  
  const handleDelete = async (id: number) => {
    // Simulação de exclusão
    setBookmarks(prevBookmarks => 
      prevBookmarks.filter(bookmark => bookmark.id !== id)
    );
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          title="Gerenciar favoritos"
        >
          <Star size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-medium">Favoritos</h3>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={onAddBookmark}
            disabled={!isAuthenticated}
          >
            Adicionar
          </Button>
        </div>
        
        <div className="max-h-80 overflow-auto">
          {!isAuthenticated ? (
            <div className="p-4 text-center text-muted-foreground">
              <p>Faça login para ver seus favoritos</p>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p>Nenhum favorito encontrado</p>
            </div>
          ) : (
            <ul className="py-1">
              {bookmarks.map((bookmark) => (
                <li 
                  key={bookmark.id}
                  className="flex items-center px-3 py-2 hover:bg-muted/50 transition-colors"
                >
                  <Bookmark size={14} className="mr-2 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{bookmark.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      ipfs://{bookmark.ipfsHash}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 ml-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(bookmark.id);
                    }}
                  >
                    <Star className="h-4 w-4 fill-primary text-primary" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}