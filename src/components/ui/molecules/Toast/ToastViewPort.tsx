import { useToast } from './context/ToastContext';
import React from 'react';
import { ThemedView } from 'components/base';
import { Toast } from './Toast';

export const ToastViewport: React.FC = () => {
  const { toasts } = useToast();

  const topToasts = toasts.filter(toast => toast.options.position === 'top');
  const bottomToasts = toasts.filter(toast => toast.options.position === 'bottom');

  return (
    <>
      <ThemedView
        safePaddingTop={10}
        height={200}
        style={[
          styles.viewport,
          styles.topViewport,
        ]}>
        {topToasts.map((toast, arrayIndex) => {
          const displayIndex = topToasts.length - 1 - arrayIndex;
          return <Toast key={toast.id} toast={toast} index={displayIndex} />;
        })}
        </ThemedView>
      <ThemedView
        safeBottom
        height={200}
        style={[
          styles.viewport,
          styles.bottomViewport,
        ]}>
        {bottomToasts.map((toast, arrayIndex) => {
          const displayIndex = bottomToasts.length - 1 - arrayIndex;
          return <Toast key={toast.id} toast={toast} index={displayIndex} />;
        })}
        </ThemedView>
    </>
  );
};

const styles = StyleSheet.create({
  viewport: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 16,
    pointerEvents: 'box-none',
  },
  topViewport: {
    top: 0,
    justifyContent: 'flex-start',
  },
  bottomViewport: {
    bottom: 0,
    justifyContent: 'flex-end',
  },
});
