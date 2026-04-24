import { CustomTabBar } from 'components/navigation/custom-tab-bar';
import { Tabs } from 'expo-router';
import { theme } from 'theme';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName='index'
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: theme.colors.background } }}>
      <Tabs.Screen name='index' options={{ title: 'Bản đồ', tabBarLabel: 'Bản đồ' }} />
      <Tabs.Screen name='home' options={{ title: 'Trang chủ', tabBarLabel: 'Trang chủ' }} />
      <Tabs.Screen name='plan' options={{ title: 'Kế hoạch', tabBarLabel: 'Kế hoạch' }} />
      {/* <Tabs.Screen name='add' options={{ title: 'Hồ sơ', tabBarLabel: 'Hồ sơ' }} /> */}
      <Tabs.Screen name='chat' options={{ href: null }} />
    </Tabs>
  );
}
