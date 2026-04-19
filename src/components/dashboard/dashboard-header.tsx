import { StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Bell, ScanQrCode, Search } from 'lucide-react-native';
import { ThemedText } from 'components/themed-text';
import { ThemedView } from 'components/themed-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from 'hooks/use-theme-color';
import { useAppDrawer } from 'components/drawer/app-drawer';

interface DashboardHeaderProps {
  name: string;
  avatarUrl?: string;
  onProfilePress?: () => void;
  onSearchPress?: () => void;
  onNotificationsPress?: () => void;
  onScanPress?: () => void;
}

export function DashboardHeader({
  name,
  avatarUrl,
  onProfilePress,
  onSearchPress,
  onNotificationsPress,
  onScanPress,
}: DashboardHeaderProps) {
  const insets = useSafeAreaInsets();
  const { openDrawer } = useAppDrawer();
  const iconColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({ light: '#808080', dark: '#A1A1AA' }, 'secondary');
  const avatarBackground = useThemeColor({ light: '#24294A', dark: '#FF8A00' }, 'accent');
  const avatarTextColor = useThemeColor({ light: '#FFFFFF', dark: '#000000' }, 'background');

  return (
    <ThemedView
      rowCenter
      paddingTop={insets.top + 12}
      paddingHorizontal={12}
      gap={20}
      marginBottom={20}
    >
      <TouchableOpacity
        activeOpacity={0.78}
        onPress={onProfilePress ?? openDrawer}
        style={styles.profileButton}
        accessibilityLabel="Open profile"
        accessibilityRole="button"
      >
        <ThemedView
          round={50}
          contentCenter
          backgroundColor={avatarBackground}
          style={styles.avatar}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <ThemedText style={[styles.avatarInitials, { color: avatarTextColor }]}>
              {getInitials(name)}
            </ThemedText>
          )}
        </ThemedView>
        <ThemedView gap={5} backgroundColor="transparent" style={styles.profileText}>
          <ThemedText style={[styles.greeting, { color: mutedColor }]}>Welcome</ThemedText>
          <ThemedText
            numberOfLines={1}
            style={[styles.name, { color: mutedColor }]}
          >
            {name}
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>

      <ThemedView
        flex
        rowCenter
        gap={20}
        justifyContent="flex-end"
        backgroundColor="transparent"
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onSearchPress}
          style={styles.iconButton}
          accessibilityLabel="Search"
          accessibilityRole="button"
        >
          <Search size={22} color={iconColor} strokeWidth={2.1} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onNotificationsPress}
          style={styles.iconButton}
          accessibilityLabel="Notifications"
          accessibilityRole="button"
        >
          <Bell size={22} color={iconColor} strokeWidth={2.1} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onScanPress}
          style={styles.iconButton}
          accessibilityLabel="Scan QR code"
          accessibilityRole="button"
        >
          <ScanQrCode size={22} color={iconColor} strokeWidth={2.1} />
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('');

  return (initials || 'WF').slice(0, 2).toUpperCase();
}

const styles = StyleSheet.create({
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  avatar: {
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0,
  },
  profileText: {
    flexShrink: 1,
  },
  greeting: {
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0,
  },
  name: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0,
  },
  iconButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
