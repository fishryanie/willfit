import { StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Bell, ScanQrCode, Search } from 'lucide-react-native';
import { ThemedText, ThemedView } from 'components/base';
import { useThemeColor } from 'store/use-theme-store';
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
  const { openDrawer } = useAppDrawer();
  const iconColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({ light: '#808080', dark: '#A1A1AA' }, 'secondary');
  const avatarBackground = useThemeColor({ light: '#24294A', dark: '#FF8A00' }, 'accent');
  const avatarTextColor = useThemeColor({ light: '#FFFFFF', dark: '#000000' }, 'background');

  return (
    <ThemedView
      rowCenter
      safePaddingTop={12}
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
          overflow='hidden'
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <ThemedText color={avatarTextColor} fontSize={14} fontWeight='700' letterSpacing={0}>
              {getInitials(name)}
            </ThemedText>
          )}
        </ThemedView>
        <ThemedView gap={5} backgroundColor="transparent" flexShrink={1}>
          <ThemedText color={mutedColor} fontSize={14} lineHeight={18} letterSpacing={0}>
            Welcome
          </ThemedText>
          <ThemedText
            numberOfLines={1}
            color={mutedColor}
            fontSize={16}
            lineHeight={20}
            fontWeight='600'
            letterSpacing={0}
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
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  iconButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
