import { Stack } from 'expo-router';

export default function PrivateChatLayout() {
    return (
        <Stack>
            <Stack.Screen name="[privateChat]" options={{ headerShown: true }} />
        </Stack>
    );
}
