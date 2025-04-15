import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useP2P } from '@/context/P2PContext';
import { FeedPost } from '@shared/schema';
import FeedComponent from '@/components/Feed/FeedComponent';
import CreatePost from '@/components/Feed/CreatePost';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function Feed() {
  const { isAuthenticated, currentUser } = useUser();
  const { uploadFile } = useP2P();
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userIdToView, setUserIdToView] = useState<number | null>(null);
  const { toast } = useToast();

  // Carregar posts do usuário atual quando o componente for montado
  useEffect(() => {
    const loadFeed = async () => {
      if (!isAuthenticated || !currentUser) {
        setIsLoading(false);
        return;
      }
      
      setUserIdToView(currentUser.id);
      await fetchUserFeed(currentUser.id);
    };
    
    loadFeed();
  }, [isAuthenticated, currentUser]);

  const fetchUserFeed = async (userId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/feed`);
      
      if (response.ok) {
        const posts = await response.json();
        setFeedPosts(posts);
      } else {
        throw new Error(`Erro ao carregar feed: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao carregar feed:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o feed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (content: string, attachments: File[]) => {
    if (!isAuthenticated || !currentUser) {
      toast({
        title: "Não autenticado",
        description: "É necessário estar conectado para criar posts",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Upload de anexos para IPFS
      const attachmentHashes: string[] = [];
      
      if (attachments.length > 0) {
        for (const file of attachments) {
          const hash = await uploadFile(file);
          attachmentHashes.push(hash);
        }
      }
      
      // Criar conteúdo do post para IPFS
      const postContent = {
        username: currentUser.username,
        content,
        attachments: attachmentHashes,
        timestamp: new Date().toISOString(),
      };
      
      // Converter para Blob
      const postBlob = new Blob([JSON.stringify(postContent)], { type: 'application/json' });
      const postFile = new File([postBlob], 'post.json', { type: 'application/json' });
      
      // Upload do post para IPFS
      const postHash = await uploadFile(postFile);
      
      // Salvar post no servidor
      const response = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          content,
          ipfsHash: postHash,
          attachments: attachmentHashes,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao salvar post');
      }
      
      const newPost = await response.json();
      
      // Adicionar o novo post à lista
      setFeedPosts(prev => [newPost, ...prev]);
      
      toast({
        title: "Post criado",
        description: "Seu post foi publicado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao criar post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o post",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      const response = await fetch(`/api/feed/posts/${postId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Falha ao excluir post');
      }
      
      // Remover o post da lista
      setFeedPosts(prev => prev.filter(post => post.id !== postId));
      
      toast({
        title: "Post excluído",
        description: "O post foi excluído com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o post",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      // Implementar busca (pode ser tanto por nome de usuário ou ID)
      // Por simplicidade, vamos supor que a busca é por ID
      try {
        const userId = parseInt(searchQuery.trim());
        if (!isNaN(userId)) {
          setUserIdToView(userId);
          fetchUserFeed(userId);
        } else {
          toast({
            title: "Busca inválida",
            description: "Por favor, insira um ID de usuário válido",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Erro de busca",
          description: "Formato de busca inválido",
          variant: "destructive",
        });
      }
    }
  };

  const viewOwnFeed = () => {
    if (currentUser) {
      setUserIdToView(currentUser.id);
      fetchUserFeed(currentUser.id);
    }
  };

  const isViewingOwnFeed = userIdToView === currentUser?.id;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Feed Pessoal</h1>
      <p className="text-muted-foreground">
        Compartilhe conteúdo e siga atualizações de outros usuários
      </p>

      {!isAuthenticated ? (
        <Alert>
          <AlertTitle>Autenticação necessária</AlertTitle>
          <AlertDescription>
            Você precisa estar conectado para ver e criar posts no feed.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <Tabs defaultValue="feed" className="w-full">
              <TabsList>
                <TabsTrigger value="feed">Feed</TabsTrigger>
                <TabsTrigger value="buscar">Buscar Usuário</TabsTrigger>
              </TabsList>
              
              <TabsContent value="feed" className="space-y-4">
                {!isViewingOwnFeed && (
                  <div className="flex justify-between items-center bg-muted/30 p-3 rounded-md">
                    <p>Visualizando feed do usuário ID: {userIdToView}</p>
                    <Button variant="outline" size="sm" onClick={viewOwnFeed}>
                      Voltar ao meu feed
                    </Button>
                  </div>
                )}
                
                {isViewingOwnFeed && (
                  <CreatePost onCreatePost={handleCreatePost} />
                )}
                
                <FeedComponent 
                  posts={feedPosts}
                  isLoading={isLoading}
                  isOwnFeed={isViewingOwnFeed}
                  onDeletePost={handleDeletePost}
                />
              </TabsContent>
              
              <TabsContent value="buscar">
                <div className="space-y-4">
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Buscar usuário por ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Button type="submit">Buscar</Button>
                  </form>
                  
                  <div className="p-4 border rounded-md bg-muted/30">
                    <h3 className="font-medium mb-2">Como buscar outros usuários</h3>
                    <p className="text-sm text-muted-foreground">
                      Para encontrar o feed de outro usuário, você precisa conhecer o ID dele.
                      Peça para o usuário compartilhar o ID que pode ser encontrado na seção de identidade.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
}
