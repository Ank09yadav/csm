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
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

import { Colors } from '../../constants/Colors';

const Profile = () => {
    // ... existing logic ...
    const router = useRouter();
    const { user, signOut, isLoading: authLoading, updateUser } = useAuth();
    const insets = useSafeAreaInsets();

    // ... rest of state and effects same as original ...
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [about, setAbout] = useState('');
    const [college, setCollege] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [userStats, setUserStats] = useState({
        reports: 0,
        isPremium: false,
        username: '',
        image: ''
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setFetching(true);
            const response = await api('/user', { authenticated: true });
            const userData = response.user;

            // Update Global Context to be sure
            updateUser(userData);

            // Populate fields
            setName(userData.name || '');
            setEmail(userData.email || '');
            setAbout(userData.about || '');
            setCollege(userData.college || '');

            // Set read-only stats
            setUserStats({
                reports: userData.reports || 0,
                isPremium: userData.isPremium || false,
                username: userData.username,
                image: userData.image // Add image to stats/state
            });

        } catch (error: any) {
            console.error("Failed to fetch profile:", error);

            if (error.message?.includes('User not found') || error.message?.includes('Unauthorized')) {
                console.log("Auto-logout triggered due to:", error.message);
                Alert.alert(
                    "Session Expired",
                    "Your user account was not found. Please sign in again.",
                    [{ text: "OK", onPress: () => signOut() }]
                );
            }

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

            const response = await api('/user', {
                method: 'POST',
                authenticated: true,
                body: JSON.stringify(payload)
            });

            if (response.user) {
                updateUser(response.user);
            } else {
                updateUser(payload);
            }

            Alert.alert('Success', 'Profile updated successfully');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets && result.assets[0].base64) {
            handleImageUpload(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const handleImageUpload = async (base64Image: string) => {
        try {
            setUploading(true);
            const response = await api('/user/profile-pic', {
                method: 'POST',
                authenticated: true,
                body: JSON.stringify({ image: base64Image })
            });

            if (response.user) {
                updateUser(response.user);
                fetchUserData();
                Alert.alert("Success", "Profile picture updated!");
            }
        } catch (e: any) {
            Alert.alert("Error", e.message || "Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    if (authLoading || fetching) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={{ marginTop: 10, color: Colors.textSecondary }}>Loading details...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1, backgroundColor: Colors.background }}
        >
            <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
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
                        <TouchableOpacity onPress={pickImage} disabled={uploading} activeOpacity={0.7}>
                            <Image
                                source={{ uri: userStats.image || `https://ui-avatars.com/api/?name=${userStats.username}&background=random&color=fff&size=128` }}
                                style={[styles.avatar, uploading && { opacity: 0.5 }]}
                            />
                            <View style={styles.editIconBadge}>
                                {uploading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="camera" size={20} color="#fff" />}
                            </View>
                        </TouchableOpacity>

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
                            placeholderTextColor={Colors.textMuted}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="email@example.com"
                            placeholderTextColor={Colors.textMuted}
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
                            placeholderTextColor={Colors.textMuted}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>About Me</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={about}
                            onChangeText={setAbout}
                            placeholder="Tell us about yourself..."
                            placeholderTextColor={Colors.textMuted}
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
                        <Ionicons name='log-out-outline' size={20} color={Colors.error} style={{ marginRight: 8 }} />
                        <Text style={styles.signOutText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Profile;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },

    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },

    avatarSection: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: Colors.surface,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        marginBottom: 24,
    },
    avatarContainer: { position: 'relative', marginBottom: 16 },
    avatar: {
        width: 112,
        height: 112,
        borderRadius: 56,
        backgroundColor: Colors.surfaceHighlight,
        borderWidth: 4,
        borderColor: Colors.primary
    },
    badge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.warning,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: Colors.surface,
        zIndex: 2
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: Colors.surface,
        zIndex: 1
    },
    username: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
    membershipStatus: { fontSize: 13, color: Colors.primary, marginTop: 4, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

    formContainer: { paddingHorizontal: 20 },

    statsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    statValue: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
    statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, fontWeight: '500' },

    sectionTitle: { fontSize: 17, fontWeight: 'bold', color: Colors.text, marginBottom: 16, marginTop: 8 },

    inputGroup: { marginBottom: 20 },
    label: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
    input: {
        height: 56,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 16,
        paddingHorizontal: 20,
        backgroundColor: Colors.surfaceHighlight,
        fontSize: 16,
        color: Colors.text,
    },
    textArea: { height: 120, textAlignVertical: 'top', paddingTop: 16 },

    readOnlyField: {
        marginBottom: 28,
        backgroundColor: Colors.surfaceHighlight,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        opacity: 0.7
    },
    readOnlyText: { fontSize: 16, color: Colors.text, fontWeight: '500' },

    saveButton: {
        backgroundColor: Colors.primary,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    saveButtonText: { color: Colors.text, fontSize: 18, fontWeight: 'bold' },

    signOutButton: {
        height: 56,
        borderRadius: 28,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)', // Red tint based on Colors.error
        borderWidth: 1,
        borderColor: Colors.error,
    },
    signOutText: { color: Colors.error, fontSize: 16, fontWeight: '600' }
});