import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ChevronDown, UserRound } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  type ImageSourcePropType,
  KeyboardAvoidingView,
  type ListRenderItemInfo,
  Platform,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText, ThemedView } from 'components/base';
import { CHAT_BACKGROUND, CHAT_COLORS, getConversationById, type ChatConversation, type ChatMessage } from './data';
import { MessageComposer } from './message-composer';

export function ChatDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const conversation = getConversationById(params.id);
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(conversation.messages);

  useEffect(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages.length]);

  const renderMessage = useCallback(
    ({ item }: ListRenderItemInfo<ChatMessage>) => <MessageBubble message={item} conversation={conversation} />,
    [conversation],
  );

  const handleSend = (text: string) => {
    setMessages(current => [
      ...current,
      {
        id: `local-${Date.now()}`,
        author: 'me',
        text,
        time: formatTime(new Date()),
      },
    ]);
  };

  return (
    <ThemedView flex={1} backgroundColor={CHAT_COLORS.white}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <ChatHeader conversation={conversation} topInset={insets.top} />
        <ImageBackground source={CHAT_BACKGROUND} style={styles.chatBackground} resizeMode='cover'>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='never'
            contentContainerStyle={styles.messagesContainer}
            ListFooterComponent={<ScrollToBottomHint />}
          />
          <MessageComposer bottomInset={insets.bottom} onSend={handleSend} />
        </ImageBackground>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

function ChatHeader({ conversation, topInset }: { conversation: ChatConversation; topInset: number }) {
  return (
    <ThemedView style={[styles.header, { height: 52 + topInset, paddingTop: topInset }]}>
      <Pressable accessibilityRole='button' style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={20} strokeWidth={2} color={CHAT_COLORS.gray1000} />
      </Pressable>
      <ChatAvatar source={conversation.avatar} name={conversation.name} size={36} />
      <ThemedView backgroundColor='transparent' style={styles.headerCopy}>
        <ThemedText numberOfLines={1} fontSize={16} fontWeight='600' color={CHAT_COLORS.gray1000}>
          {conversation.name}
        </ThemedText>
        <ThemedView backgroundColor='transparent' style={styles.statusRow}>
          <ThemedView style={styles.activeDot} />
          <ThemedText fontSize={12} fontWeight='400' color={CHAT_COLORS.gray600}>
            {conversation.status}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

function MessageBubble({ message, conversation }: { message: ChatMessage; conversation: ChatConversation }) {
  const isMe = message.author === 'me';

  return (
    <ThemedView backgroundColor='transparent' style={[styles.messageRow, isMe ? styles.myMessageRow : styles.coachMessageRow]}>
      {!isMe ? <ChatAvatar source={conversation.avatar} name={conversation.name} size={36} /> : null}
      <ThemedView style={[styles.bubble, isMe ? styles.myBubble : styles.coachBubble]}>
        {message.image ? (
          <Image source={{ uri: message.image }} resizeMode='cover' style={styles.messageImage} />
        ) : (
          <ThemedText fontSize={16} fontWeight='400' lineHeight={22} color={CHAT_COLORS.gray1000}>
            {message.text}
          </ThemedText>
        )}
        {!message.image ? (
          <ThemedText
            alignSelf={isMe ? 'flex-end' : 'flex-start'}
            color={isMe ? CHAT_COLORS.gray700 : CHAT_COLORS.gray400}
            fontSize={12}
            fontWeight='500'
            marginTop={4}>
            {message.time}
          </ThemedText>
        ) : null}
      </ThemedView>
    </ThemedView>
  );
}

function ChatAvatar({ source, name, size }: { source?: ImageSourcePropType; name: string; size: number }) {
  if (source) {
    return <Image source={source} resizeMode='cover' style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]} />;
  }

  const initials = getInitials(name);

  return (
    <ThemedView style={[styles.avatarFallback, { width: size, height: size, borderRadius: size / 2 }]}>
      {initials ? (
        <ThemedText color={CHAT_COLORS.white} fontSize={size / 3.5} fontWeight='600'>
          {initials}
        </ThemedText>
      ) : (
        <UserRound size={size / 2.5} color={CHAT_COLORS.white} />
      )}
    </ThemedView>
  );
}

function ScrollToBottomHint() {
  return (
    <ThemedView style={styles.scrollHint}>
      <ChevronDown size={20} color={CHAT_COLORS.gray700} />
    </ThemedView>
  );
}

function getInitials(name: string) {
  return name
    .replace(/[^\w\s]/gi, '')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
    backgroundColor: CHAT_COLORS.white,
  },
  backButton: {
    padding: 8,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: CHAT_COLORS.green500,
  },
  chatBackground: {
    flex: 1,
  },
  messagesContainer: {
    flexGrow: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 12,
  },
  messageRow: {
    maxWidth: '86%',
    flexDirection: 'row',
    gap: 8,
  },
  coachMessageRow: {
    alignSelf: 'flex-start',
    alignItems: 'flex-end',
  },
  myMessageRow: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  bubble: {
    minHeight: 38,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  coachBubble: {
    backgroundColor: CHAT_COLORS.white,
  },
  myBubble: {
    backgroundColor: CHAT_COLORS.primary200,
  },
  messageImage: {
    width: 188,
    height: 250,
    borderRadius: 5,
  },
  avatar: {
    backgroundColor: CHAT_COLORS.antiFlashWhite,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CHAT_COLORS.primary,
  },
  scrollHint: {
    width: 32,
    height: 32,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: CHAT_COLORS.white,
  },
});
