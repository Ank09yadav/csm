import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import { authService } from '../../services/authService';

export default function ResetPasswordScreen() {
    const router = useRouter();
    const { email, otp } = useLocalSearchParams<{ email: string, otp: string }>();

    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!newPassword) {
            Alert.alert('Error', 'Please enter a new password');
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword({ email: email!, otp: otp!, newPassword });
            Alert.alert('Success', 'Password has been reset. Please login.');
            router.replace('/(auth)/login');
        } catch (error: any) {
            Alert.alert('Date Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Reset Password"
            subtitle="Create a strong, unique password"
        >
            <AuthInput
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                iconName="lock-closed-outline"
                isPassword
            />

            <AuthButton
                title="Reset Password"
                onPress={handleReset}
                loading={loading}
            />
        </AuthLayout>
    );
}
