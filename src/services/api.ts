import { ApiError } from "./apiError";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL is not defined");
}

type RequestOptions = RequestInit;

async function parseResponseBody(response: Response) {
  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return null;
  }

  return response.json();
}

function serializeBody(body: unknown) {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (body instanceof FormData) {
    return body;
  }

  return JSON.stringify(body);
}

async function request<TResponse>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { headers, ...fetchOptions } = options;
  const isFormData = fetchOptions.body instanceof FormData;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
  });

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const data = await parseResponseBody(response);

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : "Erro ao comunicar com a API";

    throw new ApiError(message, response.status, data);
  }

  return data as TResponse;
}

export const api = {
  get<TResponse>(endpoint: string, options?: RequestOptions) {
    return request<TResponse>(endpoint, {
      ...options,
      method: "GET",
    });
  },

  post<TResponse, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: RequestOptions,
  ) {
    return request<TResponse>(endpoint, {
      ...options,
      method: "POST",
      body: serializeBody(body),
    });
  },

  put<TResponse, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: RequestOptions,
  ) {
    return request<TResponse>(endpoint, {
      ...options,
      method: "PUT",
      body: serializeBody(body),
    });
  },

  patch<TResponse, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: RequestOptions,
  ) {
    return request<TResponse>(endpoint, {
      ...options,
      method: "PATCH",
      body: serializeBody(body),
    });
  },

  delete<TResponse>(endpoint: string, options?: RequestOptions) {
    return request<TResponse>(endpoint, {
      ...options,
      method: "DELETE",
    });
  },
};
