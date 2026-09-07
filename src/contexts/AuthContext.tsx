import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { apiPrivate, apiPublic } from "@/lib/axios";

/**
 * creatContext: Conteiner de contexto.
 *
 * useCallBack: Memoriza funções para evitar que sejam recriadas.
 *
 * useContext: Permite qua um componente consuma o contexto.
 *
 * useEffect: Dispara efeitos colaterais (carregar dados para montar componente).
 *
 * useState: Gerencia estado local (user, loading, isAuthenticated).
 *
 * ReactNode: Tipo que representa qualquer conteudo renderizável (filhos do provider).
 */

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  academy?: { name: string };
}

// Estrutura do objeto contexto
interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  /**
   * user: guarda os dados do usuário logado ou null.
   * isAuthenticated: flag booleana que indica se há sessão ativa.
   * loading: começa como true e só vai para false após verificar token no localStorage. Evita que a tela de login pisque antes da verificação.
   */

  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Na montagem, tenta restaurar a sessão só com o cookie (o /auth/me usa o access).
  // Se o access expirou mas o refresh vive, o interceptor renova e o /auth/me passa.
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await apiPrivate.get<User>("/auth/me");
        setUser(data);
        setIsAuthenticated(true);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    // O servidor grava os cookies; aqui só guardamos o user retornado
    const { data } = await apiPublic.post<{ user: User }>("/auth/login", {
      email,
      password,
    });
    setUser(data.user);
    setIsAuthenticated(true);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiPublic.post("/auth/logout"); //apaga a sessão no banco + limpa cookies
    } catch {
      // best-effort: mesmo que falhe, limpamos o estado local
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }, []);

  // Disponibilizando os valores e funções para todos os componentes filhos. Value é o objeto que qualquer consumidor
  // do contexto receberá ao chamar useAuth()
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Encapsula o acesso ao contexto, se algum componente tentar usar useAuth sem estar dentro de AuthProvider,
 * o erro será lançado com uma mensagem clara.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
