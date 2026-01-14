import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import { authService } from '../../services/authService';

export default function VerifyOtpScreen() {
    const router = useRouter();
    const { email } = useLocalSearchParams<{ email: string }>();

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        if (!otp) {
            Alert.alert('Error', 'Please enter the OTP');
            return;
        }
        if (!email) {
            Alert.alert('Error', 'Email missing from flow');
            return;
        }

        setLoading(true);
        try {
            await authService.verifyOtp(email, otp);
            router.push({ pathname: '/(auth)/reset-password' as any, params: { email, otp } });
        } catch (error: any) {
            Alert.alert('Verification Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Verify OTP"
            subtitle={`Enter the code sent to ${email}`}
        >
            <AuthInput
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChangeText={setOtp}
                iconName="keypad-outline"
                keyboardType="number-pad"
                maxLength={6}
            />

            <AuthButton
                title="Verify"
                onPress={handleVerify}
                loading={loading}
            />

            <View style={styles.footer}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.footerLink}>Back</Text>
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
