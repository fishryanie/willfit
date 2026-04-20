import { Image } from 'expo-image';
import { router } from 'expo-router';
import { MessageCircle, Search, ShieldCheck, Sparkles } from 'lucide-react-native';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText, ThemedView } from 'components/base';
import { useThemeColor } from 'hooks/use-theme-color';
import { chatConversations, type ChatConversation } from './data';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80';

export function ChatListScreen() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const mutedColor = useThemeColor({}, 'secondary');
  const accentColor = useThemeColor({}, 'accent');

  return (
    <ThemedView flex={1} backgroundColor={backgroundColor}>
      <FlatList
        data={chatConversations}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 120 }]}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <ThemedText color={mutedColor} fontSize={13} fontWeight='900' textTransform='uppercase'>
                  Message
                </ThemedText>
                <ThemedText fontSize={33} lineHeight={38} fontWeight='900' marginTop={3}>
                  Your coaching chat
                </ThemedText>
              </View>
              <Pressable accessibilityRole='button' style={[styles.searchButton, { backgroundColor: cardColor }]}>
                <Search size={21} color={accentColor} />
              </Pressable>
            </View>

            <View style={styles.hero}>
              <Image source={{ uri: HERO_IMAGE }} style={StyleSheet.absoluteFill} contentFit='cover' />
              <View style={styles.heroOverlay} />
              <View style={styles.heroContent}>
                <View style={styles.heroBadge}>
                  <Sparkles size={14} color='#111111' />
                  <ThemedText color='#111111' fontSize={12} fontWeight='900'>
                    Live support
                  </ThemedText>
                </View>
                <ThemedText color='#FFFFFF' fontSize={24} lineHeight={29} fontWeight='900' maxWidth={250}>
                  Keep every workout decision in one place.
                </ThemedText>
                <ThemedText color='rgba(255,255,255,0.78)' fontSize={14} lineHeight={20} fontWeight='700' marginTop={7}>
                  Coach notes, run routes, nutrition tweaks, and recovery checks.
                </ThemedText>
              </View>
            </View>

            <View style={styles.sectionTitleRow}>
              <ThemedText fontSize={20} fontWeight='900'>
                Recent conversations
              </ThemedText>
              <View style={styles.secureRow}>
                <ShieldCheck size={15} color='#5BD67D' />
                <ThemedText color={mutedColor} fontSize={12} fontWeight='800'>
                  Synced
                </ThemedText>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => <ConversationCard conversation={item} cardColor={cardColor} mutedColor={mutedColor} />}
      />
    </ThemedView>
  );
}

function ConversationCard({ conversation, cardColor, mutedColor }: { conversation: ChatConversation; cardColor: string; mutedColor: string }) {
  return (
    <Pressable accessibilityRole='button' style={[styles.card, { backgroundColor: cardColor }]} onPress={() => router.push(`/chat/${conversation.id}`)}>
      <View style={[styles.avatar, { backgroundColor: conversation.accent }]}>
        <ThemedText color={conversation.color} fontSize={16} fontWeight='900'>
          {conversation.avatar}
        </ThemedText>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <View style={styles.nameGroup}>
            <ThemedText numberOfLines={1} fontSize={17} fontWeight='900'>
              {conversation.name}
            </ThemedText>
            <ThemedText numberOfLines={1} color={mutedColor} fontSize={12} fontWeight='800'>
              {conversation.role}
            </ThemedText>
          </View>
          <ThemedText color={mutedColor} fontSize={12} fontWeight='800'>
            {conversation.lastActive}
          </ThemedText>
        </View>

        <ThemedText numberOfLines={2} color={mutedColor} fontSize={14} lineHeight={20} fontWeight='700' marginTop={7}>
          {conversation.lastMessage}
        </ThemedText>

        <View style={styles.tagRow}>
          {conversation.tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <ThemedText color={conversation.color} fontSize={11} fontWeight='900'>
                {tag}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      {conversation.unread > 0 ? (
        <View style={[styles.unreadBadge, { backgroundColor: conversation.color }]}>
          <ThemedText color='#111111' fontSize={12} fontWeight='900'>
            {conversation.unread}
          </ThemedText>
        </View>
      ) : (
        <MessageCircle size={19} color={mutedColor} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    minHeight: 202,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 18,
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.46)',
  },
  heroContent: {
    padding: 18,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  sectionTitleRow: {
    marginTop: 22,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  card: {
    minHeight: 132,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    gap: 13,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  nameGroup: {
    flex: 1,
    minWidth: 0,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 12,
  },
  tag: {
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
  },
});
