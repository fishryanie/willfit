import React from 'react';
import { Droplets, Dumbbell, Flame, Moon, Weight, type LucideIcon } from 'lucide-react-native';
import { Card, ThemedText, ThemedView } from 'components/base';
import { useThemeColor } from 'store/use-theme-store';

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
  const iconTintColor = useThemeColor({}, 'icon');
  const Icon = METRIC_ICONS[icon];

  return (
    <Card style={{ borderRadius: 24, flex: 1, minHeight: 120, justifyContent: 'center' }}>
      <ThemedView backgroundColor='transparent' row alignItems='center' justifyContent='space-between'>
        <ThemedView backgroundColor='transparent' row alignItems='center' gap={16}>
          <ThemedView square={48} radius={24} backgroundColor='rgba(150, 150, 150, 0.1)' contentCenter>
            <Icon size={24} color={iconColor || iconTintColor} strokeWidth={2.1} />
          </ThemedView>
          <ThemedView backgroundColor='transparent'>
            <ThemedText fontSize={15} fontWeight='600' marginBottom={4}>
              {title}
            </ThemedText>
            <ThemedView backgroundColor='transparent' row alignItems='baseline' gap={4}>
              <ThemedText fontSize={20} fontWeight='700'>
                {value}
              </ThemedText>
              <ThemedText fontSize={14} opacity={0.6}>
                {unit}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Card>
  );
}
