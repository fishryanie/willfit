import { Tabs } from 'expo-router';
import { Map, UserRound } from 'lucide-react-native';
import { theme } from 'theme';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName='index'
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneStyle: {
          backgroundColor: theme.colors.background,
        },
        tabBarActiveTintColor: theme.colors.primary2,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.46)',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginBottom: 2,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.backgroundSecondary,
          borderTopColor: 'rgba(255,255,255,0.08)',
        },
        tabBarIcon: ({ color, size, focused }) => {
          const strokeWidth = focused ? 2.4 : 2.1;

          if (route.name === 'index') {
            return <Map size={size} color={color} strokeWidth={strokeWidth} />;
          }

          return <UserRound size={size} color={color} strokeWidth={strokeWidth} />;
        },
      })}>
      <Tabs.Screen name='index' options={{ title: 'Bản đồ' }} />
      <Tabs.Screen name='add' options={{ title: 'Hồ sơ' }} />
      <Tabs.Screen name='chat' options={{ href: null }} />
    </Tabs>
  );
}
