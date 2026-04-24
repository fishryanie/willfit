import { TextTheme, ViewTheme } from 'components/base';
import { useState } from 'react';
import { theme } from 'theme';
import { appDialog } from 'utils/app-dialog';
import { useRouteRecordStore } from '../../store/use-route-record-store';
import { formatDistanceKilometers, formatDurationClock, formatLivePace } from '../../utils';
import { calculateRouteDistanceKm } from '../../utils/geo';
import { SlideAction } from '../Shared/SlideAction';

export default function IntraRecord() {
  const finishRecording = useRouteRecordStore(state => state.finishRecording);
  const elapsedSeconds = useRouteRecordStore(state => state.elapsedSeconds);
  const liveCoordinates = useRouteRecordStore(state => state.liveCoordinates);
  const [finishResetKey, setFinishResetKey] = useState(0);

  const distanceMeters = Math.round(calculateRouteDistanceKm(liveCoordinates) * 1000);

  const handleFinishSlide = () => {
    void appDialog
      .confirm({
        title: 'Kết thúc buổi chạy?',
        message: 'Bạn có thể tiếp tục record hoặc hoàn tất ngay để xem tổng kết.',
        confirmLabel: 'Finish luôn',
        cancelLabel: 'Tiếp tục',
        tone: 'danger',
        layout: 'finish-record',
      })
      .then(confirmed => {
        if (confirmed) {
          void finishRecording();
        }

        setFinishResetKey(value => value + 1);
      });
  };

  return (
    <ViewTheme absoluteFillObject backgroundColor='transparent' pointerEvents='box-none'>
      <ViewTheme position='absolute' left={12} right={12} bottom={24} zIndex={50} backgroundColor='transparent' pointerEvents='box-none'>
        <ViewTheme
          radius={24}
          paddingTop={11}
          paddingHorizontal={14}
          paddingBottom={12}
          borderWidth={1}
          borderColor='rgba(255,255,255,0.08)'
          backgroundColor='rgba(8,14,28,0.94)'
          shadowColor='#000'
          shadowOpacity={0.26}
          shadowOffset={{ width: 0, height: 18 }}
          shadowRadius={28}
          marginBottom={12}>
          <ViewTheme row gap={12} justifyContent='space-between' backgroundColor='transparent'>
            <MetricCell value={formatDistanceKilometers(distanceMeters).replace(' km', '')} unit='km' label='Khoảng cách' />
            <ViewTheme width={1} height='100%' backgroundColor='rgba(255,255,255,0.1)' />
            <MetricCell value={formatDurationClock(elapsedSeconds)} unit='' label='Thời gian' />
            <ViewTheme width={1} height='100%' backgroundColor='rgba(255,255,255,0.1)' />
            <MetricCell value={formatLivePace(distanceMeters, elapsedSeconds).replace('/km', '')} unit='/km' label='Pace hiện tại' />
          </ViewTheme>
        </ViewTheme>

        <SlideAction label='Trượt để kết thúc' variant='danger' onComplete={handleFinishSlide} resetKey={finishResetKey} />
      </ViewTheme>
    </ViewTheme>
  );
}

function MetricCell({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <ViewTheme flex={1} backgroundColor='transparent' minHeight={70} contentCenter>
      <ViewTheme row alignItems='flex-end' backgroundColor='transparent' gap={4}>
        <TextTheme color={theme.colors.textPrimary} fontSize={18} lineHeight={22} fontWeight='800' letterSpacing={0.1}>
          {value}
        </TextTheme>
        {unit ? (
          <TextTheme color='rgba(255,255,255,0.7)' fontSize={11} lineHeight={14} fontWeight='700' marginBottom={2}>
            {unit}
          </TextTheme>
        ) : null}
      </ViewTheme>
      <TextTheme color='rgba(255,255,255,0.68)' fontSize={10} lineHeight={13} fontWeight='600' marginTop={4}>
        {label}
      </TextTheme>
    </ViewTheme>
  );
}
