import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
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
    BackHandler,
    Image,
    Alert
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

const Profile = () => {
    const router = useRouter();
    const { user, signOut, isLoading: authLoading } = useAuth();
    const insets = useSafeAreaInsets();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [about, setAbout] = useState('');
    const [college, setCollege] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [userStats, setUserStats] = useState({
        reports: 0,
        isPremium: false,
        username: ''
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setFetching(true);
            const response = await api('/user', { authenticated: true });
            const userData = response.user;

            // Populate fields
            setName(userData.name || '');
            setEmail(userData.email || '');
            setAbout(userData.about || '');
            setCollege(userData.college || '');

            // Set read-only stats
            setUserStats({
                reports: userData.reports || 0,
                isPremium: userData.isPremium || false,
                username: userData.username
            });

        } catch (error: any) {
            console.error("Failed to fetch profile:", error);

            // Handle "User not found" (404) or "Unauthorized" (401)
            // This happens if the user was deleted/banned or environment switched (Local vs Prod)
            if (error.message?.includes('User not found') || error.message?.includes('Unauthorized')) {
                console.log("Auto-logout triggered due to:", error.message);
                Alert.alert(
                    "Session Expired",
                    "Your user account was not found. Please sign in again.",
                    [{ text: "OK", onPress: () => signOut() }]
                );
            }

            // Fallback to local user context if API fails but not critical
            if (user) {
                setUserStats(prev => ({ ...prev, username: user.username }));
            }
        } finally {
            setFetching(false);
        }
    };

    const onSignOutPress = async () => {
        try {
            setLoading(true);
            await signOut();
        } catch (error) {
            console.error("Error signing out", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const backAction = () => {
            router.replace('/(home)');
            return true;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, []);

    const updateDetails = async () => {
        setLoading(true);
        try {
            const payload = {
                name,
                email,
                about,
                college
            };

            await api('/user', {
                method: 'POST',
                authenticated: true,
                body: JSON.stringify(payload)
            });

            Alert.alert('Success', 'Profile updated successfully');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || fetching) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#4A00E0" />
                <Text style={{ marginTop: 10, color: '#666' }}>Loading details...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1, backgroundColor: '#F5F7FA' }}
        >
            <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: `https://ui-avatars.com/api/?name=${userStats.username}&background=4A00E0&color=fff&size=128` }}
                            style={styles.avatar}
                        />
                        {userStats.isPremium && (
                            <View style={styles.badge}>
                                <Ionicons name="star" size={14} color="white" />
                            </View>
                        )}
                    </View>
                    <Text style={styles.username}>@{userStats.username}</Text>
                    <Text style={styles.membershipStatus}>
                        {userStats.isPremium ? 'Premium Member' : 'Free Member'}
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    {/* Read-Only Stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{userStats.reports}</Text>
                            <Text style={styles.statLabel}>Reports</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{userStats.isPremium ? 'PRO' : 'FREE'}</Text>
                            <Text style={styles.statLabel}>Plan</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Personal Details</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Your Name"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="email@example.com"
                            placeholderTextColor="#999"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>College / Institution</Text>
                        <TextInput
                            style={styles.input}
                            value={college}
                            onChangeText={setCollege}
                            placeholder="University Name"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>About Me</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={about}
                            onChangeText={setAbout}
                            placeholder="Tell us about yourself..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    <Text style={styles.sectionTitle}>Account Settings</Text>

                    <View style={styles.readOnlyField}>
                        <Text style={styles.label}>Username (Cannot be changed)</Text>
                        <Text style={styles.readOnlyText}>@{userStats.username}</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, loading && { opacity: 0.7 }]}
                        onPress={updateDetails}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.signOutButton}
                        onPress={onSignOutPress}
                    >
                        <Ionicons name='log-out-outline' size={20} color="#FF3B30" style={{ marginRight: 8 }} />
                        <Text style={styles.signOutText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Profile;

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' },

    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },

    avatarSection: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: '#fff',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 4,
        marginBottom: 24,
    },
    avatarContainer: { position: 'relative', marginBottom: 16 },
    avatar: { width: 112, height: 112, borderRadius: 56, backgroundColor: '#E1E8ED' },
    badge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#FFD700',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    username: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
    membershipStatus: { fontSize: 13, color: '#4A00E0', marginTop: 4, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

    formContainer: { paddingHorizontal: 20 },

    statsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statValue: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    statLabel: { fontSize: 12, color: '#888', marginTop: 4, fontWeight: '500' },

    sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 16, marginTop: 8 },

    inputGroup: { marginBottom: 20 },
    label: { fontSize: 13, color: '#666', fontWeight: '600', marginBottom: 8, marginLeft: 4 },
    input: {
        height: 56,
        borderWidth: 1,
        borderColor: '#E1E8ED',
        borderRadius: 16,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        fontSize: 16,
        color: '#333',
    },
    textArea: { height: 120, textAlignVertical: 'top', paddingTop: 16 },

    readOnlyField: {
        marginBottom: 28,
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E1E8ED',
    },
    readOnlyText: { fontSize: 16, color: '#555', fontWeight: '500' },

    saveButton: {
        backgroundColor: '#4A00E0',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#4A00E0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

    signOutButton: {
        height: 56,
        borderRadius: 28,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF0F0',
        borderWidth: 1,
        borderColor: '#FFE0E0',
    },
    signOutText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' }
});