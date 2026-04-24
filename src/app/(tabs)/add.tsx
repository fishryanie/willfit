import { theme } from 'theme';
import { ChevronRight, Crown, Settings, ShieldCheck } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const rows = [
  { id: 'premium', title: 'WillFit Premium', subtitle: 'Nâng cấp để mở tính năng nâng cao', icon: <Crown size={16} color={theme.colors.primary2} /> },
  { id: 'privacy', title: 'Quyền riêng tư', subtitle: 'Kiểm soát chia sẻ hoạt động', icon: <ShieldCheck size={16} color={theme.colors.primary2} /> },
  { id: 'settings', title: 'Cài đặt', subtitle: 'Thông báo, đơn vị, hiển thị bản đồ', icon: <Settings size={16} color={theme.colors.primary2} /> },
] as const;

export default function ProfileTabScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Hồ sơ</Text>
        <Text style={styles.subtitle}>Quản lý tài khoản và tuỳ chỉnh trải nghiệm chạy bộ.</Text>

        {rows.map(row => (
          <Pressable key={row.id}>
            <View style={styles.rowCard}>
              <View style={styles.rowIcon}>{row.icon}</View>
              <View style={styles.rowTextWrap}>
                <Text style={styles.rowTitle}>{row.title}</Text>
                <Text style={styles.rowSubtitle}>{row.subtitle}</Text>
              </View>
              <ChevronRight size={16} color={theme.colors.textMuted} />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.textPrimary,
    ...theme.typography.h2,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    ...theme.typography.body,
    marginBottom: theme.spacing.sm,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
  },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(47,128,237,0.14)',
  },
  rowTextWrap: {
    flex: 1,
    gap: 1,
  },
  rowTitle: {
    color: theme.colors.textPrimary,
    ...theme.typography.bodyStrong,
  },
  rowSubtitle: {
    color: theme.colors.textMuted,
    ...theme.typography.caption,
  },
});
