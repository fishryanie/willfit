import { ViewTheme } from 'components/base';
import { theme } from 'theme';
import { AppMapContainer } from './components/Map';
import FinishRecord from './components/FinishRecord';
import IntraRecord from './components/IntraRecord';
import PreRecord from './components/PreRecord';
import { useRouteRecordLifecycle, useRouteRecordStore } from './store/use-route-record-store';

export default function RouteSuggestedEntryScreen() {
  useRouteRecordLifecycle();

  return (
    <ViewTheme flex backgroundColor={theme.colors.background}>
      <AppMapContainer>
        <RouteOverlay />
      </AppMapContainer>
    </ViewTheme>
  );
}

function RouteOverlay() {
  const phase = useRouteRecordStore(state => state.phase);

  if (phase === 'intra') {
    return <IntraRecord />;
  }

  if (phase === 'finish') {
    return <FinishRecord />;
  }

  return <PreRecord />;
}
