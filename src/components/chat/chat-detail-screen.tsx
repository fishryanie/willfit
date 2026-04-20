import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Ellipsis, Phone, Video } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText, ThemedView } from 'components/base';
import { useThemeColor } from 'hooks/use-theme-color';
import { getConversationById, type ChatMessage } from './data';
import { MessageComposer } from './message-composer';

export function ChatDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const conversation = getConversationById(params.id);
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const mutedColor = useThemeColor({}, 'secondary');
  const textColor = useThemeColor({}, 'text');
  const [messages, setMessages] = useState<ChatMessage[]>(conversation.messages);

  const reversedMessages = useMemo(() => [...messages].reverse(), [messages]);

  const handleSend = (body: string) => {
    setMessages(current => [
      ...current,
      {
        id: `local-${Date.now()}`,
        author: 'me',
        body,
        time: 'Now',
      },
    ]);
  };

  return (
    <ThemedView flex={1} backgroundColor={backgroundColor}>
      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor }]}>
        <Pressable accessibilityRole='button' style={[styles.iconButton, { backgroundColor: cardColor }]} onPress={() => router.back()}>
          <ArrowLeft size={21} color={textColor} />
        </Pressable>

        <View style={styles.headerIdentity}>
          <View style={[styles.avatar, { backgroundColor: conversation.accent }]}>
            <ThemedText color={conversation.color} fontSize={14} fontWeight='900'>
              {conversation.avatar}
            </ThemedText>
          </View>
          <View style={styles.headerCopy}>
            <ThemedText numberOfLines={1} fontSize={17} fontWeight='900'>
              {conversation.name}
            </ThemedText>
            <ThemedText numberOfLines={1} color={mutedColor} fontSize={12} fontWeight='800'>
              {conversation.status === 'online' ? 'Online now' : conversation.lastActive}
            </ThemedText>
          </View>
        </View>

        <View style={styles.headerActions}>
          <Pressable accessibilityRole='button' style={[styles.iconButton, { backgroundColor: cardColor }]}>
            <Phone size={18} color={textColor} />
          </Pressable>
          <Pressable accessibilityRole='button' style={[styles.iconButton, { backgroundColor: cardColor }]}>
            <Video size={18} color={textColor} />
          </Pressable>
          <Pressable accessibilityRole='button' style={[styles.iconButton, { backgroundColor: cardColor }]}>
            <Ellipsis size={18} color={textColor} />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={reversedMessages}
        keyExtractor={item => item.id}
        inverted
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messages}
        renderItem={({ item }) => <MessageBubble message={item} accentColor={conversation.color} mutedColor={mutedColor} />}
      />

      <MessageComposer bottomInset={insets.bottom} onSend={handleSend} />
    </ThemedView>
  );
}

function MessageBubble({ message, accentColor, mutedColor }: { message: ChatMessage; accentColor: string; mutedColor: string }) {
  const isMe = message.author === 'me';

  return (
    <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.coachMessageRow]}>
      <View style={[styles.bubble, isMe ? { backgroundColor: accentColor } : styles.coachBubble]}>
        <ThemedText color={isMe ? '#111111' : '#FFFFFF'} fontSize={15} lineHeight={21} fontWeight='700'>
          {message.body}
        </ThemedText>
      </View>
      <ThemedText color={mutedColor} fontSize={11} fontWeight='800' marginTop={5}>
        {message.time}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 96,
    paddingHorizontal: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(142,147,158,0.24)',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 7,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messages: {
    paddingHorizontal: 14,
    paddingTop: 22,
    paddingBottom: 12,
    gap: 12,
  },
  messageRow: {
    maxWidth: '82%',
  },
  myMessageRow: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  coachMessageRow: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  coachBubble: {
    backgroundColor: '#23242B',
  },
});
