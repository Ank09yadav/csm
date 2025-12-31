import { Stack } from 'expo-router';
import { AppHeader } from '../../components/AppHeader';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        header: () => <AppHeader />,
      }}
    />
  );
}
