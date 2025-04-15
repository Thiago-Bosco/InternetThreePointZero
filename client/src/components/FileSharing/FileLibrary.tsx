import { useState, useEffect } from 'react';
import { File, Download, Share2, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface FileItem {
  id: number;
  name: string;
  ipfsHash: string;
  size: number;
  mimeType: string;
  isPublic: boolean;
  dateUploaded: Date;
  ownerId: number;
}

export default function FileLibrary() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [publicFiles, setPublicFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  // Formatar tamanho do arquivo
  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else if (sizeInBytes < 1024 * 1024 * 1024) {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
  };
  
  // Carregar arquivos (simulação)
  useEffect(() => {
    const loadFiles = async () => {
      setIsLoading(true);
      
      try {
        // Simular tempo de carregamento
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados simulados para demonstração
        const mockFiles: FileItem[] = [
          {
            id: 1,
            name: 'Apresentação Internet 3.0.pdf',
            ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
            size: 2500000,
            mimeType: 'application/pdf',
            isPublic: true,
            dateUploaded: new Date(2025, 3, 10),
            ownerId: 1
          },
          {
            id: 2,
            name: 'Dados de Pesquisa.json',
            ipfsHash: 'QmNrEidQrAbxx3FzxNt9E6qjUnDSi1D91z2mHEHPrZRQcX',
            size: 150000,
            mimeType: 'application/json',
            isPublic: false,
            dateUploaded: new Date(2025, 3, 12),
            ownerId: 1
          },
          {
            id: 3,
            name: 'Imagem Logo.png',
            ipfsHash: 'QmV9tSDx9UiPeWExXEeH6aoDvmihvx6jD5eLb4jbTaKGps',
            size: 350000,
            mimeType: 'image/png',
            isPublic: true,
            dateUploaded: new Date(2025, 3, 14),
            ownerId: 1
          }
        ];
        
        const mockPublicFiles: FileItem[] = [
          {
            id: 4,
            name: 'Whitepaper Blockchain.pdf',
            ipfsHash: 'QmYftndCJ7bDXjZQ84D1xoWEeoSjqjCYhAmM4jbCmkEsCe',
            size: 1200000,
            mimeType: 'application/pdf',
            isPublic: true,
            dateUploaded: new Date(2025, 3, 5),
            ownerId: 2
          },
          {
            id: 5,
            name: 'Música Creative Commons.mp3',
            ipfsHash: 'QmUbFVTHbJHqRYvDy9a5eLGtP92zfLMocjoBMtZNtpQ5uK',
            size: 4800000,
            mimeType: 'audio/mpeg',
            isPublic: true,
            dateUploaded: new Date(2025, 3, 8),
            ownerId: 3
          }
        ];
        
        setFiles(mockFiles);
        setPublicFiles(mockPublicFiles);
      } catch (error) {
        console.error('Erro ao carregar arquivos:', error);
        toast({
          title: 'Erro ao carregar arquivos',
          description: 'Não foi possível obter a lista de arquivos',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFiles();
  }, [toast]);
  
  // Filtrar arquivos por busca
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.ipfsHash.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredPublicFiles = publicFiles.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.ipfsHash.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Toggle visibilidade pública de um arquivo
  const toggleVisibility = (id: number) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === id 
          ? { ...file, isPublic: !file.isPublic } 
          : file
      )
    );
    
    toast({
      title: 'Visibilidade atualizada',
      description: 'A visibilidade do arquivo foi alterada com sucesso',
    });
  };
  
  // Excluir arquivo
  const deleteFile = (id: number) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
    
    toast({
      title: 'Arquivo excluído',
      description: 'O arquivo foi removido com sucesso',
    });
  };
  
  // Compartilhar arquivo (copiar link IPFS)
  const shareFile = (ipfsHash: string) => {
    navigator.clipboard.writeText(`ipfs://${ipfsHash}`);
    
    toast({
      title: 'Link copiado',
      description: 'Link IPFS copiado para a área de transferência',
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Biblioteca de Arquivos</CardTitle>
        <CardDescription>Gerencie seus arquivos armazenados na rede IPFS</CardDescription>
        
        <div className="mt-2">
          <Input
            placeholder="Buscar por nome ou hash IPFS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="my-files">
          <TabsList className="mb-4">
            <TabsTrigger value="my-files">Meus Arquivos</TabsTrigger>
            <TabsTrigger value="public-files">Arquivos Públicos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-files">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                {searchQuery ? 'Nenhum arquivo corresponde à busca' : 'Nenhum arquivo encontrado'}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between border-b border-border pb-2">
                    <div className="flex items-center space-x-3">
                      <File size={20} className="text-primary" />
                      <div>
                        <div className="font-medium">{file.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center space-x-2">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span title={new Date(file.dateUploaded).toLocaleString()}>
                            {new Date(file.dateUploaded).toLocaleDateString()}
                          </span>
                          {file.isPublic && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs py-0 h-5">Público</Badge>
                            </>
                          )}
                        </div>
                        <div className="text-xs font-mono text-muted-foreground mt-1">
                          {file.ipfsHash.substring(0, 18)}...
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button variant="outline" size="icon" title="Baixar arquivo">
                        <Download size={16} />
                      </Button>
                      <Button variant="outline" size="icon" title="Compartilhar" onClick={() => shareFile(file.ipfsHash)}>
                        <Share2 size={16} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        title={file.isPublic ? "Tornar privado" : "Tornar público"}
                        onClick={() => toggleVisibility(file.id)}
                      >
                        {file.isPublic ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                      <Button variant="outline" size="icon" title="Excluir" onClick={() => deleteFile(file.id)}>
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="public-files">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : filteredPublicFiles.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                {searchQuery ? 'Nenhum arquivo corresponde à busca' : 'Nenhum arquivo público encontrado'}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredPublicFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between border-b border-border pb-2">
                    <div className="flex items-center space-x-3">
                      <File size={20} className="text-primary" />
                      <div>
                        <div className="font-medium">{file.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center space-x-2">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span title={new Date(file.dateUploaded).toLocaleString()}>
                            {new Date(file.dateUploaded).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-muted-foreground mt-1">
                          {file.ipfsHash.substring(0, 18)}...
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button variant="outline" size="icon" title="Baixar arquivo">
                        <Download size={16} />
                      </Button>
                      <Button variant="outline" size="icon" title="Compartilhar" onClick={() => shareFile(file.ipfsHash)}>
                        <Share2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {files.length} arquivos, {files.filter(f => f.isPublic).length} públicos
        </div>
      </CardFooter>
    </Card>
  );
}