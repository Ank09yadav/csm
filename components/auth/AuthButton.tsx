import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AuthButtonProps extends TouchableOpacityProps {
    title: string;
    loading?: boolean;
    variant?: 'primary' | 'secondary';
}

export default function AuthButton({ title, loading, variant = 'primary', style, disabled, ...props }: AuthButtonProps) {
    const isPrimary = variant === 'primary';

    if (isPrimary) {
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                disabled={loading || disabled}
                {...props}
                style={[styles.container, style]}
            >
                <LinearGradient
                    colors={disabled ? ['#ccc', '#999'] : ['#4A00E0', '#8E2DE2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.text}>{title}</Text>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            disabled={loading || disabled}
            style={[styles.secondaryButton, style]}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color="#4A00E0" />
            ) : (
                <Text style={styles.secondaryText}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 56,
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    secondaryButton: {
        width: '100%',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#4A00E0',
        marginTop: 8,
        backgroundColor: 'transparent'
    },
    secondaryText: {
        color: '#4A00E0',
        fontSize: 16,
        fontWeight: '600'
    }
});
