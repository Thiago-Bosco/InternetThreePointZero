import { FeedPost } from '@shared/schema';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import { useP2P } from '@/context/P2PContext';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MoreHorizontal, 
  Globe, 
  Calendar, 
  User, 
  Trash2,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface FeedComponentProps {
  posts: FeedPost[];
  isLoading: boolean;
  isOwnFeed: boolean;
  onDeletePost: (postId: number) => Promise<void>;
}

export default function FeedComponent({ 
  posts, 
  isLoading, 
  isOwnFeed,
  onDeletePost 
}: FeedComponentProps) {
  const { fetchIPFSContent } = useP2P();
  const [expandedPostContent, setExpandedPostContent] = useState<Record<number, any>>({});
  const [isLoadingContent, setIsLoadingContent] = useState<Record<number, boolean>>({});
  const [deletePostId, setDeletePostId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Carregar conteúdo dos posts do IPFS quando o componente for montado
  useEffect(() => {
    const loadPostContent = async () => {
      for (const post of posts) {
        if (!expandedPostContent[post.id]) {
          await loadSinglePostContent(post);
        }
      }
    };
    
    loadPostContent();
  }, [posts]);
  
  const loadSinglePostContent = async (post: FeedPost) => {
    if (expandedPostContent[post.id]) return;
    
    setIsLoadingContent(prev => ({ ...prev, [post.id]: true }));
    
    try {
      const content = await fetchIPFSContent(post.ipfsHash);
      
      // Converter o conteúdo para texto e depois para objeto JSON
      const textDecoder = new TextDecoder('utf-8');
      const contentText = textDecoder.decode(content);
      const contentObj = JSON.parse(contentText);
      
      setExpandedPostContent(prev => ({ ...prev, [post.id]: contentObj }));
    } catch (error) {
      console.error(`Erro ao carregar conteúdo do post ${post.id}:`, error);
      
      // Adicionar um objeto de erro ao estado para exibir na UI
      setExpandedPostContent(prev => ({ 
        ...prev, 
        [post.id]: { error: 'Não foi possível carregar o conteúdo' } 
      }));
    } finally {
      setIsLoadingContent(prev => ({ ...prev, [post.id]: false }));
    }
  };
  
  const handleDeleteClick = (postId: number) => {
    setDeletePostId(postId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (deletePostId !== null) {
      try {
        await onDeletePost(deletePostId);
        setIsDeleteDialogOpen(false);
      } catch (error) {
        console.error('Erro ao excluir post:', error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o post",
          variant: "destructive",
        });
      }
    }
  };
  
  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Verificar se há um anexo
  const hasAttachments = (post: FeedPost) => {
    return post.attachments && post.attachments.length > 0;
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-[90%] mb-2" />
              <Skeleton className="h-4 w-[80%]" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-8 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  if (posts.length === 0) {
    return (
      <div className="text-center p-12">
        <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">Nenhum post encontrado</h3>
        <p className="text-muted-foreground">
          {isOwnFeed 
            ? 'Você ainda não criou nenhum post. Crie seu primeiro post para começar!' 
            : 'Este usuário ainda não fez nenhuma postagem.'}
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {posts.map((post) => {
        const postContent = expandedPostContent[post.id];
        const isLoadingThisPost = isLoadingContent[post.id];
        
        return (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {postContent?.username || 'Usuário'}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(post.datePosted.toString())}
                    </CardDescription>
                  </div>
                </div>
                
                {isOwnFeed && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteClick(post.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir Post
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {isLoadingThisPost ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[70%]" />
                </div>
              ) : postContent?.error ? (
                <div className="p-3 bg-destructive/10 rounded-md text-destructive text-sm">
                  {postContent.error}
                </div>
              ) : (
                <>
                  <div className="whitespace-pre-wrap">
                    {postContent?.content || post.content}
                  </div>
                  
                  {/* Exibir anexos se houver */}
                  {hasAttachments(post) && (
                    <div className="pt-2">
                      <p className="text-sm font-medium mb-2">Anexos:</p>
                      <div className="flex flex-wrap gap-2">
                        {post.attachments.map((hash, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            <span className="truncate max-w-[150px]">{hash.substring(0, 10)}...</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-5 w-5 p-0 ml-1"
                              onClick={() => window.open(`ipfs://${hash}`, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
            
            <CardFooter>
              <div className="flex items-center text-xs text-muted-foreground">
                <Globe className="h-3 w-3 mr-1" />
                <span>Publicado na rede IPFS</span>
              </div>
            </CardFooter>
          </Card>
        );
      })}
      
      {/* Diálogo de confirmação de exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
