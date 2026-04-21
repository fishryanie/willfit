import { router } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Image, type ImageSourcePropType, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText, ThemedView } from 'components/base';
import { ScrollableSearch, useScrollableSearch } from 'components/ui/base/scrollable-search';
import { SearchBar as ReacticxSearchBar } from 'components/ui/molecules/search-bar/SearchBar';
import { CHAT_COLORS, chatConversations, type ChatConversation } from './data';

export function ChatListScreen() {
  return (
    <ThemedView flex={1} backgroundColor={CHAT_COLORS.white}>
      <ScrollableSearch>
        <ChatListContent />
      </ScrollableSearch>
    </ThemedView>
  );
}

function ChatListContent() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const { setIsFocused } = useScrollableSearch();

  const filteredConversations = useMemo(() => filterConversations(query), [query]);
  const activeCount = useMemo(() => chatConversations.filter(conversation => conversation.isActive).length, []);

  const closeSearch = () => {
    setIsFocused(false);
    setQuery('');
  };

  return (
    <>
      <ScrollableSearch.ScrollContent contentContainerStyle={{ paddingTop: insets.top + 138, paddingBottom: insets.bottom + 86 }} pullThreshold={72}>
        <ThemedView backgroundColor={CHAT_COLORS.white}>
          {chatConversations.map((item, index) => (
            <ThemedView key={item.id} backgroundColor='transparent'>
              <ConversationRow item={item} />
              {index !== chatConversations.length - 1 ? <ConversationSeparator /> : null}
            </ThemedView>
          ))}
        </ThemedView>
      </ScrollableSearch.ScrollContent>

      <ScrollableSearch.Overlay blurTint='light' maxBlurIntensity={60} onPress={closeSearch}>
        <ScrollableSearch.FocusedScreen>
          <FocusedSearchPanel conversations={filteredConversations} query={query} setQuery={setQuery} onClose={closeSearch} />
        </ScrollableSearch.FocusedScreen>
      </ScrollableSearch.Overlay>

      <ScrollableSearch.AnimatedComponent
        focusedOffset={-180}
        unfocusedOffset={0}
        onPullToFocus={() => setIsFocused(true)}
        springConfig={{ damping: 20, stiffness: 170, mass: 0.7 }}>
        <ChatSearchTrigger activeCount={activeCount} totalCount={chatConversations.length} />
      </ScrollableSearch.AnimatedComponent>
    </>
  );
}

function ChatSearchTrigger({ activeCount, totalCount }: { activeCount: number; totalCount: number }) {
  const { isFocused, setIsFocused } = useScrollableSearch();

  return (
    <ThemedView
      marginHorizontal={12}
      paddingHorizontal={12}
      paddingTop={10}
      paddingBottom={12}
      radius={8}
      borderWidth={StyleSheet.hairlineWidth}
      borderColor={CHAT_COLORS.antiFlashWhite}
      backgroundColor={CHAT_COLORS.white}>
      <ThemedView backgroundColor='transparent' row alignItems='flex-start' gap={12}>
        <ThemedView backgroundColor='transparent' flex={1} minWidth={0}>
          <ThemedText color={CHAT_COLORS.gray1000} fontSize={28} fontWeight='700' lineHeight={34}>
            Messages
          </ThemedText>
          <ThemedText color={CHAT_COLORS.gray600} fontSize={14} lineHeight={20}>
            Coach, AI chat, and workout support
          </ThemedText>
        </ThemedView>
        <ThemedView radius={8} backgroundColor='#FFF1E8' paddingHorizontal={10} paddingVertical={7}>
          <ThemedText color={CHAT_COLORS.primary} fontSize={12} fontWeight='700'>
            {activeCount}/{totalCount} online
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <Pressable accessibilityRole='search' style={styles.searchTrigger} onPress={() => setIsFocused(!isFocused)}>
        <Search size={18} color={CHAT_COLORS.textPlaceholder} />
        <ThemedText flex={1} color={CHAT_COLORS.textPlaceholder} fontSize={16}>
          Search messages...
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

function FocusedSearchPanel({
  conversations,
  query,
  setQuery,
  onClose,
}: {
  conversations: ChatConversation[];
  query: string;
  setQuery: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <SafeAreaView edges={['top']} style={styles.focusedContainer}>
      <ThemedView backgroundColor='transparent' row alignItems='center' gap={8} paddingHorizontal={16}>
        <ThemedView backgroundColor='transparent' flex={1}>
          <ReacticxSearchBar
            autoFocusOnMount
            placeholder='Search messages'
            tint={CHAT_COLORS.primary}
            centerWhenUnfocused={false}
            inputStyle={styles.searchInput}
            onSearch={setQuery}
            onClear={() => setQuery('')}
            onSearchDone={onClose}
          />
        </ThemedView>
        <Pressable accessibilityRole='button' style={styles.closeSearchButton} onPress={onClose}>
          <X size={20} color={CHAT_COLORS.gray700} />
        </Pressable>
      </ThemedView>

      <ScrollView style={styles.focusedScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled'>
        <ThemedView backgroundColor='transparent' paddingHorizontal={16} paddingBottom={30}>
          <ThemedView backgroundColor='transparent' row alignItems='center' gap={8} marginBottom={12}>
            <Search size={16} color={CHAT_COLORS.gray600} />
            <ThemedText color={CHAT_COLORS.gray600} fontSize={15} fontWeight='700'>
              {query.trim() ? 'Search results' : 'Recent conversations'}
            </ThemedText>
          </ThemedView>

          {conversations.length > 0 ? (
            conversations.map(conversation => <FocusedConversation key={conversation.id} conversation={conversation} onPress={onClose} />)
          ) : (
            <EmptySearchState query={query} />
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

function FocusedConversation({ conversation, onPress }: { conversation: ChatConversation; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole='button'
      style={styles.focusedItem}
      onPress={() => {
        onPress();
        router.push(`/chat/${conversation.id}`);
      }}>
      <ChatAvatar source={conversation.avatar} name={conversation.name} size={44} />
      <ThemedView backgroundColor='transparent' flex={1} minWidth={0} gap={4}>
        <ThemedText numberOfLines={1} color={CHAT_COLORS.gray1000} fontSize={16} fontWeight='700'>
          {conversation.name}
        </ThemedText>
        <ThemedText numberOfLines={1} color={CHAT_COLORS.gray600} fontSize={13}>
          {conversation.lastMessage}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

type ConversationRowProps = {
  item: ChatConversation;
};

function ConversationRow({ item }: ConversationRowProps) {
  return (
    <Swipeable overshootRight={false} renderRightActions={renderDeleteAction}>
      <ThemedView backgroundColor='transparent'>
        <Pressable accessibilityRole='button' style={styles.row} onPress={() => router.push(`/chat/${item.id}`)}>
          <ChatAvatar source={item.avatar} name={item.name} size={56} />
          <ThemedView backgroundColor='transparent' flex={1} gap={5} justifyContent='center'>
            <ThemedView backgroundColor='transparent' row alignItems='center' gap={8}>
              <ThemedText flex={1} numberOfLines={1} color={CHAT_COLORS.gray1000} fontSize={16} fontWeight='600' lineHeight={20}>
                {item.name}
              </ThemedText>
              <ThemedText color={CHAT_COLORS.textPlaceholder} fontSize={12}>
                {item.time}
              </ThemedText>
            </ThemedView>
            <ThemedText numberOfLines={1} color={CHAT_COLORS.gray600} fontSize={14} marginRight={12}>
              {item.lastMessage}
            </ThemedText>
          </ThemedView>
        </Pressable>
      </ThemedView>
    </Swipeable>
  );
}

function ConversationSeparator() {
  return <ThemedView height={1} marginLeft={74} backgroundColor={CHAT_COLORS.antiFlashWhite} />;
}

function EmptySearchState({ query }: { query: string }) {
  return (
    <ThemedView backgroundColor='transparent' minHeight={180} alignItems='center' justifyContent='center' gap={8} paddingHorizontal={24}>
      <ThemedText color={CHAT_COLORS.gray1000} fontSize={16} fontWeight='700'>
        No conversations found
      </ThemedText>
      <ThemedText color={CHAT_COLORS.gray600} fontSize={14} lineHeight={20} textAlign='center'>
        {query.trim() ? `Try another keyword for "${query.trim()}".` : 'Start typing to find a coach or conversation.'}
      </ThemedText>
    </ThemedView>
  );
}

function renderDeleteAction() {
  return (
    <ThemedView width={86} alignItems='center' justifyContent='center' backgroundColor={CHAT_COLORS.textError}>
      <ThemedText color={CHAT_COLORS.white} fontSize={13} fontWeight='700'>
        Delete
      </ThemedText>
    </ThemedView>
  );
}

function ChatAvatar({ source, name, size }: { source?: ImageSourcePropType; name: string; size: number }) {
  if (source) {
    return <Image source={source} resizeMode='cover' style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]} />;
  }

  return (
    <ThemedView width={size} height={size} radius={size / 2} alignItems='center' justifyContent='center' backgroundColor={CHAT_COLORS.primary}>
      <ThemedText color={CHAT_COLORS.white} fontSize={size / 3.5} fontWeight='600'>
        {getInitials(name)}
      </ThemedText>
    </ThemedView>
  );
}

function getInitials(name: string) {
  const initials = name
    .replace(/[^\w\s]/gi, '')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase())
    .join('');

  return initials || name.charAt(0).toUpperCase();
}

function filterConversations(query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return chatConversations;
  }

  return chatConversations.filter(conversation =>
    [conversation.name, conversation.status, conversation.lastMessage].some(value => value.toLowerCase().includes(normalizedQuery)),
  );
}

function ChatShimmerList() {
  return (
    <ThemedView backgroundColor='transparent'>
      {Array.from({ length: 10 }).map((_, index) => (
        <ThemedView key={index} backgroundColor='transparent'>
          <ThemedView backgroundColor='transparent' minHeight={72} row gap={15} padding={12}>
            <ThemedView width={30} height={30} radius={15} backgroundColor={CHAT_COLORS.antiFlashWhite} />
            <ThemedView backgroundColor='transparent' flex={1} gap={10}>
              <ThemedView height={20} radius={5} backgroundColor={CHAT_COLORS.antiFlashWhite} />
              <ThemedView width='72%' height={10} radius={8} backgroundColor={CHAT_COLORS.antiFlashWhite} />
            </ThemedView>
          </ThemedView>
          {index !== 9 ? <ConversationSeparator /> : null}
        </ThemedView>
      ))}
    </ThemedView>
  );
}

export const ChatListLoading = ChatShimmerList;

const styles = StyleSheet.create({
  content: {
    backgroundColor: CHAT_COLORS.white,
  },
  header: {
    marginHorizontal: 12,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: CHAT_COLORS.antiFlashWhite,
    backgroundColor: CHAT_COLORS.white,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  headerBadge: {
    borderRadius: 8,
    backgroundColor: '#FFF1E8',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  searchTrigger: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CHAT_COLORS.antiFlashWhite,
    backgroundColor: 'rgba(118,118,128,0.12)',
    paddingHorizontal: 14,
  },
  searchInput: {
    color: CHAT_COLORS.gray1000,
    fontSize: 16,
  },
  row: {
    minHeight: 80,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    backgroundColor: CHAT_COLORS.white,
  },
  body: {
    flex: 1,
    gap: 5,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    backgroundColor: CHAT_COLORS.antiFlashWhite,
  },
  separator: {
    height: 1,
    marginLeft: 74,
    backgroundColor: CHAT_COLORS.antiFlashWhite,
  },
  deleteAction: {
    width: 86,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CHAT_COLORS.textError,
  },
  emptyState: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  focusedContainer: {
    flex: 1,
    paddingTop: 16,
    backgroundColor: CHAT_COLORS.white,
  },
  focusedSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  focusedSearch: {
    flex: 1,
  },
  closeSearchButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CHAT_COLORS.white,
  },
  focusedScroll: {
    flex: 1,
    marginTop: 18,
  },
  focusedSection: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  focusedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  focusedItem: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CHAT_COLORS.antiFlashWhite,
    backgroundColor: CHAT_COLORS.white,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  focusedItemBody: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  shimmerRow: {
    minHeight: 72,
    flexDirection: 'row',
    gap: 15,
    padding: 12,
  },
  shimmerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: CHAT_COLORS.antiFlashWhite,
  },
  shimmerBody: {
    flex: 1,
    gap: 10,
  },
  shimmerTitle: {
    height: 20,
    borderRadius: 5,
    backgroundColor: CHAT_COLORS.antiFlashWhite,
  },
  shimmerLine: {
    width: '72%',
    height: 10,
    borderRadius: 8,
    backgroundColor: CHAT_COLORS.antiFlashWhite,
  },
});
