import { Stack } from 'expo-router';
import { AppHeader } from '../../components/AppHeader';

export default function RoomsLayout() {
  return (
    <Stack
      screenOptions={{
        header: () => <AppHeader />,
      }}
    />
  );
}
