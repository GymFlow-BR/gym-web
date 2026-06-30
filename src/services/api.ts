const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  throw new Error('VITE_API_URL is not defined')
}

type RequestOptions = RequestInit & {
  auth?: boolean
}

async function request<TResponse>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { auth: _auth, headers, ...fetchOptions } = options

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })

  if (!response.ok) {
    throw new Error('Erro ao comunicar com a API')
  }

  if (response.status === 204) {
    return undefined as TResponse
  }

  return response.json() as Promise<TResponse>
}

export const api = {
  get<TResponse>(endpoint: string, options?: RequestOptions) {
    return request<TResponse>(endpoint, {
      ...options,
      method: 'GET',
    })
  },

  post<TResponse, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: RequestOptions,
  ) {
    return request<TResponse>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  },

  put<TResponse, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: RequestOptions,
  ) {
    return request<TResponse>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  },

  patch<TResponse, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: RequestOptions,
  ) {
    return request<TResponse>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  },

  delete<TResponse>(endpoint: string, options?: RequestOptions) {
    return request<TResponse>(endpoint, {
      ...options,
      method: 'DELETE',
    })
  },
}