import { FlatList, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { History, MapPin, ChevronRight, Calendar, Timer, Activity } from 'lucide-react-native';

import { ThemedText, ThemedView } from 'components/base';
import { storage } from 'utils/storage';
import { formatDistance, formatDuration } from 'components/map/route-utils';

type RouteChoice = {
  id: string;
  title: string;
  distanceKm: number;
  elevationM: number;
  estimatedMinutes: number;
  coordinates?: Coordinate[];
  savedAt?: string;
  source: 'generated' | 'saved';
};

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [history, setHistory] = useState<RouteChoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const value = await storage.getItem('willfit:saved-routes');
      if (value) {
        const parsed = JSON.parse(value) as RouteChoice[];
        setHistory(parsed.filter(r => r.source === 'saved').sort((a, b) => 
          new Date(b.savedAt || 0).getTime() - new Date(a.savedAt || 0).getTime()
        ));
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const renderItem = ({ item }: { item: RouteChoice }) => {
    const date = item.savedAt ? new Date(item.savedAt).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'N/A';

    return (
      <TouchableOpacity activeOpacity={0.8} style={styles.card}>
        <ThemedView row gap={16} backgroundColor="transparent">
          <ThemedView square={54} radius={12} backgroundColor="#F3F4F6" contentCenter>
            <Activity size={24} color="#FF8A00" />
          </ThemedView>
          
          <ThemedView flex backgroundColor="transparent" gap={4}>
            <ThemedText fontSize={17} fontWeight="900" color="#111111" numberOfLines={1}>
              {item.title}
            </ThemedText>
            
            <ThemedView row itemsCenter gap={4} backgroundColor="transparent">
              <Calendar size={12} color="#737780" />
              <ThemedText fontSize={12} color="#737780">
                {date}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ChevronRight size={20} color="#C8CCD2" />
        </ThemedView>

        <ThemedView row style={styles.statsRow} backgroundColor="transparent">
          <ThemedView flex backgroundColor="transparent">
            <ThemedText fontSize={18} fontWeight="900" color="#111111">
              {formatDistance(item.distanceKm * 1000)}
            </ThemedText>
            <ThemedText fontSize={11} color="#737780" fontWeight="700">Distance</ThemedText>
          </ThemedView>
          
          <ThemedView flex backgroundColor="transparent">
            <ThemedText fontSize={18} fontWeight="900" color="#111111">
              {formatDuration(item.estimatedMinutes * 60)}
            </ThemedText>
            <ThemedText fontSize={11} color="#737780" fontWeight="700">Duration</ThemedText>
          </ThemedView>

          <ThemedView flex backgroundColor="transparent">
            <ThemedText fontSize={18} fontWeight="900" color="#111111">
              {item.elevationM}m
            </ThemedText>
            <ThemedText fontSize={11} color="#737780" fontWeight="700">Elevation</ThemedText>
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView flex backgroundColor="#F7F7F8">
      <ThemedView 
        style={[styles.header, { paddingTop: insets.top + 20 }]} 
        backgroundColor="#FFFFFF"
      >
        <ThemedView row itemsCenter gap={12} backgroundColor="transparent">
          <ThemedView square={40} radius={20} backgroundColor="#FFF4E6" contentCenter>
            <History size={20} color="#FF8A00" />
          </ThemedView>
          <ThemedText fontSize={28} fontWeight="900" color="#111111">
            History
          </ThemedText>
        </ThemedView>
        <ThemedText fontSize={14} color="#737780" marginTop={4}>
          Lịch sử các hoạt động thể thao của bạn.
        </ThemedText>
      </ThemedView>

      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={fetchHistory}
        ListEmptyComponent={
          <ThemedView flex contentCenter style={styles.emptyContainer}>
            <MapPin size={48} color="#D1D5DB" />
            <ThemedText fontSize={16} fontWeight="700" color="#9CA3AF" marginTop={16}>
              Chưa có hoạt động nào được lưu.
            </ThemedText>
            <ThemedText fontSize={14} color="#9CA3AF" marginTop={4} textAlign="center">
              Hãy bắt đầu một buổi tập để thấy lịch sử tại đây.
            </ThemedText>
          </ThemedView>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  statsRow: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  emptyContainer: {
    marginTop: 100,
    paddingHorizontal: 40,
  }
});
