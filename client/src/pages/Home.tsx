import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BrowserInterface from '@/components/Browser/BrowserInterface';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

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

export default function Home() {
  const { isAuthenticated, isLoading, createUserAccount, login } = useUser();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const { toast } = useToast();

  // Verificar se é o primeiro acesso
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem('internet3_hasVisited');
    if (!hasVisited) {
      setIsFirstVisit(true);
      localStorage.setItem('internet3_hasVisited', 'true');
    }
  }, []);

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
      {/* Introdução para primeiro acesso */}
      {isFirstVisit && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>Bem-vindo à Internet 3.0</CardTitle>
            <CardDescription>
              Uma nova forma descentralizada de navegar, compartilhar e se comunicar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                Este navegador descentralizado usa tecnologias como IPFS e WebRTC para criar uma 
                rede verdadeiramente P2P, onde você controla seus dados.
              </p>
              <p className="text-sm text-muted-foreground">
                Para começar, crie uma conta para gerar seu par de chaves criptográficas e começar a usar todas as funcionalidades.
              </p>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => setIsRegisterOpen(true)}>Criar Conta</Button>
                <Button variant="outline" onClick={() => setIsFirstVisit(false)}>Continuar sem conta</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navegador */}
      <Card>
        <CardHeader>
          <CardTitle>Navegador Descentralizado</CardTitle>
          <CardDescription>
            Navegue na web descentralizada usando IPFS
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <BrowserInterface />
        </CardContent>
      </Card>

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
      
      {/* Botão de ação para usuários não autenticados */}
      {!isLoading && !isAuthenticated && !isFirstVisit && (
        <div className="flex justify-center gap-4 py-6">
          <Button onClick={() => setIsLoginOpen(true)}>Entrar</Button>
          <Button variant="outline" onClick={() => setIsRegisterOpen(true)}>Criar Conta</Button>
        </div>
      )}
    </div>
  );
}
