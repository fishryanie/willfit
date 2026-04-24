import { TextTheme, ViewTheme } from 'components/base';
import { theme } from 'theme';
import { RouteBottomActions } from './RouteBottomActions';
import { RouteSuggestionsCarousel } from './RouteSuggestionsCarousel';
import { SUGGEST_HEADER_BOTTOM } from './constants';

export default function PreRecord() {
  return (
    <ViewTheme absoluteFillObject backgroundColor='transparent' pointerEvents='box-none'>
      <ViewTheme position='absolute' left={12} bottom={SUGGEST_HEADER_BOTTOM} zIndex={30} backgroundColor='transparent'>
        <TextTheme color={theme.colors.textPrimary}>Gợi ý cho bạn</TextTheme>
      </ViewTheme>
      <RouteSuggestionsCarousel />
      <RouteBottomActions />
    </ViewTheme>
  );
}
