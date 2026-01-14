import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AuthInputProps extends TextInputProps {
    iconName?: keyof typeof Ionicons.glyphMap;
    isPassword?: boolean;
}

export default function AuthInput({ iconName, isPassword, style, ...props }: AuthInputProps) {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
        <View style={styles.container}>
            {iconName && (
                <Ionicons name={iconName} size={20} color="#666" style={styles.icon} />
            )}
            <TextInput
                style={[styles.input, style]}
                placeholderTextColor="#999"
                secureTextEntry={isPassword && !showPassword}
                {...props}
            />
            {isPassword && (
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#666"
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
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: '100%',
        color: '#333',
        fontSize: 16,
    },
    eyeIcon: {
        padding: 4,
    }
});
