import { createContext, useContext, useState, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

// Tipo de usuário
interface User {
  id: number;
  username: string;
  publicKey?: string;
  avatarUrl?: string;
}

// Tipo do contexto
interface UserContextType {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  createUserAccount: (username: string, password: string) => Promise<User>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Criação do contexto
const UserContext = createContext<UserContextType | undefined>(undefined);

// Hook personalizado para usar o contexto
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser deve ser usado dentro de um UserContextProvider");
  }
  return context;
}

// Provedor do contexto
export function UserContextProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Simular criação de conta
  const createUserAccount = async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar se o nome de usuário é válido
      if (username.length < 3) {
        throw new Error("Nome de usuário deve ter pelo menos 3 caracteres");
      }
      
      // Verificar se a senha é válida
      if (password.length < 6) {
        throw new Error("Senha deve ter pelo menos 6 caracteres");
      }
      
      // Simular criação de usuário
      const newUser: User = {
        id: Math.floor(Math.random() * 1000),
        username,
        publicKey: "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC" + Math.random().toString(36).substring(2, 15),
      };
      
      // Atualizar estado
      setCurrentUser(newUser);
      
      toast({
        title: "Conta criada",
        description: `Bem-vindo, ${username}!`,
      });
      
      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar conta";
      setError(errorMessage);
      
      toast({
        title: "Erro ao criar conta",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Simular login
  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Verificar credenciais (para demonstração)
      // Em uma aplicação real, isso seria feito no servidor
      if (username === "demo" && password === "senha123") {
        // Login bem-sucedido
        const user: User = {
          id: 1,
          username: "demo",
          publicKey: "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCqGKukO1De7zhZj6+H0qtjTkVxwTCpvKe4eCZ0FPqri0cb2JZfXJ/DgYSF6vUpwmJG8wVQZKjeGcjDOL5UlsuusFncCzWBQ7RKNUSesmQRMSGkVb1/3j+skZ6UtW+5u09lHNsj6tQ51s1SPrCBkedbNf0Tp0GbMJDyR4e9T04ZZwIDAQAB",
        };
        
        setCurrentUser(user);
        
        toast({
          title: "Login bem-sucedido",
          description: `Bem-vindo de volta, ${username}!`,
        });
        
        return true;
      } else {
        // Login falhou
        throw new Error("Credenciais inválidas");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao fazer login";
      setError(errorMessage);
      
      toast({
        title: "Falha no login",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout
  const logout = () => {
    setCurrentUser(null);
    
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta com sucesso",
    });
  };
  
  // Valor do contexto
  const value = {
    currentUser,
    isLoading,
    error,
    createUserAccount,
    login,
    logout,
    isAuthenticated: currentUser !== null,
  };
  
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}