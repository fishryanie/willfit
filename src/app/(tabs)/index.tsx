import { ThemedView } from 'components/base';
import SignUpV1 from 'components/ui/templates/sign-up-v1';
import { StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <ThemedView flex>
      <SignUpV1 />
      {/* <DashboardHeader name='Sofia' />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <MetricChips />

        <ThemedView backgroundColor='transparent' row gap={16} paddingHorizontal={20} marginBottom={16}>
          <MetricGridCard title='Calories' value='5,839' unit='kcal' progress={0.7} progressColor='#222' icon='flame' iconColor='#222' />
          <MetricGridCard title='Water' value='1,200' unit='ml' progress={0.4} progressColor='#222' icon='water' iconColor='#222' />
        </ThemedView>

        <ThemedView backgroundColor='transparent' row gap={16} paddingHorizontal={20} marginBottom={16}>
          <MetricGridCard title='Sleep' value='7.30' unit='hrs' progress={0.8} progressColor='#222' icon='moon' iconColor='#222' />
          <MetricGridCard title='Weight' value='92' unit='kg' progress={0.6} progressColor='#222' icon='barbell' iconColor='#222' />
        </ThemedView>

        <ThemedView height={120} backgroundColor='transparent' />
      </ScrollView> */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
  },
});
