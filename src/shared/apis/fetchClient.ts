interface RequestConfig<D = unknown> {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: D;
  params?: Record<string, string>;
  timeout?: number;
}

interface FetchClientConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
  withCredentials?: boolean;
}

interface FetchResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

class FetchClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  private withCredentials: boolean;

  constructor(config: FetchClientConfig = {}) {
    this.baseURL = config.baseURL || "";
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.headers,
    };
    this.timeout = config.timeout || 10000;
    this.withCredentials = config.withCredentials || false;
  }

  private buildURL(url: string, params?: Record<string, string>): string {
    const fullURL = url.startsWith("http") ? url : `${this.baseURL}${url}`;

    if (!params) return fullURL;

    const urlObj = new URL(fullURL);
    Object.entries(params).forEach(([key, value]) => {
      urlObj.searchParams.append(key, value);
    });

    return urlObj.toString();
  }

  private async makeRequest<T = unknown, D = unknown>(
    url: string,
    config: RequestConfig<D> = {}
  ): Promise<FetchResponse<T>> {
    const {
      method = "GET",
      headers = {},
      body,
      params,
      timeout = this.timeout,
    } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const requestURL = this.buildURL(url, params);
      const requestHeaders = { ...this.defaultHeaders, ...headers };

      const requestInit: RequestInit = {
        method,
        headers: requestHeaders,
        signal: controller.signal,
        credentials: this.withCredentials ? "include" : "omit",
      };

      if (body && method !== "GET") {
        requestInit.body =
          typeof body === "string" ? body : JSON.stringify(body);
      }

      const response = await fetch(requestURL, requestInit);
      clearTimeout(timeoutId);

      let data: T;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = (await response.text()) as T;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      throw error;
    }
  }

  // Axios-like methods
  async get<T = unknown>(
    url: string,
    config?: Omit<RequestConfig, "method" | "body">
  ): Promise<FetchResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: "GET" });
  }

  async post<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: Omit<RequestConfig<D>, "method" | "body">
  ): Promise<FetchResponse<T>> {
    return this.makeRequest<T, D>(url, { ...config, method: "POST", body: data });
  }

  async put<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: Omit<RequestConfig<D>, "method" | "body">
  ): Promise<FetchResponse<T>> {
    return this.makeRequest<T, D>(url, { ...config, method: "PUT", body: data });
  }

  async patch<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: Omit<RequestConfig<D>, "method" | "body">
  ): Promise<FetchResponse<T>> {
    return this.makeRequest<T, D>(url, { ...config, method: "PATCH", body: data });
  }

  async delete<T = unknown>(
    url: string,
    config?: Omit<RequestConfig, "method" | "body">
  ): Promise<FetchResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: "DELETE" });
  }

  // Create new instance with custom config
  create(config: FetchClientConfig): FetchClient {
    return new FetchClient({
      baseURL: this.baseURL,
      headers: { ...this.defaultHeaders, ...config.headers },
      timeout: config.timeout || this.timeout,
      withCredentials: config.withCredentials ?? this.withCredentials,
      ...config,
    });
  }
}

// Default instance
const fetchClient = new FetchClient({
  withCredentials: true,
});

export default fetchClient;
export { FetchClient };
export type { FetchResponse, RequestConfig, FetchClientConfig };
