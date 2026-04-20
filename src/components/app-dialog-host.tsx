import { LogIn, Trash2, TriangleAlert } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from 'components/themed-text';
import { Dialog } from 'components/ui/organisms/dialog';
import { appDialog, type AppDialogState, type AppDialogTone } from 'lib/app-dialog';

type DialogAction = 'cancel' | 'confirm';

const toneConfig: Record<AppDialogTone, { color: string; backgroundColor: string; icon: typeof TriangleAlert }> = {
  default: {
    color: '#5BD67D',
    backgroundColor: 'rgba(91, 214, 125, 0.14)',
    icon: TriangleAlert,
  },
  danger: {
    color: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
    icon: Trash2,
  },
  warning: {
    color: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
    icon: TriangleAlert,
  },
  session: {
    color: '#FF8A00',
    backgroundColor: 'rgba(255, 138, 0, 0.15)',
    icon: LogIn,
  },
};

export function AppDialogHost() {
  const [dialog, setDialog] = useState<AppDialogState | null>(null);
  const actionRef = useRef<DialogAction>('cancel');
  const dialogRef = useRef<AppDialogState | null>(null);

  useEffect(
    () =>
      appDialog.subscribe(nextDialog => {
        actionRef.current = 'cancel';
        dialogRef.current = nextDialog;
        setDialog(nextDialog);
      }),
    [],
  );

  if (!dialog) {
    return null;
  }

  const tone = toneConfig[dialog.tone];
  const Icon = tone.icon;

  const handleClose = () => {
    const closedDialog = dialogRef.current;
    const action = actionRef.current;

    appDialog.clear();
    dialogRef.current = null;

    if (!closedDialog) {
      return;
    }

    if (action === 'confirm') {
      closedDialog.onConfirm?.();
      return;
    }

    closedDialog.onCancel?.();
  };

  return (
    <Dialog key={dialog.id} defaultOpen>
      <Dialog.Content dismissible={dialog.dismissible} onClose={handleClose}>
        <View style={styles.card}>
          <View style={[styles.iconWrap, { backgroundColor: tone.backgroundColor }]}>
            <Icon size={24} color={tone.color} strokeWidth={2.6} />
          </View>

          <View style={styles.copy}>
            <ThemedText style={styles.title}>{dialog.title}</ThemedText>
            {dialog.message ? <ThemedText style={styles.message}>{dialog.message}</ThemedText> : null}
          </View>

          <View style={styles.actions}>
            {dialog.cancelLabel ? (
              <Dialog.Close asChild>
                <Pressable
                  accessibilityRole='button'
                  style={[styles.button, styles.secondaryButton]}
                  onPress={() => {
                    actionRef.current = 'cancel';
                  }}>
                  <ThemedText style={styles.secondaryText}>{dialog.cancelLabel}</ThemedText>
                </Pressable>
              </Dialog.Close>
            ) : null}

            <Dialog.Close asChild>
              <Pressable
                accessibilityRole='button'
                style={[styles.button, styles.primaryButton, { backgroundColor: tone.color }]}
                onPress={() => {
                  actionRef.current = 'confirm';
                }}>
                <ThemedText style={styles.primaryText}>{dialog.confirmLabel}</ThemedText>
              </Pressable>
            </Dialog.Close>
          </View>
        </View>
      </Dialog.Content>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    backgroundColor: '#17181D',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 18 },
    shadowRadius: 30,
    elevation: 12,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    marginTop: 16,
    gap: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
    letterSpacing: 0,
  },
  message: {
    color: '#B7BBC4',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    letterSpacing: 0,
  },
  actions: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    minHeight: 46,
    minWidth: 112,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  secondaryButton: {
    backgroundColor: '#24262E',
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 8,
  },
  secondaryText: {
    color: '#E5E7EF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
  },
  primaryText: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
  },
});
