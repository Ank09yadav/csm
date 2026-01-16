import { useSocketNotifications } from '../hooks/useSocketNotifications';

export default function NotificationManager() {
    // This component is now a pure logic container using the hook.
    // This separation allows the hook to be reused or tested independently.
    useSocketNotifications();
    return null;
}
