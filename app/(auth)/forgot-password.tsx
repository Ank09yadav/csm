import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, } from 'react-native';
import { useRouter, } from 'expo-router';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import { authService } from '../../services/authService';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email');
            return;
        }

        setLoading(true);
        try {
            await authService.forgotPassword(email);
            // Pass the email to the next screen via params
            router.push({ pathname: '/(auth)/verify-otp' as any, params: { email } });
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Forgot Password"
            subtitle="Enter your email to receive an OTP"
        >
            <AuthInput
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                iconName="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <AuthButton
                title="Send OTP"
                onPress={handleSendOtp}
                loading={loading}
            />

            <View style={styles.footer}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.footerLink}>Back to Login</Text>
                </TouchableOpacity>
            </View>
        </AuthLayout>
    );
}

const styles = StyleSheet.create({
    footer: {
        alignItems: 'center',
        marginTop: 24,
    },
    footerLink: {
        color: '#4A00E0',
        fontWeight: 'bold',
    },
});
