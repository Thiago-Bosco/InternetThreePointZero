import { useUser } from '@/context/UserContext';
import IdentityManager from '@/components/Identity/IdentityManager';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle, KeyRound, ShieldCheck, UserCircle } from 'lucide-react';

// Schema para validação de formulário
const userFormSchema = z.object({
  username: z.string().min(3, {
    message: "Nome de usuário deve ter pelo menos 3 caracteres",
  }),
  password: z.string().min(6, {
    message: "Senha deve ter pelo menos 6 caracteres",
  }),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function Identity() {
  const { isAuthenticated, isLoading, currentUser, createUserAccount, login } = useUser();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const { toast } = useToast();

  // Formulário de login
  const loginForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  // Formulário de registro
  const registerForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const handleLogin = async (data: UserFormValues) => {
    setAuthLoading(true);
    try {
      const success = await login(data.username, data.password);
      if (success) {
        setIsLoginOpen(false);
        toast({
          title: "Login realizado com sucesso",
          description: `Bem-vindo de volta, ${data.username}!`,
        });
      } else {
        throw new Error("Falha no login. Verifique suas credenciais.");
      }
    } catch (error: any) {
      toast({
        title: "Erro de autenticação",
        description: error.message || "Falha ao fazer login",
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (data: UserFormValues) => {
    setAuthLoading(true);
    try {
      const user = await createUserAccount(data.username, data.password);
      setIsRegisterOpen(false);
      toast({
        title: "Conta criada com sucesso",
        description: `Bem-vindo à Internet 3.0, ${user.username}!`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Falha ao registrar nova conta",
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Identidade</h1>
      <p className="text-muted-foreground">
        Gerencie sua identidade criptográfica na rede descentralizada
      </p>
      
      {isLoading ? (
        <div className="p-12 flex justify-center">
          <p>Carregando...</p>
        </div>
      ) : isAuthenticated && currentUser ? (
        <IdentityManager user={currentUser} />
      ) : (
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Não autenticado</AlertTitle>
            <AlertDescription>
              Você precisa estar conectado para gerenciar sua identidade na rede
            </AlertDescription>
          </Alert>
          
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5" />
                  Identidade Digital
                </CardTitle>
                <CardDescription>
                  Sua presença na rede descentralizada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Sua identidade digital é a base de todas as suas interações na rede descentralizada,
                  permitindo que você seja reconhecido e estabeleça conexões seguras.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5" />
                  Par de Chaves
                </CardTitle>
                <CardDescription>
                  Segurança criptográfica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Ao criar uma conta, geramos automaticamente um par de chaves criptográficas para você.
                  A chave pública identifica você na rede, enquanto a chave privada permanece segura.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Propriedade dos Dados
                </CardTitle>
                <CardDescription>
                  Você controla seus dados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Com sua identidade criptográfica, você pode comprovar a propriedade do seu conteúdo,
                  assinar mensagens e compartilhar arquivos com segurança na rede descentralizada.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={() => setIsLoginOpen(true)}>Entrar</Button>
            <Button variant="outline" onClick={() => setIsRegisterOpen(true)}>Criar Conta</Button>
          </div>
        </div>
      )}
      
      {/* Modais de autenticação */}
      
      {/* Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
            <DialogDescription>
              Entre com sua conta para acessar todos os recursos
            </DialogDescription>
          </DialogHeader>
          
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome de usuário</FormLabel>
                    <FormControl>
                      <Input placeholder="seunome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={authLoading}>
                  {authLoading ? "Entrando..." : "Entrar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Register Dialog */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Conta</DialogTitle>
            <DialogDescription>
              Crie sua identidade na rede descentralizada
            </DialogDescription>
          </DialogHeader>
          
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <FormField
                control={registerForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome de usuário</FormLabel>
                    <FormControl>
                      <Input placeholder="seunome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={authLoading}>
                  {authLoading ? "Criando conta..." : "Criar conta"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
