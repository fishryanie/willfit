import { Toast } from 'components/ui/molecules/Toast';

type AppToastOptions = Omit<ToastOptions, 'type' | 'position'> & {
  position?: ToastOptions['position'];
};

const DEFAULT_DURATION = 3200;

const buildContent = (title: string, message?: string) => (message ? `${title}\n${message}` : title);

const show = (title: string, message: string | undefined, options: AppToastOptions | undefined, type: NonNullable<ToastOptions['type']>) =>
  Toast.show(buildContent(title, message), {
    duration: DEFAULT_DURATION,
    position: 'top',
    ...options,
    type,
  });

export const appToast = {
  success: (title: string, message?: string, options?: AppToastOptions) => show(title, message, options, 'success'),
  error: (title: string, message?: string, options?: AppToastOptions) => show(title, message, options, 'error'),
  warning: (title: string, message?: string, options?: AppToastOptions) => show(title, message, options, 'warning'),
  info: (title: string, message?: string, options?: AppToastOptions) => show(title, message, options, 'info'),
};
