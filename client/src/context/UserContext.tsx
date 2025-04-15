import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@shared/schema";
import { generateKeyPair, encryptPrivateKey, decryptPrivateKey } from "@/lib/crypto";

interface UserContextType {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  createUserAccount: (username: string, password: string) => Promise<User>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserContextProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Verificar se há um usuário armazenado localmente
    const checkUserAuth = async () => {
      try {
        const storedUser = localStorage.getItem("internet3_user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Erro ao verificar autenticação:", err);
        localStorage.removeItem("internet3_user");
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAuth();
  }, []);

  const createUserAccount = async (username: string, password: string): Promise<User> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Gerar par de chaves para o usuário
      const { publicKey, privateKey } = await generateKeyPair();
      
      // Criptografar chave privada com a senha do usuário
      const privateKeyEncrypted = await encryptPrivateKey(privateKey, password);
      
      // Criar usuário via API
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          publicKey,
          privateKeyEncrypted,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao criar conta");
      }
      
      const newUser = await response.json();
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      
      // Armazenar usuário localmente
      localStorage.setItem("internet3_user", JSON.stringify(newUser));
      
      return newUser;
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta de usuário");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Buscar usuário pelo nome de usuário
      const response = await fetch(`/api/users/by-username/${username}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Usuário não encontrado");
        }
        throw new Error("Erro ao fazer login");
      }
      
      const user = await response.json();
      
      // Tentar descriptografar a chave privada com a senha fornecida
      try {
        await decryptPrivateKey(user.privateKeyEncrypted, password);
        // Se não lançar erro, a senha está correta
        
        setCurrentUser(user);
        setIsAuthenticated(true);
        
        // Armazenar usuário localmente
        localStorage.setItem("internet3_user", JSON.stringify(user));
        
        return true;
      } catch (err) {
        throw new Error("Senha incorreta");
      }
    } catch (err: any) {
      setError(err.message || "Falha na autenticação");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("internet3_user");
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isLoading,
        error,
        createUserAccount,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser deve ser usado dentro de um UserContextProvider");
  }
  return context;
}
