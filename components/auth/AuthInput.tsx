import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/Colors';

interface AuthInputProps extends TextInputProps {
    iconName?: keyof typeof Ionicons.glyphMap;
    isPassword?: boolean;
}

export default function AuthInput({ iconName, isPassword, style, ...props }: AuthInputProps) {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
        <View style={styles.container}>
            {iconName && (
                <Ionicons name={iconName} size={20} color={Colors.textSecondary} style={styles.icon} />
            )}
            <TextInput
                style={[styles.input, style]}
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={isPassword && !showPassword}
                {...props}
            />
            {isPassword && (
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={Colors.textSecondary}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceHighlight, // Dark input bg
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: '100%',
        color: Colors.text, // White text
        fontSize: 16,
    },
    eyeIcon: {
        padding: 4,
    }
});
