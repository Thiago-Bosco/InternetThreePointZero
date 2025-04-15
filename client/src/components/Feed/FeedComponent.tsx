import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  MoreHorizontal, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Trash2,
  RefreshCw,
  Globe
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Tipos
interface FeedPost {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  content: string;
  ipfsHash: string;
  datePosted: Date;
  likes: number;
  comments: number;
  hasLiked?: boolean;
}

interface FeedComponentProps {
  posts?: FeedPost[];
  isLoading?: boolean;
  isOwnFeed?: boolean;
  onDeletePost?: (postId: number) => void;
}

export default function FeedComponent() {
  const { isAuthenticated, currentUser } = useUser();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Carregar posts do feed (simulação)
  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      
      try {
        // Simular carregamento de rede
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Posts simulados para demonstração
        const mockPosts: FeedPost[] = [
          {
            id: 1,
            userId: 1,
            userName: 'Ana Costa',
            content: 'Acabei de publicar um novo artigo sobre navegação descentralizada e Web 3.0. Compartilhei os arquivos via IPFS, confira!',
            ipfsHash: 'QmV7Qi9Vz2CpNj4JKF6kKSpnfRwDrBESPHNjQwJxS5NRqd',
            datePosted: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
            likes: 12,
            comments: 3,
            hasLiked: false
          },
          {
            id: 2,
            userId: 2,
            userName: 'Pedro Almeida',
            content: 'Teste de upload de imagem usando IPFS. A distribuição P2P oferece uma alternativa interessante aos serviços centralizados tradicionais de hospedagem de imagens.',
            ipfsHash: 'QmYwR9jM9pMTHVeEq1H63DNyBHR3DakvJFGQ16G9EHB7Pj',
            datePosted: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 horas atrás
            likes: 8,
            comments: 2,
            hasLiked: true
          },
          {
            id: 3,
            userId: 3,
            userName: 'Internet 3.0 Oficial',
            content: 'Lançamos oficialmente a versão beta do navegador Internet 3.0! Agora você pode explorar conteúdo descentralizado, compartilhar arquivos P2P e muito mais. #descentralizado #p2p #ipfs',
            ipfsHash: 'QmZQXTEBgr1ZfQkS4jx4ZjYmWK6FY1VuZayKBLECNPSvQQ',
            datePosted: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 dia atrás
            likes: 42,
            comments: 15,
            hasLiked: false
          }
        ];
        
        setPosts(mockPosts);
      } catch (error) {
        console.error('Erro ao carregar feed:', error);
        toast({
          title: 'Erro ao carregar feed',
          description: 'Não foi possível obter as publicações',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPosts();
  }, [toast]);
  
  // Publicar novo post
  const handleSubmitPost = async () => {
    if (!newPostContent.trim() || !isAuthenticated) return;
    
    setIsSubmitting(true);
    
    try {
      // Simular envio para a rede IPFS
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Criar novo post
      const newPost: FeedPost = {
        id: Date.now(),
        userId: currentUser?.id || 0,
        userName: currentUser?.username || 'Usuário',
        content: newPostContent,
        ipfsHash: `Qm${Math.random().toString(36).substring(2, 15)}`, // Hash aleatório para simulação
        datePosted: new Date(),
        likes: 0,
        comments: 0,
        hasLiked: false
      };
      
      // Adicionar ao feed
      setPosts(prev => [newPost, ...prev]);
      setNewPostContent('');
      
      toast({
        title: 'Publicação enviada',
        description: 'Seu conteúdo foi publicado na rede descentralizada'
      });
    } catch (error) {
      console.error('Erro ao publicar:', error);
      toast({
        title: 'Erro ao publicar',
        description: 'Não foi possível enviar sua publicação',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Curtir/descurtir post
  const handleToggleLike = (postId: number) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const hasLiked = !post.hasLiked;
          const likeDelta = hasLiked ? 1 : -1;
          
          return {
            ...post,
            hasLiked,
            likes: post.likes + likeDelta
          };
        }
        return post;
      })
    );
  };
  
  // Excluir post
  const handleDeletePost = (postId: number) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    
    toast({
      title: 'Publicação excluída',
      description: 'A publicação foi removida com sucesso'
    });
  };
  
  // Formatar data relativa
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds} segundos atrás`;
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} minutos atrás`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} horas atrás`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} dias atrás`;
    
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} meses atrás`;
  };
  
  // Renderizar iniciais para avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };
  
  // Renderizar componente de publicação
  const renderPublishForm = () => {
    if (!isAuthenticated) {
      return (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center py-4">
              <p className="mb-4 text-muted-foreground">
                Faça login para publicar conteúdo no feed descentralizado
              </p>
              <Button>Fazer Login</Button>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Avatar>
              <AvatarFallback>
                {currentUser?.username ? getInitials(currentUser.username) : 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <Textarea
                placeholder="O que você gostaria de compartilhar?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="mb-3 resize-none"
                rows={3}
              />
              
              <div className="flex justify-between items-center">
                <div className="text-xs text-muted-foreground flex items-center">
                  <Globe size={14} className="mr-1" />
                  <span>Público • Armazenado em IPFS</span>
                </div>
                
                <Button 
                  onClick={handleSubmitPost} 
                  disabled={!newPostContent.trim() || isSubmitting}
                >
                  {isSubmitting ? 'Publicando...' : 'Publicar'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Renderizar feed de posts
  const renderFeed = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando publicações...</p>
          </div>
        </div>
      );
    }
    
    if (posts.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">Nenhuma publicação encontrada</p>
          <p className="text-sm">Seja o primeiro a publicar algo!</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Avatar>
                  <AvatarImage src={post.userAvatar} alt={post.userName} />
                  <AvatarFallback>{getInitials(post.userName)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{post.userName}</h3>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(post.datePosted)}
                      </p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          navigator.clipboard.writeText(`ipfs://${post.ipfsHash}`);
                          toast({
                            title: 'Link copiado',
                            description: 'Link IPFS copiado para a área de transferência',
                          });
                        }}>
                          Copiar link IPFS
                        </DropdownMenuItem>
                        <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                        
                        {post.userId === currentUser?.id && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeletePost(post.id)}
                            >
                              Excluir publicação
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="mt-2 mb-4">
                    <p className="whitespace-pre-wrap">{post.content}</p>
                    <p className="text-xs font-mono text-muted-foreground mt-2">
                      Hash IPFS: {post.ipfsHash}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between border-t pt-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`gap-1 ${post.hasLiked ? 'text-primary' : ''}`}
                      onClick={() => handleToggleLike(post.id)}
                    >
                      <ThumbsUp size={16} className={post.hasLiked ? 'fill-primary' : ''} />
                      <span>{post.likes}</span>
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="gap-1">
                      <MessageSquare size={16} />
                      <span>{post.comments}</span>
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Share2 size={16} />
                      <span>Compartilhar</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Feed Descentralizado</CardTitle>
      </CardHeader>
      
      <CardContent className="h-[calc(100%-65px)] overflow-auto">
        <Tabs defaultValue="feed">
          <TabsList className="mb-6">
            <TabsTrigger value="feed">Feed Global</TabsTrigger>
            <TabsTrigger value="following">Seguindo</TabsTrigger>
            <TabsTrigger value="my-posts">Minhas Publicações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feed">
            {renderPublishForm()}
            {renderFeed()}
          </TabsContent>
          
          <TabsContent value="following">
            <div className="text-center py-12 text-muted-foreground">
              <p>Recurso disponível em breve!</p>
            </div>
          </TabsContent>
          
          <TabsContent value="my-posts">
            <div className="text-center py-12 text-muted-foreground">
              <p>Recurso disponível em breve!</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}