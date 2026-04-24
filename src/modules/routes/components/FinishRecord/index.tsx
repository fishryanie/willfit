import { Check, X } from 'lucide-react-native';
import { Pressable, ScrollView } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Path, Polyline, Stop } from 'react-native-svg';
import { TextTheme, ViewTheme } from 'components/base';
import { theme } from 'theme';
import { useRouteRecordStore } from '../../store/use-route-record-store';
import { formatDistanceKilometers, formatDurationClock } from '../../utils';

const elevationPreview = [4, 5, 5, 6, 8, 7, 6, 9, 8, 10, 13, 12, 15, 16, 18, 17, 22];

export default function FinishRecord() {
  const finishedRecord = useRouteRecordStore(state => state.finishedRecord);
  const closeFinishRecord = useRouteRecordStore(state => state.closeFinishRecord);
  const saveFinishedRoute = useRouteRecordStore(state => state.saveFinishedRoute);

  if (!finishedRecord) {
    return null;
  }

  return (
    <ViewTheme absoluteFillObject backgroundColor='rgba(5,11,24,0.94)' safePaddingTop={10} safePaddingBottom={12}>
      <ViewTheme row justifyContent='space-between' alignItems='center' backgroundColor='transparent' paddingHorizontal={16} marginBottom={12}>
        <Pressable onPress={closeFinishRecord}>
          <ViewTheme
            width={44}
            height={44}
            radius={22}
            alignItems='center'
            justifyContent='center'
            borderWidth={1}
            borderColor='rgba(255,255,255,0.12)'
            backgroundColor='rgba(8,14,28,0.8)'>
            <X size={20} color={theme.colors.textPrimary} />
          </ViewTheme>
        </Pressable>

        <TextTheme color='rgba(255,255,255,0.78)' fontSize={14} lineHeight={18} fontWeight='700'>
          Hoàn tất buổi chạy
        </TextTheme>

        <ViewTheme width={44} height={44} backgroundColor='transparent' />
      </ViewTheme>

      <ScrollView contentContainerStyle={scrollContent} showsVerticalScrollIndicator={false}>
        <ViewTheme
          radius={28}
          borderWidth={1}
          borderColor='rgba(255,255,255,0.08)'
          backgroundColor='rgba(8,14,28,0.92)'
          padding={18}
          shadowColor='#000'
          shadowOpacity={0.28}
          shadowOffset={{ width: 0, height: 18 }}
          shadowRadius={24}>
          <ViewTheme alignItems='center' backgroundColor='transparent'>
            <ViewTheme width={94} height={94} alignItems='center' justifyContent='center' backgroundColor='transparent'>
              {confettiPieces.map(piece => (
                <ViewTheme
                  key={piece.id}
                  position='absolute'
                  width={piece.width}
                  height={piece.height}
                  radius={3}
                  backgroundColor={piece.color}
                  transform={[{ rotate: `${piece.rotate}deg` }]}
                  top={piece.top}
                  left={piece.left}
                />
              ))}

              <ViewTheme width={70} height={70} radius={35} backgroundColor='rgba(16,185,129,0.18)' alignItems='center' justifyContent='center'>
                <ViewTheme width={50} height={50} radius={25} backgroundColor='#34D399' alignItems='center' justifyContent='center'>
                  <Check size={26} color='#FFFFFF' strokeWidth={3} />
                </ViewTheme>
              </ViewTheme>
            </ViewTheme>

            <TextTheme color={theme.colors.textPrimary} fontSize={28} lineHeight={34} fontWeight='800' marginTop={6}>
              Hoàn thành!
            </TextTheme>
            <TextTheme color='rgba(255,255,255,0.72)' fontSize={14} lineHeight={20} fontWeight='600' textAlign='center' marginTop={6}>
              Tuyệt vời! Bạn đã hoàn thành cung đường. Có thể lưu lại để dùng cho lần chạy sau.
            </TextTheme>
          </ViewTheme>

          <ViewTheme backgroundColor='transparent' marginTop={18} gap={12}>
            <ViewTheme row gap={12} backgroundColor='transparent'>
              <SummaryCard title='Khoảng cách' value={formatDistanceKilometers(finishedRecord.distanceMeters).replace(' km', '')} unit='km' />
              <SummaryCard title='Thời gian' value={formatDurationClock(finishedRecord.durationSeconds)} />
            </ViewTheme>

            <ViewTheme row gap={12} backgroundColor='transparent'>
              <SummaryCard title='Pace trung bình' value={finishedRecord.averagePace.replace('/km', '')} unit='/km' />
              <SummaryCard title='Calories ước tính' value={String(finishedRecord.estimatedCalories)} unit='kcal' />
            </ViewTheme>

            <ViewTheme
              radius={20}
              borderWidth={1}
              borderColor='rgba(255,255,255,0.08)'
              backgroundColor='rgba(10,18,34,0.94)'
              padding={16}>
              <TextTheme color='rgba(255,255,255,0.56)' fontSize={14} lineHeight={18} fontWeight='700'>
                Độ cao tích lũy
              </TextTheme>
              <ViewTheme row alignItems='flex-end' backgroundColor='transparent' gap={6} marginTop={10}>
                <TextTheme color={theme.colors.textPrimary} fontSize={28} lineHeight={32} fontWeight='800'>
                  {finishedRecord.elevationGain}
                </TextTheme>
                <TextTheme color='rgba(255,255,255,0.72)' fontSize={17} lineHeight={22} fontWeight='700' marginBottom={2}>
                  m
                </TextTheme>
              </ViewTheme>
              <ViewTheme height={82} marginTop={8} backgroundColor='transparent'>
                <ElevationChart />
              </ViewTheme>
            </ViewTheme>

            <ViewTheme
              radius={20}
              borderWidth={1}
              borderColor='rgba(255,255,255,0.08)'
              backgroundColor='rgba(10,18,34,0.94)'
              padding={16}>
              <TextTheme color='rgba(255,255,255,0.56)' fontSize={14} lineHeight={18} fontWeight='700'>
                Route
              </TextTheme>
              <TextTheme color={theme.colors.textPrimary} fontSize={17} lineHeight={22} fontWeight='700' marginTop={10}>
                {finishedRecord.routeName}
              </TextTheme>
            </ViewTheme>

            <ViewTheme row gap={12} backgroundColor='transparent' marginTop={4}>
              <Pressable onPress={closeFinishRecord} style={secondaryActionButton}>
                <TextTheme color={theme.colors.textPrimary} fontSize={15} lineHeight={20} fontWeight='700'>
                  Thoát
                </TextTheme>
              </Pressable>

              <Pressable onPress={() => void saveFinishedRoute()} style={primaryActionButton}>
                <TextTheme color={theme.colors.textPrimary} fontSize={15} lineHeight={20} fontWeight='700'>
                  Lưu lộ trình
                </TextTheme>
              </Pressable>
            </ViewTheme>
          </ViewTheme>
        </ViewTheme>
      </ScrollView>
    </ViewTheme>
  );
}

function SummaryCard({ title, value, unit }: { title: string; value: string; unit?: string }) {
  return (
    <ViewTheme
      flex={1}
      radius={20}
      borderWidth={1}
      borderColor='rgba(255,255,255,0.08)'
      backgroundColor='rgba(10,18,34,0.94)'
      padding={16}>
      <ViewTheme row alignItems='flex-end' backgroundColor='transparent' gap={5}>
        <TextTheme color={theme.colors.textPrimary} fontSize={24} lineHeight={28} fontWeight='800'>
          {value}
        </TextTheme>
        {unit ? (
          <TextTheme color='rgba(255,255,255,0.72)' fontSize={15} lineHeight={20} fontWeight='700' marginBottom={2}>
            {unit}
          </TextTheme>
        ) : null}
      </ViewTheme>
      <TextTheme color='rgba(255,255,255,0.72)' fontSize={13} lineHeight={18} fontWeight='600' marginTop={8}>
        {title}
      </TextTheme>
    </ViewTheme>
  );
}

function ElevationChart() {
  const points = elevationPreview
    .map((value, index) => {
      const x = (index / (elevationPreview.length - 1)) * 280;
      const y = 70 - value * 2;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPath = `M0,80 L${elevationPreview
    .map((value, index) => {
      const x = (index / (elevationPreview.length - 1)) * 280;
      const y = 70 - value * 2;
      return `${x},${y}`;
    })
    .join(' L')} L280,80 Z`;

  return (
    <Svg width='100%' height='100%' viewBox='0 0 280 80'>
      <Defs>
        <SvgLinearGradient id='elevationGradient' x1='0' y1='0' x2='0' y2='1'>
          <Stop offset='0%' stopColor='rgba(52,211,153,0.45)' />
          <Stop offset='100%' stopColor='rgba(52,211,153,0.02)' />
        </SvgLinearGradient>
      </Defs>
      <Path d={areaPath} fill='url(#elevationGradient)' />
      <Polyline points={points} fill='none' stroke='#34D399' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' />
    </Svg>
  );
}

const scrollContent = {
  paddingHorizontal: 16,
  paddingBottom: 20,
} as const;

const secondaryActionButton = {
  flex: 1,
  minHeight: 52,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.14)',
  backgroundColor: 'rgba(255,255,255,0.06)',
  alignItems: 'center',
  justifyContent: 'center',
} as const;

const primaryActionButton = {
  flex: 1,
  minHeight: 52,
  borderRadius: 16,
  backgroundColor: theme.colors.primary,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: theme.colors.primary,
  shadowOpacity: 0.24,
  shadowOffset: { width: 0, height: 10 },
  shadowRadius: 18,
  elevation: 10,
} as const;

const confettiPieces = [
  { id: 'c1', top: 10, left: 8, width: 8, height: 16, rotate: 18, color: '#F59E0B' },
  { id: 'c2', top: 18, left: 24, width: 7, height: 10, rotate: -20, color: '#3B82F6' },
  { id: 'c3', top: 6, left: 54, width: 10, height: 12, rotate: -14, color: '#8B5CF6' },
  { id: 'c4', top: 16, left: 72, width: 8, height: 8, rotate: 12, color: '#14B8A6' },
  { id: 'c5', top: 10, left: 98, width: 10, height: 16, rotate: 22, color: '#EF4444' },
  { id: 'c6', top: 28, left: 114, width: 8, height: 8, rotate: -10, color: '#22D3EE' },
] as const;
