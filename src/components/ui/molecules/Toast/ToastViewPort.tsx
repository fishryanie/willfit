import { ThemedView } from 'components/base';
import React from 'react';
import { useToast } from './context/ToastContext';
import { Toast } from './Toast';

export const ToastViewport: React.FC = () => {
  const { toasts } = useToast();

  const topToasts = toasts.filter(toast => toast.options.position === 'top');
  const bottomToasts = toasts.filter(toast => toast.options.position === 'bottom');

  return (
    <>
      <ThemedView
        backgroundColor='transparent'
        safePaddingTop={10}
        height={200}
        position='absolute'
        left={0}
        right={0}
        zIndex={9999}
        paddingHorizontal={16}
        pointerEvents='box-none'
        top={0}
        justifyContent='flex-start'>
        {topToasts.map((toast, arrayIndex) => {
          const displayIndex = topToasts.length - 1 - arrayIndex;
          return <Toast key={toast.id} toast={toast} index={displayIndex} />;
        })}
      </ThemedView>
      <ThemedView
        backgroundColor='transparent'
        safeBottom
        height={200}
        position='absolute'
        left={0}
        right={0}
        zIndex={9999}
        paddingHorizontal={16}
        pointerEvents='box-none'
        bottom={0}
        justifyContent='flex-end'>
        {bottomToasts.map((toast, arrayIndex) => {
          const displayIndex = bottomToasts.length - 1 - arrayIndex;
          return <Toast key={toast.id} toast={toast} index={displayIndex} />;
        })}
      </ThemedView>
    </>
  );
};
