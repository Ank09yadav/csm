import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
    const router = useRouter();
    const { signIn } = useAuth();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!identifier || !password) {
            Alert.alert('Error', 'Please enter username/email and password');
            return;
        }

        setLoading(true);
        try {
            const isEmail = identifier.includes('@');
            const payload = {
                username: !isEmail ? identifier : undefined,
                email: isEmail ? identifier : undefined,
                password
            };

            const response = await authService.login(payload as any);

            if (response.token && response.user) {
                await signIn(response.token, response.user);
                // AuthContext usually handles redirect, but we can double check
            }
        } catch (error: any) {
            Alert.alert('Login Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Sign in to continue to your account"
        >
            <AuthInput
                placeholder="Username or Email"
                value={identifier}
                onChangeText={setIdentifier}
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

            <TouchableOpacity
                onPress={() => router.push('/(auth)/forgot-password')}
                style={styles.forgotPassword}
            >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <AuthButton
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
            />

            <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                    <Text style={styles.footerLink}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </AuthLayout>
    );
}

const styles = StyleSheet.create({
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: '#4A00E0',
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        color: '#666',
    },
    footerLink: {
        color: '#4A00E0',
        fontWeight: 'bold',
    },
});
