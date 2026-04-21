import { Camera, ImagePlus, Send } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedView } from 'components/base';
import { CHAT_COLORS } from './data';

type MessageComposerProps = {
  onSend: (message: string) => void;
};

export function MessageComposer({ onSend }: MessageComposerProps) {
  const [value, setValue] = useState('');
  const [heightInput, setHeightInput] = useState(40);

  const handleSend = () => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return;
    }

    onSend(trimmedValue);
    setValue('');
    setHeightInput(40);
  };

  return (
    <ThemedView
      safePaddingBottom={12}
      flexDirection='column-reverse'
      alignItems='center'
      backgroundColor={CHAT_COLORS.white}
      borderTopWidth={0}>
      <ThemedView backgroundColor='transparent' width='100%' row alignItems='flex-end' gap={12} paddingTop={12} paddingHorizontal={12}>
        <ThemedView backgroundColor='transparent' minHeight={40} row alignItems='center' gap={12}>
          <Pressable accessibilityRole='button' style={styles.actionButton}>
            <ImagePlus absoluteStrokeWidth size={20} color={CHAT_COLORS.gray700} />
          </Pressable>
          <Pressable accessibilityRole='button' style={styles.actionButton}>
            <Camera absoluteStrokeWidth size={20} color={CHAT_COLORS.gray700} />
          </Pressable>
        </ThemedView>
        <TextInput
          value={value}
          onChangeText={setValue}
          multiline
          placeholder='Type a message...'
          placeholderTextColor={CHAT_COLORS.textPlaceholder}
          textAlignVertical='center'
          style={[styles.input, { height: Math.min(Math.max(heightInput, 40), 100) }]}
          selectionColor={CHAT_COLORS.primary}
          onContentSizeChange={event => {
            setHeightInput(Math.max(event.nativeEvent.contentSize.height, 40));
          }}
        />
        <Pressable accessibilityRole='button' style={styles.sendButton} onPress={handleSend}>
          <Send absoluteStrokeWidth size={18} strokeWidth={3} color={CHAT_COLORS.white} />
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    padding: 5,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: CHAT_COLORS.gray300,
    borderRadius: 25,
    paddingTop: 5,
    paddingHorizontal: 12,
    color: CHAT_COLORS.gray1000,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    letterSpacing: 0,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CHAT_COLORS.primary,
  },
});
