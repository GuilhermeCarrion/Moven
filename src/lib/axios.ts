import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "/api";
/*
 * AxiosInstance - Instancia de configuração fixa personalizada.
 *
 * InternalAxiosRequestConfig - Configuração interna da requisição, garante que o 'header' exista antes de disparar requisição.
 *
 * AxiosRequest - Middleware de saída, envia o token junto com a requisição.
 *
 * AxiosResponse - Middleware de entrada, analisa o que o servidor respondeu antes de entregar o dado para o compente
 * e caso seja "401 - Não te conheço", limpa o sistema e joga para o login.
 *
 * withCredentials: o navegador envia/recebe os cookies httpOnly automaticamente.
 * Não há mais token no localStorage nem header Authorization manual.
 */

export const apiPublic: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

export const apiPrivate: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

/**
 * Refresh "single-flight": se vários requests derem 401 ao mesmo tempo (access
 * expirado), apenas UM /auth/refresh dispara. Os demais aguardam a mesma Promise.
 * Usa apiPublic de propósito, pra não reentrar neste inteceptor.
 */

let refreshPromise: Promise<void> | null = null;

function runRefresh(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = apiPublic
      .post("/auth/refresh")
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiPrivate.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const url = original?.url || "";
    const is401 = error.response?.status === 401;

    // Endpoints que não devem tentar refresh (evita loop)
    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout");

    if (is401 && !isAuthEndpoint && original && !original._retry) {
      original._retry = true; // marca pra tentar só uma vez
      try {
        await runRefresh(); // pega access novo(cookie atualizado pelo servidor)
        return apiPrivate(original); // repete a requisição original
      } catch {
        const publicPath = ["/", "/login"];
        if (
          typeof window !== "undefined" &&
          !publicPath.includes(window.location.pathname)
        ) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);
