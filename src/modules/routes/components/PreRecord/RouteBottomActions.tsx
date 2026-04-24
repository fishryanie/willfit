import { ViewTheme } from 'components/base';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Footprints, Play, Route } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { theme } from 'theme';
import { useRouteRecordStore } from '../../store/use-route-record-store';
import { ACTION_DOCK_BOTTOM } from './constants';

export function RouteBottomActions() {
  const startSelectedRoute = useRouteRecordStore(state => state.startSelectedRoute);
  const openCreateRoute = useRouteRecordStore(state => state.openCreateRoute);

  return (
    <>
      <LinearGradient colors={['rgba(5,11,24,0)', 'rgba(5,11,24,0.62)']} style={actionsBottomFade} pointerEvents='none' />

      <ViewTheme
        position='absolute'
        left={12}
        right={12}
        bottom={ACTION_DOCK_BOTTOM}
        flexDirection='row'
        justifyContent='space-between'
        alignItems='flex-end'
        zIndex={40}
        backgroundColor='transparent'>
        <Pressable style={sideAction} onPress={() => undefined}>
          <View style={leftActionCircle}>
            <Footprints size={20} color={theme.colors.textPrimary} />
            <View style={checkBadge}>
              <Check size={10} color={theme.colors.textPrimary} strokeWidth={3} />
            </View>
          </View>
          <Text style={sideActionLabel}>Chạy bộ</Text>
        </Pressable>

        <Pressable style={centerAction} onPress={() => void startSelectedRoute()}>
          <LinearGradient colors={[theme.colors.primary, theme.colors.primary2]} style={centerActionCircle}>
            <Play size={22} color={theme.colors.textPrimary} fill={theme.colors.textPrimary} />
          </LinearGradient>
          <Text style={centerActionLabel}>Bắt đầu</Text>
        </Pressable>

        <Pressable style={sideAction} onPress={openCreateRoute}>
          <View style={rightActionCircle}>
            <Route size={21} color={theme.colors.textPrimary} />
          </View>
          <Text style={sideActionLabel} numberOfLines={1}>
            Thêm Lộ trình
          </Text>
        </Pressable>
      </ViewTheme>
    </>
  );
}

const actionsBottomFade = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  height: 160,
  zIndex: 28,
} as const;

const sideAction = {
  width: 100,
  alignItems: 'center',
  gap: 5,
} as const;

const leftActionCircle = {
  width: 52,
  height: 52,
  borderRadius: 26,
  borderWidth: 1,
  borderColor: 'rgba(86,204,242,0.48)',
  backgroundColor: 'rgba(8,14,28,0.96)',
  alignItems: 'center',
  justifyContent: 'center',
  ...theme.shadows.softShadow,
} as const;

const checkBadge = {
  position: 'absolute',
  right: -1,
  top: -1,
  width: 17,
  height: 17,
  borderRadius: 8.5,
  backgroundColor: theme.colors.primary,
  borderWidth: 2,
  borderColor: theme.colors.background,
  alignItems: 'center',
  justifyContent: 'center',
} as const;

const rightActionCircle = {
  width: 52,
  height: 52,
  borderRadius: 26,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.2)',
  backgroundColor: 'rgba(8,14,28,0.96)',
  alignItems: 'center',
  justifyContent: 'center',
  ...theme.shadows.softShadow,
} as const;

const centerAction = {
  alignItems: 'center',
  gap: 5,
} as const;

const centerActionCircle = {
  width: 66,
  height: 66,
  borderRadius: 33,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.24)',
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: theme.colors.primary,
  shadowOpacity: 0.34,
  shadowOffset: { width: 0, height: 8 },
  shadowRadius: 16,
  elevation: 8,
} as const;

const centerActionLabel = {
  color: theme.colors.textPrimary,
  fontSize: 13,
  lineHeight: 17,
  fontWeight: '700',
} as const;

const sideActionLabel = {
  color: theme.colors.textPrimary,
  fontSize: 12,
  lineHeight: 16,
  fontWeight: '800',
  textAlign: 'center',
} as const;
