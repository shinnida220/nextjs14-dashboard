import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

class AxiosSingleton {
  private static instance: AxiosSingleton;
  private axiosInstance: AxiosInstance;

  private constructor(baseURL: string) {
    // Create a new Axios instance
    this.axiosInstance = axios.create({ baseURL, validateStatus: null });

    // Add request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        console.log({
          path: config.url,
          headers: config.headers,
        });
        return config;
      },
      (error: any) => {
        // Handle request errors
        return Promise.reject(error);
      },
    );

    // Add response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: any) => {
        // Handle response errors
        console.error('Response interceptor error:', error);
        return Promise.reject(error);
      },
    );
  }

  public setAuthorization(token: string): AxiosSingleton {
    if (token) {
      this.axiosInstance.defaults.headers.common['Authorization'] =
        `Bearer ${token}`;
    }
    return AxiosSingleton.instance;
  }

  public static getInstance(baseUrl: string): AxiosSingleton {
    if (!AxiosSingleton.instance) {
      AxiosSingleton.instance = new AxiosSingleton(baseUrl);
    }
    return AxiosSingleton.instance;
  }

  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export const HttpClient = AxiosSingleton.getInstance(
  process.env.BACKEND_API_URL as string,
);
