import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileUploader from '@/components/FileSharing/FileUploader';
import FileExplorer from '@/components/FileSharing/FileExplorer';
import { useUser } from '@/context/UserContext';
import { Card } from '@/components/ui/card';
import { File } from '@shared/schema';

export default function FileSharing() {
  const { isAuthenticated, currentUser } = useUser();
  const [userFiles, setUserFiles] = useState<File[]>([]);
  const [publicFiles, setPublicFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Carregar arquivos quando o componente for montado
  useEffect(() => {
    const loadFiles = async () => {
      setIsLoading(true);
      
      try {
        // Carregar arquivos públicos
        const publicResponse = await fetch('/api/files/public');
        if (publicResponse.ok) {
          const publicFilesData = await publicResponse.json();
          setPublicFiles(publicFilesData);
        }
        
        // Carregar arquivos do usuário se estiver autenticado
        if (isAuthenticated && currentUser) {
          const userResponse = await fetch(`/api/users/${currentUser.id}/files`);
          if (userResponse.ok) {
            const userFilesData = await userResponse.json();
            setUserFiles(userFilesData);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar arquivos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFiles();
  }, [isAuthenticated, currentUser]);
  
  const handleFileUploaded = (newFile: File) => {
    // Adicionar o novo arquivo à lista de arquivos do usuário
    setUserFiles(prev => [newFile, ...prev]);
    
    // Se o arquivo for público, adicioná-lo também à lista de arquivos públicos
    if (newFile.isPublic) {
      setPublicFiles(prev => [newFile, ...prev]);
    }
  };
  
  const handleFileVisibilityChanged = (fileId: number, isPublic: boolean) => {
    // Atualizar o arquivo na lista de arquivos do usuário
    setUserFiles(prev => 
      prev.map(file => 
        file.id === fileId ? { ...file, isPublic } : file
      )
    );
    
    // Atualizar a lista de arquivos públicos
    if (isPublic) {
      // Adicionar à lista de arquivos públicos se não existir
      const fileExists = publicFiles.some(file => file.id === fileId);
      if (!fileExists) {
        const fileToAdd = userFiles.find(file => file.id === fileId);
        if (fileToAdd) {
          setPublicFiles(prev => [{ ...fileToAdd, isPublic: true }, ...prev]);
        }
      }
    } else {
      // Remover da lista de arquivos públicos
      setPublicFiles(prev => prev.filter(file => file.id !== fileId));
    }
  };
  
  const handleFileDeleted = (fileId: number) => {
    // Remover o arquivo da lista de arquivos do usuário
    setUserFiles(prev => prev.filter(file => file.id !== fileId));
    
    // Remover da lista de arquivos públicos se existir
    setPublicFiles(prev => prev.filter(file => file.id !== fileId));
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Compartilhamento de Arquivos</h1>
      <p className="text-muted-foreground">
        Faça upload e gerencie seus arquivos na rede IPFS descentralizada
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seção de upload */}
        <FileUploader onFileUploaded={handleFileUploaded} />
        
        {/* Explicação sobre IPFS */}
        <Card className="p-6 bg-muted/30">
          <h3 className="text-xl font-semibold mb-4">Como funciona?</h3>
          <p className="mb-3">
            Seus arquivos são armazenados no <strong>IPFS (InterPlanetary File System)</strong>, 
            uma rede P2P distribuída para armazenar e compartilhar dados.
          </p>
          <p className="mb-3">
            Cada arquivo recebe um <strong>identificador único</strong> baseado em seu conteúdo,
            garantindo que o conteúdo não possa ser alterado sem mudar seu endereço.
          </p>
          <p>
            Arquivos públicos podem ser acessados por qualquer pessoa com o hash IPFS,
            enquanto arquivos privados só são visíveis para você.
          </p>
        </Card>
      </div>
      
      {/* Explorador de arquivos */}
      <Tabs defaultValue={isAuthenticated ? "meus-arquivos" : "publicos"}>
        <TabsList>
          {isAuthenticated && <TabsTrigger value="meus-arquivos">Meus Arquivos</TabsTrigger>}
          <TabsTrigger value="publicos">Arquivos Públicos</TabsTrigger>
        </TabsList>
        
        {isAuthenticated && (
          <TabsContent value="meus-arquivos">
            <FileExplorer
              files={userFiles}
              isLoading={isLoading}
              showVisibilityToggle={true}
              showDeleteOption={true}
              onVisibilityChanged={handleFileVisibilityChanged}
              onFileDeleted={handleFileDeleted}
            />
          </TabsContent>
        )}
        
        <TabsContent value="publicos">
          <FileExplorer
            files={publicFiles}
            isLoading={isLoading}
            showVisibilityToggle={false}
            showDeleteOption={false}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
