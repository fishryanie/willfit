import { Tabs } from 'expo-router';
import { useThemeColor } from 'store/use-theme-store';
import { BookOpen, House, Map, MessageCircle, Plus } from 'lucide-react-native';

export default function TabLayout() {
  const activeColor = useThemeColor({}, 'accent');
  const inactiveColor = useThemeColor({}, 'tabIconDefault');

  return (
    <Tabs initialRouteName='index' screenOptions={{ headerShown: false, tabBarActiveTintColor: activeColor, tabBarInactiveTintColor: inactiveColor }}>
      <Tabs.Screen name='index' options={{ title: 'Home', tabBarIcon: ({ color, size }) => <House size={size} color={color} /> }} />
      <Tabs.Screen name='workout' options={{ title: 'Map', tabBarIcon: ({ color, size }) => <Map size={size} color={color} /> }} />
      <Tabs.Screen name='add' options={{ title: 'Exercise', tabBarIcon: ({ color, size }) => <Plus size={size} color={color} /> }} />
      <Tabs.Screen name='history' options={{ title: 'History', tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} /> }} />
      <Tabs.Screen name='chat' options={{ title: 'Message', tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} /> }} />
    </Tabs>
  );    
}
