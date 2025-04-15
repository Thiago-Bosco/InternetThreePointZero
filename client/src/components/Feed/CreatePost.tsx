import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Image, PaperclipIcon, SendHorizonal, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CreatePostProps {
  onCreatePost: (content: string, attachments: File[]) => Promise<void>;
}

export default function CreatePost({ onCreatePost }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Limitar o número de anexos
      if (attachments.length + e.target.files.length > 5) {
        toast({
          title: "Limite de anexos",
          description: "Você pode adicionar no máximo 5 anexos",
          variant: "destructive",
        });
        return;
      }
      
      // Adicionar arquivos selecionados aos anexos
      const newAttachments = [...attachments];
      for (let i = 0; i < e.target.files.length; i++) {
        // Verificar tamanho máximo (10MB)
        if (e.target.files[i].size > 10 * 1024 * 1024) {
          toast({
            title: "Arquivo muito grande",
            description: `O arquivo ${e.target.files[i].name} excede o limite de 10MB`,
            variant: "destructive",
          });
          continue;
        }
        
        newAttachments.push(e.target.files[i]);
      }
      
      setAttachments(newAttachments);
      
      // Limpar input para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async () => {
    if (!content.trim() && attachments.length === 0) {
      toast({
        title: "Post vazio",
        description: "Adicione algum conteúdo ou anexo para criar um post",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onCreatePost(content, attachments);
      
      // Limpar formulário após sucesso
      setContent('');
      setAttachments([]);
    } catch (error) {
      console.error('Erro ao criar post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Função para formatação do tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Criar Post</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="O que você está pensando?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] resize-none"
        />
        
        {/* Mostrar anexos */}
        {attachments.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium mb-2">Anexos:</p>
            <ScrollArea className="max-h-[150px]">
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between bg-muted/50 p-2 rounded-md"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Image className="h-4 w-4 text-primary" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      className="h-7 w-7 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
        
        {/* Input oculto para arquivos */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          onChange={handleFileChange}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAttachClick}
            disabled={isSubmitting}
          >
            <PaperclipIcon className="h-4 w-4 mr-1" />
            Anexar
          </Button>
          <Badge 
            variant="outline" 
            className="ml-2 bg-muted/50"
            invisible={attachments.length === 0}
          >
            {attachments.length}
          </Badge>
        </div>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || (!content.trim() && attachments.length === 0)}
        >
          {isSubmitting ? (
            'Publicando...'
          ) : (
            <>
              <SendHorizonal className="h-4 w-4 mr-2" />
              Publicar
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
