import { Heart } from 'lucide-react-native';
import { Card, ThemedText, ThemedView } from 'components/base';

export function HeartRateCard() {
  return (
    <Card style={{ marginHorizontal: 20, marginBottom: 16, padding: 20, borderRadius: 24, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
      <ThemedView backgroundColor='transparent' row justifyContent='space-between' alignItems='center' marginBottom={16}>
        <ThemedView backgroundColor='transparent' row alignItems='center' gap={8}>
          <ThemedText fontSize={18} fontWeight='600'>Heart rate</ThemedText>
        </ThemedView>
        <Heart size={24} color="#FF453A" />
      </ThemedView>

      <ThemedView backgroundColor='transparent' row alignItems='flex-end' justifyContent='space-between'>
        <ThemedView backgroundColor='transparent' flex height={60} justifyContent='flex-end'>
          <ThemedView backgroundColor='transparent' height={40} width='100%' position='relative' justifyContent='center'>
            <ThemedView height={2} width='100%' backgroundColor='rgba(255, 69, 58, 0.3)' />
            <ThemedView
              width={8}
              height={8}
              radius={4}
              backgroundColor='#FF453A'
              position='absolute'
              borderWidth={2}
              borderColor='#FFF'
              left='60%'
              top='40%'
            />
          </ThemedView>
        </ThemedView>
        <ThemedView backgroundColor='transparent' alignItems='flex-end'>
          <ThemedText fontSize={24} fontWeight='600'>120</ThemedText>
          <ThemedText fontSize={14} opacity={0.6}>bpm</ThemedText>
        </ThemedView>
      </ThemedView>
    </Card>
  );
}
