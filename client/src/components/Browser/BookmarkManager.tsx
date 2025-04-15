import { useState, useEffect } from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bookmark, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Bookmark as BookmarkType } from '@shared/schema';
import { useUser } from '@/context/UserContext';

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
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Carregar favoritos quando o componente for montado
  useEffect(() => {
    if (isAuthenticated && userId) {
      loadBookmarks();
    }
  }, [isAuthenticated, userId]);
  
  const loadBookmarks = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/bookmarks`);
      
      if (!response.ok) {
        throw new Error('Falha ao carregar favoritos');
      }
      
      const data = await response.json();
      setBookmarks(data);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus favoritos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteBookmark = async (id: number) => {
    try {
      const response = await fetch(`/api/bookmarks/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Falha ao excluir favorito');
      }
      
      // Atualizar lista de favoritos
      setBookmarks(prevBookmarks => prevBookmarks.filter(bookmark => bookmark.id !== id));
      
      toast({
        title: "Favorito excluído",
        description: "O favorito foi removido com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir favorito:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o favorito",
        variant: "destructive",
      });
    }
  };
  
  const handleBookmarkClick = (ipfsHash: string) => {
    // Navegue para o hash IPFS (implementado por outro componente)
    window.location.href = `ipfs://${ipfsHash}`;
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Bookmark className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Favoritos</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <DropdownMenuItem disabled>Carregando...</DropdownMenuItem>
        ) : bookmarks.length > 0 ? (
          <>
            {bookmarks.map((bookmark) => (
              <DropdownMenuItem 
                key={bookmark.id}
                className="flex justify-between items-center cursor-pointer"
              >
                <span 
                  className="truncate flex-1"
                  onClick={() => handleBookmarkClick(bookmark.ipfsHash)}
                >
                  {bookmark.title}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBookmark(bookmark.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </DropdownMenuItem>
            ))}
          </>
        ) : (
          <DropdownMenuItem disabled>Nenhum favorito</DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onAddBookmark}>
          Adicionar página atual aos favoritos
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
