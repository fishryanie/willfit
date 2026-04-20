export type AppDialogTone = 'default' | 'danger' | 'warning' | 'session';

export type AppDialogOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: AppDialogTone;
  dismissible?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export type AppDialogState = Required<Pick<AppDialogOptions, 'title' | 'confirmLabel' | 'tone' | 'dismissible'>> &
  Omit<AppDialogOptions, 'title' | 'confirmLabel' | 'tone' | 'dismissible'> & {
    id: string;
  };

type DialogListener = (dialog: AppDialogState | null) => void;

let activeDialog: AppDialogState | null = null;
const listeners = new Set<DialogListener>();

const emit = () => {
  listeners.forEach(listener => listener(activeDialog));
};

const normalizeDialog = (options: AppDialogOptions): AppDialogState => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  confirmLabel: 'Xác nhận',
  tone: 'default',
  dismissible: true,
  ...options,
});

export const appDialog = {
  show: (options: AppDialogOptions) => {
    activeDialog = normalizeDialog(options);
    emit();
  },
  confirm: (options: AppDialogOptions) =>
    new Promise<boolean>(resolve => {
      appDialog.show({
        ...options,
        onConfirm: () => {
          options.onConfirm?.();
          resolve(true);
        },
        onCancel: () => {
          options.onCancel?.();
          resolve(false);
        },
      });
    }),
  clear: () => {
    activeDialog = null;
    emit();
  },
  subscribe: (listener: DialogListener) => {
    listeners.add(listener);
    listener(activeDialog);

    return () => {
      listeners.delete(listener);
    };
  },
};
