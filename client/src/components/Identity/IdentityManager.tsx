import { useEffect, useState } from 'react';
import { User } from '@shared/schema';
import { decryptPrivateKey } from '@/lib/crypto';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, CheckCircle, KeyRound, User as UserIcon, Shield, Key, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface IdentityManagerProps {
  user: User;
}

export default function IdentityManager({ user }: IdentityManagerProps) {
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [password, setPassword] = useState('');
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isCopiedPublic, setIsCopiedPublic] = useState(false);
  const [isCopiedPrivate, setIsCopiedPrivate] = useState(false);
  const { toast } = useToast();
  
  // Resetar estado do privateKey quando o usuário mudar
  useEffect(() => {
    setPrivateKey(null);
  }, [user]);
  
  const handleRevealPrivateKey = async () => {
    if (!password) {
      toast({
        title: "Senha necessária",
        description: "Por favor, insira sua senha para revelar sua chave privada",
        variant: "destructive",
      });
      return;
    }
    
    setIsDecrypting(true);
    
    try {
      const decryptedKey = await decryptPrivateKey(user.privateKeyEncrypted, password);
      setPrivateKey(decryptedKey);
      setIsPasswordDialogOpen(false);
      
      toast({
        title: "Chave revelada",
        description: "Sua chave privada foi descriptografada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao revelar chave privada:', error);
      toast({
        title: "Senha incorreta",
        description: "Não foi possível descriptografar a chave privada. Verifique sua senha.",
        variant: "destructive",
      });
    } finally {
      setIsDecrypting(false);
      setPassword('');
    }
  };
  
  const copyToClipboard = (text: string, isPrivate: boolean) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        if (isPrivate) {
          setIsCopiedPrivate(true);
          setTimeout(() => setIsCopiedPrivate(false), 2000);
        } else {
          setIsCopiedPublic(true);
          setTimeout(() => setIsCopiedPublic(false), 2000);
        }
        
        toast({
          title: "Copiado!",
          description: `${isPrivate ? 'Chave privada' : 'Chave pública'} copiada para a área de transferência`,
        });
      })
      .catch((error) => {
        console.error('Erro ao copiar para a área de transferência:', error);
        toast({
          title: "Erro",
          description: "Não foi possível copiar para a área de transferência",
          variant: "destructive",
        });
      });
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="keys">Chaves</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>
        
        {/* Aba Geral */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" /> 
                Informações do Usuário
              </CardTitle>
              <CardDescription>
                Seus dados básicos na rede descentralizada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>ID do Usuário</Label>
                <div className="flex gap-2">
                  <Input value={user.id.toString()} readOnly className="bg-muted" />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(user.id.toString(), false)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Este é seu identificador único na rede. Compartilhe-o com outros usuários para permitir que eles encontrem seu feed.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Nome de Usuário</Label>
                <Input value={user.username} readOnly className="bg-muted" />
                <p className="text-xs text-muted-foreground">
                  Seu nome de usuário é único na rede e usado para identificá-lo.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Data de Criação</Label>
                <Input 
                  value={new Date(user.createdAt).toLocaleString('pt-BR')} 
                  readOnly 
                  className="bg-muted" 
                />
                <p className="text-xs text-muted-foreground">
                  Data e hora em que sua conta foi criada.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba Chaves */}
        <TabsContent value="keys">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" /> 
                Chaves Criptográficas
              </CardTitle>
              <CardDescription>
                Suas chaves para autenticação e criptografia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Chave Pública
                </Label>
                <Textarea 
                  value={user.publicKey} 
                  readOnly 
                  className="font-mono text-xs bg-muted h-32"
                />
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(user.publicKey, false)}
                  >
                    {isCopiedPublic ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Sua chave pública pode ser compartilhada com segurança. Ela permite que outros usuários 
                  verifiquem sua identidade e enviem mensagens criptografadas para você.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Chave Privada
                </Label>
                
                {privateKey ? (
                  <>
                    <Alert variant="destructive" className="mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Mantenha em segurança!</AlertTitle>
                      <AlertDescription>
                        Nunca compartilhe sua chave privada com ninguém. Ela concede acesso total à sua identidade.
                      </AlertDescription>
                    </Alert>
                    
                    <Textarea 
                      value={privateKey} 
                      readOnly 
                      className="font-mono text-xs bg-muted h-32"
                    />
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(privateKey, true)}
                      >
                        {isCopiedPrivate ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-muted h-32 rounded-md flex items-center justify-center">
                      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <KeyRound className="h-4 w-4 mr-2" />
                            Revelar Chave Privada
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirmar Senha</DialogTitle>
                            <DialogDescription>
                              Digite sua senha para revelar sua chave privada
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="password">Senha</Label>
                              <Input
                                id="password"
                                type="password"
                                placeholder="Digite sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                              />
                            </div>
                            
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>Aviso de segurança</AlertTitle>
                              <AlertDescription>
                                Nunca revele sua chave privada em ambientes públicos ou não confiáveis.
                              </AlertDescription>
                            </Alert>
                          </div>
                          
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => setIsPasswordDialogOpen(false)}
                            >
                              Cancelar
                            </Button>
                            <Button 
                              onClick={handleRevealPrivateKey}
                              disabled={isDecrypting || !password}
                            >
                              {isDecrypting ? 'Descriptografando...' : 'Revelar Chave'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-2">
                      Sua chave privada está protegida por criptografia. Ela é necessária para assinar 
                      mensagens e provar sua identidade na rede.
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba Segurança */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" /> 
                Segurança
              </CardTitle>
              <CardDescription>
                Informações e dicas de segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Mantenha sua chave privada segura</AlertTitle>
                <AlertDescription>
                  Sua chave privada é a base da sua identidade digital. Nunca compartilhe-a com ninguém 
                  e mantenha-a segura. Quem tiver acesso à sua chave privada pode se passar por você na rede.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Use senhas fortes</AlertTitle>
                <AlertDescription>
                  Sua senha é usada para proteger sua chave privada. Utilize senhas longas, com letras, 
                  números e símbolos para garantir máxima segurança.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Backup da chave privada</AlertTitle>
                <AlertDescription>
                  Considere fazer um backup da sua chave privada em um local seguro. Se você perder acesso 
                  à sua chave privada, não será possível recuperar sua identidade.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>
                <KeyRound className="h-4 w-4 mr-2" />
                Revelar Chave Privada
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
