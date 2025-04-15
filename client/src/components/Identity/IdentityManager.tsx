import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Shield, 
  Key, 
  Copy, 
  RefreshCw, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

interface UserIdentity {
  id: number;
  username: string;
  publicKey: string;
  privateKey: string;
  avatarUrl?: string;
  createdAt: Date;
}

interface IdentityManagerProps {
  user?: UserIdentity;
}

export default function IdentityManager() {
  const { isAuthenticated, currentUser } = useUser();
  const [identity, setIdentity] = useState<UserIdentity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Carregar identidade (simulação)
  useEffect(() => {
    if (!isAuthenticated) {
      setIdentity(null);
      return;
    }
    
    const loadIdentity = async () => {
      setIsLoading(true);
      
      try {
        // Simular carregamento
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados simulados para demonstração
        const mockIdentity: UserIdentity = {
          id: 1,
          username: currentUser?.username || 'usuario',
          publicKey: 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCqGKukO1De7zhZj6+H0qtjTkVxwTCpvKe4eCZ0FPqri0cb2JZfXJ/DgYSF6vUpwmJG8wVQZKjeGcjDOL5UlsuusFncCzWBQ7RKNUSesmQRMSGkVb1/3j+skZ6UtW+5u09lHNsj6tQ51s1SPrCBkedbNf0Tp0GbMJDyR4e9T04ZZwIDAQAB',
          privateKey: 'MIICXAIBAAKBgQCqGKukO1De7zhZj6+H0qtjTkVxwTCpvKe4eCZ0FPqri0cb2JZfXJ/DgYSF6vUpwmJG8wVQZKjeGcjDOL5UlsuusFncCzWBQ7RKNUSesmQRMSGkVb1/3j+skZ6UtW+5u09lHNsj6tQ51s1SPrCBkedbNf0Tp0GbMJDyR4e9T04ZZwIDAQABAoGAFijko56+qGyN8M0RVyaRAXz++xTqHBLh3tx4VgMtrQ+WEgCjhoTwo23KMBAuJGSYnRmoBZM3lMfTKevIkAidPExvYCdm5dYq3XToLkkLv5L2pIIVOFMDG+KESnAFV7l2c+cnzRMW0+b6f8mR1CJzZuxVLL6Q02fvLi55/mbSYxECQQDeAw6fiIQXGukBI4eMZZt4nscy2o12KyYner3VpoeE+Np2q+Z3pvAMd/aNzQ/W9WaI+NRfcxUJrmfPwIGm63ilAkEAxCL5HQb2bQr4iBFd0Aep28TiEYGdjEQKD7h3piwvbzPAs9HDhrESGV/Lbjg3FQwiXNhYxjsTcfhBHbRMBitNbwJAZZ2XIpsitLyPpuiMOvBbzPavd4gY6Z8KWrfYzJoI/Q9FuUo63+/L3ZOgXwCY0+IXAHvCS6hCrxT4v0kd/DZPDQJBAL4t/eFs/vOnhzWDXF+JwQeJ4L1OwGWXdSAwr1UpnHnbZG4DuQaIy7cp3BwR8L5rjGPwUCnUQABYIayo8MiKIG0CQFjl2VFmgFSm3C8ihs9CoWsHlsMUKcEpS1C+wH5MrPrXmQcDM+Ys3p2GP1s8Wc0mE8EsqOi8ivk4WNxCbhfPQMM=',
          createdAt: new Date()
        };
        
        setIdentity(mockIdentity);
      } catch (error) {
        console.error('Erro ao carregar identidade:', error);
        toast({
          title: 'Erro ao carregar identidade',
          description: 'Não foi possível recuperar os dados de identidade',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadIdentity();
  }, [isAuthenticated, currentUser, toast]);
  
  // Gerar novo par de chaves
  const handleGenerateNewKeyPair = async () => {
    setIsGenerating(true);
    
    try {
      // Simular geração de chaves
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulação de novas chaves
      const newPublicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC7JLzV' + Math.random().toString(36).substring(2, 10);
      const newPrivateKey = 'MIICXAIBAAKBgQC7JLzVoP' + Math.random().toString(36).substring(2, 18);
      
      if (identity) {
        setIdentity({
          ...identity,
          publicKey: newPublicKey,
          privateKey: newPrivateKey
        });
      }
      
      setSuccessMessage('Novo par de chaves gerado com sucesso!');
      setTimeout(() => setSuccessMessage(null), 5000);
      
      toast({
        title: 'Chaves geradas',
        description: 'Novo par de chaves criptográficas gerado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao gerar chaves:', error);
      setError('Não foi possível gerar um novo par de chaves');
      setTimeout(() => setError(null), 5000);
      
      toast({
        title: 'Erro ao gerar chaves',
        description: 'Não foi possível gerar um novo par de chaves',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Copiar chave para a área de transferência
  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    
    toast({
      title: 'Copiado',
      description: description,
    });
  };
  
  // Simular login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular envio e validação de credenciais
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular falha
      if (loginForm.username !== 'demo' || loginForm.password !== 'senha123') {
        throw new Error('Credenciais inválidas');
      }
      
      // Seria substituído por uma chamada real à API
      toast({
        title: 'Login bem-sucedido',
        description: 'Você foi autenticado com sucesso',
      });
      
      // Limpar formulário
      setLoginForm({ username: '', password: '' });
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Nome de usuário ou senha incorretos');
      
      toast({
        title: 'Falha no login',
        description: 'Credenciais inválidas',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Simular registro
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Validar formulário
      if (registerForm.password !== registerForm.confirmPassword) {
        throw new Error('As senhas não coincidem');
      }
      
      if (registerForm.password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }
      
      // Simular envio e criação de conta
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Seria substituído por uma chamada real à API
      toast({
        title: 'Conta criada',
        description: 'Sua conta foi criada com sucesso',
      });
      
      // Limpar formulário
      setRegisterForm({ username: '', password: '', confirmPassword: '' });
      setSuccessMessage('Conta criada com sucesso! Agora você pode fazer login.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error('Erro no registro:', error);
      setError(error instanceof Error ? error.message : 'Erro ao criar conta');
      
      toast({
        title: 'Falha no registro',
        description: error instanceof Error ? error.message : 'Erro ao criar conta',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Renderizar formulário de login/registro
  const renderAuthForms = () => {
    return (
      <Tabs defaultValue="login" className="w-full max-w-md mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Registrar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Entrar na Rede</CardTitle>
              <CardDescription className="text-center">
                Faça login para acessar sua identidade
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {successMessage && (
                  <Alert className="border-green-500 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Sucesso</AlertTitle>
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="username">Nome de Usuário</Label>
                  <Input 
                    id="username" 
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input 
                    id="password" 
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                </div>
              </CardContent>
              
              <CardFooter>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Autenticando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </CardFooter>
            </form>
            
            <div className="p-6 pt-0 text-center text-sm text-muted-foreground">
              <p>Use as credenciais de demonstração:</p>
              <p className="font-medium">Usuário: demo / Senha: senha123</p>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Criar Nova Conta</CardTitle>
              <CardDescription className="text-center">
                Registre-se para obter sua identidade na rede descentralizada
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {successMessage && (
                  <Alert className="border-green-500 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Sucesso</AlertTitle>
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="reg-username">Nome de Usuário</Label>
                  <Input 
                    id="reg-username" 
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Senha</Label>
                  <Input 
                    id="reg-password" 
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Mínimo de 6 caracteres
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reg-confirm-password">Confirmar Senha</Label>
                  <Input 
                    id="reg-confirm-password" 
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </CardContent>
              
              <CardFooter>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    'Criar Conta'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    );
  };
  
  // Renderizar perfil e identidade
  const renderIdentityProfile = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando identidade...</p>
          </div>
        </div>
      );
    }
    
    if (!identity) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Nenhuma identidade encontrada
          </p>
          <Button>Criar Nova Identidade</Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {/* Perfil e informações básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Perfil de Identidade</CardTitle>
            <CardDescription>
              Sua identidade na rede descentralizada
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <Avatar className="h-24 w-24">
                <AvatarImage src={identity.avatarUrl} alt={identity.username} />
                <AvatarFallback className="text-2xl">
                  {identity.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-medium">{identity.username}</h3>
                  <p className="text-sm text-muted-foreground">
                    Membro desde {identity.createdAt.toLocaleDateString()}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="public-key">Chave Pública</Label>
                  <div className="relative">
                    <Textarea
                      id="public-key"
                      value={identity.publicKey}
                      readOnly
                      className="pr-10 font-mono text-xs resize-none"
                      rows={2}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1.5 right-1.5 h-7 w-7"
                      onClick={() => copyToClipboard(identity.publicKey, 'Chave pública copiada')}
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="private-key">Chave Privada (Confidencial)</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                    >
                      {showPrivateKey ? (
                        <>
                          <EyeOff size={14} className="mr-1" />
                          <span>Ocultar</span>
                        </>
                      ) : (
                        <>
                          <Eye size={14} className="mr-1" />
                          <span>Mostrar</span>
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <Textarea
                      id="private-key"
                      value={showPrivateKey ? identity.privateKey : '••••••••••••••••••••••••••••••••••••••••••••••••••'}
                      readOnly
                      className="pr-10 font-mono text-xs resize-none"
                      rows={2}
                    />
                    {showPrivateKey && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1.5 right-1.5 h-7 w-7"
                        onClick={() => copyToClipboard(identity.privateKey, 'Chave privada copiada')}
                      >
                        <Copy size={14} />
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    <Shield size={12} className="inline mr-1" />
                    Nunca compartilhe sua chave privada com ninguém
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Gerenciamento de chaves */}
        <Card>
          <CardHeader>
            <CardTitle>Gerenciamento de Chaves</CardTitle>
            <CardDescription>
              Gerencie suas chaves criptográficas para acesso à rede
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {successMessage && (
              <Alert className="border-green-500 text-green-600 dark:text-green-400 mb-4">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Sucesso</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex flex-col md:flex-row gap-4">
              <Button className="gap-2" onClick={handleGenerateNewKeyPair} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Key size={16} />
                    <span>Gerar Novo Par de Chaves</span>
                  </>
                )}
              </Button>
              
              <Button variant="outline" className="gap-2">
                <Shield size={16} />
                <span>Fazer Backup das Chaves</span>
              </Button>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col text-sm border-t p-4">
            <p className="text-muted-foreground mb-1">
              <strong>Importante:</strong> Gerar um novo par de chaves substitui permanentemente suas chaves atuais.
            </p>
            <p className="text-muted-foreground">
              Certifique-se de fazer um backup de suas chaves privadas antes de gerar novas.
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Gerenciador de Identidade</CardTitle>
        <CardDescription>
          Gerencie sua identidade e chaves criptográficas na rede descentralizada
        </CardDescription>
      </CardHeader>
      
      <CardContent className="h-[calc(100%-85px)] overflow-auto">
        {isAuthenticated ? renderIdentityProfile() : renderAuthForms()}
      </CardContent>
    </Card>
  );
}