import axios, { AxiosError, HttpStatusCode, isCancel, type AxiosRequestConfig, type RawAxiosRequestHeaders } from 'axios';
import { router } from 'expo-router';
import { useAuthStore } from 'store/use-auth-store';
import { appDialog } from './app-dialog';
import { appToast } from './app-toast';
import { STORAGE_KEY, storage } from './storage';

type RetryRequestConfig = AxiosRequestConfig & { _retry?: boolean };

export const api = axios.create({
  baseURL: process.env.APP_API,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Queue to hold requests while refreshing token
let isRefreshing = false;
let failedQueue: any[] = [];
let sessionExpiredDialogVisible = false;

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const setAuthorizationHeader = (config: RetryRequestConfig, token: string) => {
  config.headers = {
    ...(config.headers ?? {}),
    Authorization: `Bearer ${token}`,
  } as RawAxiosRequestHeaders;
};

/**
 * Handle session expiration: Clear tokens and redirect
 */
const handleSessionExpired = () => {
  useAuthStore.getState().logout();

  if (!sessionExpiredDialogVisible) {
    sessionExpiredDialogVisible = true;
    appDialog.show({
      title: 'Phiên đăng nhập hết hạn',
      message: 'Vui lòng đăng nhập lại để tiếp tục sử dụng dịch vụ.',
      confirmLabel: 'Đăng nhập lại',
      tone: 'session',
      dismissible: false,
      onConfirm: () => {
        sessionExpiredDialogVisible = false;
        router.replace('/');
      },
    });
  }
};

const readServerMessage = (data: unknown): string | undefined => {
  if (!data) {
    return undefined;
  }

  if (typeof data === 'string') {
    return data;
  }

  if (Array.isArray(data)) {
    const firstMessage = data.find(item => typeof item === 'string');
    return firstMessage;
  }

  if (typeof data !== 'object') {
    return undefined;
  }

  const payload = data as { message?: unknown; error?: unknown; errors?: unknown };

  if (typeof payload.message === 'string') {
    return payload.message;
  }

  if (typeof payload.error === 'string') {
    return payload.error;
  }

  if (Array.isArray(payload.errors)) {
    const firstError = payload.errors.find(item => typeof item === 'string');
    return firstError;
  }

  if (payload.errors && typeof payload.errors === 'object') {
    const firstFieldError = Object.values(payload.errors)
      .flat()
      .find(item => typeof item === 'string');
    return firstFieldError;
  }

  return undefined;
};

const getAxiosErrorMessage = (error: AxiosError) => {
  const serverMessage = readServerMessage(error.response?.data);

  if (serverMessage) {
    return serverMessage;
  }

  if (error.code === AxiosError.ERR_NETWORK || !error.response) {
    return 'Kiểm tra kết nối mạng rồi thử lại.';
  }

  switch (error.response.status) {
    case HttpStatusCode.BadRequest:
      return 'Thông tin gửi lên chưa hợp lệ.';
    case HttpStatusCode.Forbidden:
      return 'Bạn chưa có quyền thực hiện thao tác này.';
    case HttpStatusCode.NotFound:
      return 'Không tìm thấy dữ liệu cần xử lý.';
    case HttpStatusCode.RequestTimeout:
      return 'Yêu cầu mất quá nhiều thời gian. Thử lại sau ít phút.';
    case HttpStatusCode.UnprocessableEntity:
      return 'Một vài trường trong form chưa hợp lệ.';
    case HttpStatusCode.TooManyRequests:
      return 'Bạn đang thao tác quá nhanh. Nghỉ một nhịp rồi thử lại.';
    default:
      return 'Máy chủ đang gặp sự cố. Thử lại sau ít phút.';
  }
};

const shouldShowAxiosErrorToast = (error: AxiosError) => {
  if (isCancel(error)) {
    return false;
  }

  return error.response?.status !== 401;
};

const notifyAxiosError = (error: AxiosError) => {
  if (!shouldShowAxiosErrorToast(error)) {
    return;
  }
  appToast.error('Yêu cầu thất bại', getAxiosErrorMessage(error));
};

// Request Interceptor
api.interceptors.request.use(
  config => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    appToast.error('Không thể gửi yêu cầu', 'Kiểm tra kết nối rồi thử lại.');
    return Promise.reject(error);
  },
);

// Response Interceptor
api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig | undefined;
    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh');

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && isRefreshRequest) {
      handleSessionExpired();
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, wait for it to finish and retry this request
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            setAuthorizationHeader(originalRequest, token);
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await storage.getItem(STORAGE_KEY.REFRESH_TOKEN);

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call your refresh API
        const response = await axios.post(`${process.env.APP_API}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Update RAM and Storage
        await useAuthStore.getState().setTokens(accessToken, newRefreshToken);

        // Process stored requests with new token
        processQueue(null, accessToken);

        setAuthorizationHeader(originalRequest, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        handleSessionExpired();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401) {
      handleSessionExpired();
      return Promise.reject(error);
    }

    notifyAxiosError(error);
    return Promise.reject(error);
  },
);
