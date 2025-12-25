import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router'; // Move usage to top level
import {
    StyleSheet,
    TextInput,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    BackHandler
} from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const Profile = () => {
    // 1. Correctly initialize hooks at the top level
    const router = useRouter();
    const { user, isLoaded } = useUser();
    const { signOut } = useAuth();
    const insets = useSafeAreaInsets();

    const [about, setAbout] = useState('');
    const [college, setCollege] = useState('');
    const [loading, setLoading] = useState(false);

    //Fixed Sign Out Function
    const onSignOutPress = async () => {
        try {
            setLoading(true);
            await signOut();
            router.replace('/(auth)/sign-in');
        } catch (error) {
            console.error("Error signing out", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const backAction = () => {
            router.replace('/(home)'); // Always go back to Home
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, []);
    const updateDetails = async () => {
        // Implementation here
    };

    if (!isLoaded) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#2e78b7" />
                <Text style={{ marginTop: 10 }}>Loading details...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1, backgroundColor: '#F5F7FA' }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 100,

                }}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets={true}
            >
                <View style={styles.content}>
                    <Text style={styles.header}>Edit Profile</Text>

                    <Text style={styles.label}>Email Address</Text>
                    <View style={[styles.input, styles.disabledInput]}>
                        <Text style={styles.disabledText}>{user?.primaryEmailAddress?.emailAddress}</Text>
                    </View>

                    <Text style={styles.label}>About You</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder='Write about yourself...'
                        placeholderTextColor="#999"
                        value={about}
                        onChangeText={setAbout}
                        multiline
                        numberOfLines={4}
                    />

                    <Text style={styles.label}>College</Text>
                    <TextInput
                        style={styles.input}
                        placeholder='Enter your college name'
                        placeholderTextColor="#999"
                        value={college}
                        onChangeText={setCollege}
                    />

                    <Text style={styles.label}>Total Reports</Text>
                    <View style={[styles.input, styles.disabledInput]}>
                        <Text style={styles.disabledText}>0</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && { opacity: 0.7 }]}
                        onPress={updateDetails}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Ionicons name="save-outline" size={20} color="white" style={{ marginRight: 8 }} />
                                <Text style={styles.buttonText}>Save Changes</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#d9534f', marginTop: 15 }]}
                        onPress={onSignOutPress}
                    >
                        <Ionicons name='log-out-outline' size={20} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.buttonText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Profile;

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    label: { fontSize: 14, color: '#666', fontWeight: '600', marginBottom: 8, marginTop: 15 },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#E1E8ED',
        borderRadius: 10,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        fontSize: 16,
        color: '#333',
        justifyContent: 'center',
    },
    disabledInput: { backgroundColor: '#F0F3F5', borderColor: '#D1D9E0' },
    disabledText: { color: '#777' },
    textArea: { height: 100, textAlignVertical: 'top', paddingVertical: 12 },
    button: {
        backgroundColor: '#2e78b7',
        height: 55,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        elevation: 3,
    },
    buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});