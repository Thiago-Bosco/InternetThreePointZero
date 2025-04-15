import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

export default function FileUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; hash?: string; error?: string } | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };
  
  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };
  
  const handleFileSelection = (file: File) => {
    // Resetar estados anteriores
    setUploadProgress(0);
    setUploadResult(null);
    setSelectedFile(file);
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simular progresso de upload
      const simulateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 15;
          if (progress > 100) progress = 100;
          
          setUploadProgress(Math.floor(progress));
          
          if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
              // Simular conclusão de upload
              setUploadResult({
                success: true,
                hash: 'QmVp7hzBUeV4KrsMfYqkLRZJQYEKZ6Kdv8vmQ6kD24o7Qy'
              });
              
              toast({
                title: 'Upload concluído com sucesso',
                description: `Arquivo ${selectedFile.name} adicionado à rede IPFS`,
              });
              
              setIsUploading(false);
            }, 500);
          }
        }, 300);
      };
      
      // Simular verificação e início de upload
      setTimeout(() => {
        simulateProgress();
      }, 500);
      
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      
      setUploadResult({
        success: false,
        error: 'Falha ao fazer upload do arquivo. Tente novamente mais tarde.'
      });
      
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível fazer o upload do arquivo',
        variant: 'destructive'
      });
      
      setIsUploading(false);
    }
  };
  
  const clearSelection = () => {
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload de Arquivo</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {selectedFile ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <span className="font-medium truncate max-w-xs">{selectedFile.name}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSelection();
                  }}
                >
                  <X size={16} />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
              
              {isUploading && (
                <div className="mt-4 space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    Fazendo upload... {uploadProgress}%
                  </p>
                </div>
              )}
              
              {uploadResult && (
                <div className={`mt-4 p-3 rounded text-sm ${
                  uploadResult.success 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  <div className="flex items-center">
                    {uploadResult.success ? (
                      <>
                        <CheckCircle size={16} className="mr-2 flex-shrink-0" />
                        <div>
                          <p>Upload concluído com sucesso</p>
                          <p className="font-mono text-xs mt-1">
                            Hash IPFS: {uploadResult.hash}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                        <div>
                          <p>Falha no upload</p>
                          <p className="text-xs mt-1">{uploadResult.error}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 cursor-pointer">
              <div className="flex justify-center">
                <Upload className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">
                Arraste e solte um arquivo ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground">
                Suporta qualquer tipo de arquivo até 50MB
              </p>
            </div>
          )}
          
          <Input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileInputChange}
            disabled={isUploading}
          />
        </div>
        
        <div className="mt-4 flex items-center space-x-2">
          <Switch 
            id="public" 
            checked={isPublic} 
            onCheckedChange={setIsPublic}
            disabled={isUploading} 
          />
          <Label htmlFor="public">Tornar arquivo público</Label>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleUpload} 
          disabled={!selectedFile || isUploading || !!uploadResult?.success}
          className="w-full"
        >
          {isUploading ? 'Enviando...' : 'Fazer upload para IPFS'}
        </Button>
      </CardFooter>
    </Card>
  );
}