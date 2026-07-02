import { ApiError } from './apiError'

const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  throw new Error('VITE_API_URL is not defined')
}

type RequestOptions = RequestInit

async function parseResponseBody(response: Response) {
  const contentType = response.headers.get('content-type')

  if (!contentType?.includes('application/json')) {
    return null
  }

  return response.json()
}

async function request<TResponse>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { headers, ...fetchOptions } = options

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })

  if (response.status === 204) {
    return undefined as TResponse
  }

  const data = await parseResponseBody(response)

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof data.message === 'string'
        ? data.message
        : 'Erro ao comunicar com a API'

    throw new ApiError(message, response.status, data)
  }

  return data as TResponse
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