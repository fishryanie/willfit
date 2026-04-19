import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Droplets, Dumbbell, Flame, Moon, Weight, type LucideIcon } from 'lucide-react-native';
import { ThemedText } from 'components/themed-text';
import { useThemeColor } from 'hooks/use-theme-color';

interface MetricGridCardProps {
  title: string;
  value: string;
  unit: string;
  goal?: string;
  progress: number; // 0 to 1
  progressColor: string;
  icon: MetricIconName;
  iconColor: string;
}

type MetricIconName = 'barbell' | 'flame' | 'moon' | 'water' | 'weight';

const METRIC_ICONS: Record<MetricIconName, LucideIcon> = {
  barbell: Dumbbell,
  flame: Flame,
  moon: Moon,
  water: Droplets,
  weight: Weight,
};

export function MetricGridCard({
  title,
  value,
  unit,
  goal,
  progress,
  progressColor,
  icon,
  iconColor,
}: MetricGridCardProps) {
  const cardBg = useThemeColor({}, 'card');
  const iconTintColor = useThemeColor({}, 'icon');
  const Icon = METRIC_ICONS[icon];

  return (
    <View style={[styles.container, { backgroundColor: cardBg }]}>
      <View style={styles.content}>
        <View style={styles.infoSection}>
          <View style={styles.iconWrapper}>
            <Icon size={24} color={iconColor || iconTintColor} strokeWidth={2.1} />
          </View>
          <View>
            <ThemedText style={styles.title}>{title}</ThemedText>
            <View style={styles.valueRow}>
              <ThemedText style={styles.value}>{value}</ThemedText>
              <ThemedText style={styles.unit}>{unit}</ThemedText>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 16,
    flex: 1,
    minHeight: 120,
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
  },
  unit: {
    fontSize: 14,
    opacity: 0.6,
  },
});
