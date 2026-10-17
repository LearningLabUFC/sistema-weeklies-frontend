import axios, { type AxiosError } from 'axios';

export interface ValidationErrorItem {
  loc?: (string | number)[];
  msg?: string;
  type?: string;
}

export interface ApiErrorDetail {
  status?: number;
  message: string;
  validationErrors?: Record<string, string[]>;
  isNetworkError: boolean;
  isAuthError: boolean;
  isForbidden: boolean;
  isNotFound: boolean;
  isConflict: boolean;
  isValidationError: boolean;
  isBadRequest: boolean;
  raw?: unknown;
}

/**
 * Traduz e normaliza erros retornados pela API (FastAPI) ou falhas de rede.
 * Trata respostas com 'detail' (string ou array de validação 422), 'mensagem' e 'message'.
 */
export function parseApiError(error: unknown): ApiErrorDetail {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<{
      detail?: string | ValidationErrorItem[];
      mensagem?: string;
      message?: string;
    }>;

    const status = axiosErr.response?.status;
    const data = axiosErr.response?.data;

    // Erro de rede ou sem resposta do servidor
    if (!axiosErr.response) {
      return {
        message:
          'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
        isNetworkError: true,
        isAuthError: false,
        isForbidden: false,
        isNotFound: false,
        isConflict: false,
        isValidationError: false,
        isBadRequest: false,
        raw: error,
      };
    }

    let message = '';
    const validationErrors: Record<string, string[]> = {};

    // 1. Array de validação do Pydantic (status 422)
    if (Array.isArray(data?.detail)) {
      const messages: string[] = [];
      data.detail.forEach(item => {
        const fieldName = item.loc
          ? item.loc.slice(1).join('.') || 'campo'
          : 'campo';
        const msg = item.msg || 'Valor inválido';
        if (!validationErrors[fieldName]) {
          validationErrors[fieldName] = [];
        }
        validationErrors[fieldName].push(msg);
        messages.push(`${fieldName}: ${msg}`);
      });
      message =
        messages.join('; ') || 'Dados inválidos enviados na requisição.';
    }
    // 2. Campo 'detail' como string
    else if (
      typeof data?.detail === 'string' &&
      data.detail.trim().length > 0
    ) {
      message = data.detail.trim();
    }
    // 3. Campo 'mensagem' (usado em respostas de sucesso/erro padrão)
    else if (
      typeof data?.mensagem === 'string' &&
      data.mensagem.trim().length > 0
    ) {
      message = data.mensagem.trim();
    }
    // 4. Campo 'message' genérico
    else if (
      typeof data?.message === 'string' &&
      data.message.trim().length > 0
    ) {
      message = data.message.trim();
    }

    // Se nenhuma mensagem foi encontrada no body, adota padrões por status code
    if (!message) {
      switch (status) {
        case 400:
          message = 'Requisição inválida. Verifique os dados informados.';
          break;
        case 401:
          message = 'Sessão expirada ou não autenticado. Faça login novamente.';
          break;
        case 403:
          message =
            'Acesso negado: você não tem permissão para realizar esta ação.';
          break;
        case 404:
          message = 'O recurso solicitado não foi encontrado.';
          break;
        case 409:
          message =
            'Conflito com o estado atual do recurso. Operação não realizada.';
          break;
        case 422:
          message = 'Erro de validação nos dados fornecidos.';
          break;
        case 500:
        default:
          message = 'Ocorreu um erro no servidor. Tente novamente mais tarde.';
          break;
      }
    }

    return {
      status,
      message,
      validationErrors:
        Object.keys(validationErrors).length > 0 ? validationErrors : undefined,
      isNetworkError: false,
      isAuthError: status === 401,
      isForbidden: status === 403,
      isNotFound: status === 404,
      isConflict: status === 409,
      isValidationError: status === 422,
      isBadRequest: status === 400,
      raw: data,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message || 'Ocorreu um erro inesperado.',
      isNetworkError: false,
      isAuthError: false,
      isForbidden: false,
      isNotFound: false,
      isConflict: false,
      isValidationError: false,
      isBadRequest: false,
      raw: error,
    };
  }

  return {
    message: 'Ocorreu um erro inesperado. Tente novamente.',
    isNetworkError: false,
    isAuthError: false,
    isForbidden: false,
    isNotFound: false,
    isConflict: false,
    isValidationError: false,
    isBadRequest: false,
    raw: error,
  };
}
