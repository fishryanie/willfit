import { SendHorizontal } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useThemeColor } from 'hooks/use-theme-color';

type MessageComposerProps = {
  onSend: (message: string) => void;
  bottomInset: number;
};

export function MessageComposer({ onSend, bottomInset }: MessageComposerProps) {
  const [value, setValue] = useState('');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'secondary');
  const accentColor = useThemeColor({}, 'accent');

  const handleSend = () => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return;
    }

    onSend(trimmedValue);
    setValue('');
  };

  return (
    <View style={[styles.wrap, { paddingBottom: bottomInset + 10 }]}>
      <View style={[styles.container, { backgroundColor: cardColor }]}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder='Nhắn cho coach...'
          placeholderTextColor={mutedColor}
          multiline
          style={[styles.input, { color: textColor }]}
          selectionColor={accentColor}
        />
        <Pressable accessibilityRole='button' style={[styles.sendButton, { backgroundColor: accentColor }]} onPress={handleSend}>
          <SendHorizontal size={19} color='#111111' />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  container: {
    minHeight: 58,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    maxHeight: 112,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
    padding: 0,
    letterSpacing: 0,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
