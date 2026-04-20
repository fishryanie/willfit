import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { DashboardHeader } from 'components/dashboard/dashboard-header';
import { MetricGridCard } from 'components/dashboard/metric-grid-card';
import { MetricChips } from 'components/dashboard/metric-chips';
import { ThemedView } from 'components/themed-view';

export default function HomeScreen() {
  return (
    <ThemedView flex>
      <DashboardHeader name="Sofia" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <MetricChips />

        <View style={styles.metricRow}>
          <MetricGridCard
            title="Calories"
            value="5,839"
            unit="kcal"
            progress={0.7}
            progressColor="#222"
            icon="flame"
            iconColor="#222"
          />
          <MetricGridCard
            title="Water"
            value="1,200"
            unit="ml"
            progress={0.4}
            progressColor="#222"
            icon="water"
            iconColor="#222"
          />
        </View>

        <View style={styles.metricRow}>
          <MetricGridCard
            title="Sleep"
            value="7.30"
            unit="hrs"
            progress={0.8}
            progressColor="#222"
            icon="moon"
            iconColor="#222"
          />
          <MetricGridCard
            title="Weight"
            value="92"
            unit="kg"
            progress={0.6}
            progressColor="#222"
            icon="barbell"
            iconColor="#222"
          />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
});
