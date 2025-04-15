import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useP2P } from '@/context/P2PContext';
import { useUser } from '@/context/UserContext';
import { File as FileType } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Upload, File, Link as LinkIcon, Copy, CheckCircle } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function FileUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<FileType | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useP2P();
  const { currentUser, isAuthenticated } = useUser();
  const { toast } = useToast();
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const handlePrivacyToggle = () => {
    setIsPublic(!isPublic);
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo para upload",
        variant: "destructive",
      });
      return;
    }
    
    if (!isAuthenticated || !currentUser) {
      toast({
        title: "Não autenticado",
        description: "É necessário estar conectado para fazer upload de arquivos",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Fazer upload do arquivo para IPFS
      const ipfsHash = await uploadFile(selectedFile);
      
      // Registrar o arquivo no servidor
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          ipfsHash,
          isPublic,
          mimeType: selectedFile.type
        }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao registrar arquivo');
      }
      
      const fileData = await response.json();
      setUploadedFile(fileData);
      setIsSuccessDialogOpen(true);
      
      // Resetar seleção de arquivo
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro ao fazer upload de arquivo:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload do arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((error) => {
        console.error('Erro ao copiar para a área de transferência:', error);
      });
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Upload de Arquivo</CardTitle>
          <CardDescription>
            Compartilhe arquivos na rede descentralizada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Arquivo</Label>
            <Input
              ref={fileInputRef}
              id="file"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            <div
              className={`
                border-2 border-dashed rounded-md p-8
                flex flex-col items-center justify-center
                cursor-pointer transition-colors
                ${selectedFile ? 'border-primary/50 bg-primary/5' : 'border-border'}
                hover:border-primary/50 hover:bg-primary/5
              `}
              onClick={handleFileSelect}
            >
              {selectedFile ? (
                <div className="text-center">
                  <File className="h-10 w-10 text-primary mx-auto mb-2" />
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="font-medium">Clique para selecionar um arquivo</p>
                  <p className="text-sm text-muted-foreground">
                    ou arraste e solte aqui
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="public" 
              checked={isPublic} 
              onCheckedChange={handlePrivacyToggle} 
            />
            <Label htmlFor="public">
              {isPublic ? 'Arquivo público' : 'Arquivo privado'}
            </Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}
            className="w-full"
          >
            {isUploading ? 'Enviando...' : 'Fazer Upload'}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Diálogo de sucesso */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Concluído</DialogTitle>
            <DialogDescription>
              Seu arquivo foi carregado com sucesso para a rede IPFS.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Arquivo</Label>
              <div className="text-sm font-medium">{uploadedFile?.fileName}</div>
            </div>
            
            <div className="space-y-2">
              <Label>Link IPFS</Label>
              <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                <code className="text-xs flex-1 font-mono truncate">
                  ipfs://{uploadedFile?.ipfsHash}
                </code>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0"
                  onClick={() => uploadedFile?.ipfsHash && copyToClipboard(`ipfs://${uploadedFile.ipfsHash}`)}
                >
                  {isCopied ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsSuccessDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
