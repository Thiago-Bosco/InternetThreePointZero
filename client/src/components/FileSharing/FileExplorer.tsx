import { File } from '@shared/schema';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  DownloadCloud, 
  FileText, 
  Globe, 
  Lock, 
  Copy, 
  CheckCircle, 
  Trash2, 
  Calendar, 
  FileIcon
} from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Função para formatar o tamanho do arquivo
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

// Função para formatar a data
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Ícone para o tipo de arquivo
function getFileIcon(mimeType: string | undefined): JSX.Element {
  if (!mimeType) return <FileText className="h-4 w-4" />;
  
  if (mimeType.startsWith('image/')) return <FileIcon className="h-4 w-4 text-blue-500" />;
  if (mimeType.startsWith('video/')) return <FileIcon className="h-4 w-4 text-red-500" />;
  if (mimeType.startsWith('audio/')) return <FileIcon className="h-4 w-4 text-green-500" />;
  if (mimeType.includes('pdf')) return <FileIcon className="h-4 w-4 text-orange-500" />;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileIcon className="h-4 w-4 text-emerald-500" />;
  if (mimeType.includes('document') || mimeType.includes('word')) return <FileIcon className="h-4 w-4 text-sky-500" />;
  
  return <FileText className="h-4 w-4 text-gray-500" />;
}

interface FileExplorerProps {
  files: File[];
  isLoading: boolean;
  showVisibilityToggle: boolean;
  showDeleteOption: boolean;
  onVisibilityChanged?: (fileId: number, isPublic: boolean) => void;
  onFileDeleted?: (fileId: number) => void;
}

export default function FileExplorer({
  files,
  isLoading,
  showVisibilityToggle,
  showDeleteOption,
  onVisibilityChanged,
  onFileDeleted,
}: FileExplorerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isFileDetailsOpen, setIsFileDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  
  const handleFileClick = (file: File) => {
    setSelectedFile(file);
    setIsFileDetailsOpen(true);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        
        toast({
          title: "Link copiado",
          description: "O link IPFS foi copiado para a área de transferência",
        });
      })
      .catch((error) => {
        console.error('Erro ao copiar para a área de transferência:', error);
        toast({
          title: "Erro",
          description: "Não foi possível copiar o link",
          variant: "destructive",
        });
      });
  };
  
  const handleVisibilityChange = async () => {
    if (!selectedFile || !onVisibilityChanged) return;
    
    try {
      const newVisibility = !selectedFile.isPublic;
      
      const response = await fetch(`/api/files/${selectedFile.id}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: newVisibility }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao alterar visibilidade do arquivo');
      }
      
      const updatedFile = await response.json();
      
      // Atualizar arquivo selecionado
      setSelectedFile(updatedFile);
      
      // Notificar o componente pai
      onVisibilityChanged(selectedFile.id, newVisibility);
      
      toast({
        title: "Visibilidade alterada",
        description: `Arquivo agora está ${newVisibility ? 'público' : 'privado'}`,
      });
    } catch (error) {
      console.error('Erro ao alterar visibilidade:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar a visibilidade do arquivo",
        variant: "destructive",
      });
    }
  };
  
  const confirmDelete = () => {
    setIsDeleteDialogOpen(true);
  };
  
  const handleDelete = async () => {
    if (!selectedFile || !onFileDeleted) return;
    
    try {
      const response = await fetch(`/api/files/${selectedFile.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Falha ao excluir arquivo');
      }
      
      // Notificar o componente pai
      onFileDeleted(selectedFile.id);
      
      // Fechar diálogos
      setIsDeleteDialogOpen(false);
      setIsFileDetailsOpen(false);
      
      toast({
        title: "Arquivo excluído",
        description: "O arquivo foi excluído com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o arquivo",
        variant: "destructive",
      });
    }
  };
  
  const viewOnIPFS = (ipfsHash: string) => {
    window.open(`ipfs://${ipfsHash}`, '_blank');
  };
  
  // Renderização do estado de carregamento
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-card rounded-md overflow-hidden">
          <div className="p-4 border-b">
            <Skeleton className="h-5 w-1/3" />
          </div>
          <div className="p-4 space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Renderização para lista vazia
  if (files.length === 0) {
    return (
      <div className="text-center p-12">
        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">Nenhum arquivo encontrado</h3>
        <p className="text-muted-foreground">
          {showVisibilityToggle 
            ? 'Você ainda não fez upload de nenhum arquivo.' 
            : 'Não há arquivos públicos disponíveis.'}
        </p>
      </div>
    );
  }
  
  return (
    <>
      <Table>
        <TableCaption>Lista de arquivos na rede IPFS</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[280px]">Nome</TableHead>
            <TableHead>Tamanho</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow
              key={file.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleFileClick(file)}
            >
              <TableCell className="font-medium flex items-center gap-2">
                {getFileIcon(file.mimeType)}
                <span className="truncate max-w-[240px]">{file.fileName}</span>
              </TableCell>
              <TableCell>{formatFileSize(file.fileSize)}</TableCell>
              <TableCell>{file.mimeType || 'Desconhecido'}</TableCell>
              <TableCell>{formatDate(file.dateUploaded.toString())}</TableCell>
              <TableCell>
                {file.isPublic ? (
                  <Badge variant="outline" className="bg-green-50 border-green-200 text-green-600">
                    <Globe className="h-3 w-3 mr-1" /> Público
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-600">
                    <Lock className="h-3 w-3 mr-1" /> Privado
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    viewOnIPFS(file.ipfsHash);
                  }}
                >
                  <DownloadCloud className="h-4 w-4 mr-1" />
                  <span className="sr-only md:not-sr-only md:inline-block">Ver</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Diálogo de detalhes do arquivo */}
      <Dialog open={isFileDetailsOpen} onOpenChange={setIsFileDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Arquivo</DialogTitle>
            <DialogDescription>
              Informações e opções para gerenciar o arquivo
            </DialogDescription>
          </DialogHeader>
          
          {selectedFile && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                {getFileIcon(selectedFile.mimeType)}
                <span className="font-medium text-lg truncate">{selectedFile.fileName}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Tamanho</p>
                  <p className="font-medium">{formatFileSize(selectedFile.fileSize)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tipo</p>
                  <p className="font-medium">{selectedFile.mimeType || 'Desconhecido'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium flex items-center gap-1">
                    {selectedFile.isPublic ? (
                      <>
                        <Globe className="h-3 w-3 text-green-600" /> 
                        <span className="text-green-600">Público</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3 text-amber-600" /> 
                        <span className="text-amber-600">Privado</span>
                      </>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Data de upload</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> 
                    {formatDate(selectedFile.dateUploaded.toString())}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <p className="text-muted-foreground text-sm">Link IPFS</p>
                <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
                  <code className="text-xs flex-1 font-mono truncate">
                    ipfs://{selectedFile.ipfsHash}
                  </code>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0"
                    onClick={() => copyToClipboard(`ipfs://${selectedFile.ipfsHash}`)}
                  >
                    {isCopied ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {showVisibilityToggle && (
                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="visibility">Visibilidade do arquivo</Label>
                    <p className="text-xs text-muted-foreground">
                      Arquivos públicos podem ser acessados por qualquer pessoa com o link
                    </p>
                  </div>
                  <Switch
                    id="visibility"
                    checked={selectedFile.isPublic}
                    onCheckedChange={handleVisibilityChange}
                  />
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className={cn("gap-2 sm:gap-0", showDeleteOption && "justify-between")}>
            <div className="flex gap-2">
              <Button onClick={() => viewOnIPFS(selectedFile?.ipfsHash || '')}>
                <DownloadCloud className="h-4 w-4 mr-2" />
                Ver no IPFS
              </Button>
            </div>
            
            {showDeleteOption && (
              <Button variant="destructive" onClick={confirmDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de confirmação de exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este arquivo? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {selectedFile && (
            <div className="bg-destructive/10 p-3 rounded-md text-sm">
              <p className="font-medium">{selectedFile.fileName}</p>
              <p className="text-muted-foreground">
                {formatFileSize(selectedFile.fileSize)} • {formatDate(selectedFile.dateUploaded.toString())}
              </p>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
