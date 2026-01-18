import React, { useState } from 'react';
import { Colors } from '../../constants/Colors';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen() {
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth();
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                username,
                password
            };

            const response = await authService.register(payload);

            if (response.token && response.user) {
                // Auto-login
                await signIn(response.token, response.user);
            } else if (response.success) {
                Alert.alert('Success', 'Account created! Please sign in.');
                router.replace('/(auth)/login');
            }
        } catch (error: any) {
            Alert.alert('Registration Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create Account"
            subtitle="sign up to continue"
        >
            <AuthInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                iconName="person-outline"
                autoCapitalize="none"
            />

            <AuthInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                iconName="lock-closed-outline"
                isPassword
            />

            <AuthInput
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                iconName="lock-closed-outline"
                isPassword
            />

            <AuthButton
                title="Sign Up"
                onPress={handleRegister}
                loading={loading}
            />

            <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                    <Text style={styles.footerLink}>Sign In</Text>
                </TouchableOpacity>
            </View>
        </AuthLayout>
    );
}

const styles = StyleSheet.create({
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        color: Colors.textSecondary,
    },
    footerLink: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
});
