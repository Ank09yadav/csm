import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '../../constants/Colors';

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
                    colors={disabled ? [Colors.textMuted, Colors.surfaceHighlight] : [Colors.primary, Colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                >
                    {loading ? (
                        <ActivityIndicator color={Colors.text} />
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
                <ActivityIndicator color={Colors.primary} />
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
        color: Colors.text,
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
        borderColor: Colors.primary,
        marginTop: 8,
        backgroundColor: 'transparent'
    },
    secondaryText: {
        color: Colors.primary,
        fontSize: 16,
        fontWeight: '600'
    }
});
