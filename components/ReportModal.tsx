import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface ReportModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => Promise<void>;
    loading?: boolean;
}

export default function ReportModal({ visible, onClose, onSubmit, loading }: ReportModalProps) {
    const [reason, setReason] = useState('');

    const handleSubmit = () => {
        onSubmit(reason);
        setReason(''); // Reset after submit
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Report User</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.description}>
                        Please help us keep our community safe. Why are you reporting this user?
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Reason (e.g., harassment, spam...)"
                        placeholderTextColor={Colors.textMuted}
                        multiline
                        numberOfLines={4}
                        value={reason}
                        onChangeText={setReason}
                        textAlignVertical="top"
                    />

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={loading}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.submitButton, (!reason.trim() || loading) && styles.disabledButton]}
                            onPress={handleSubmit}
                            disabled={!reason.trim() || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.submitText}>Report</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        padding: 20
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        elevation: 10
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text
    },
    description: {
        color: Colors.textSecondary,
        marginBottom: 15,
        fontSize: 14
    },
    input: {
        backgroundColor: Colors.background,
        borderRadius: 8,
        padding: 12,
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.border,
        minHeight: 100,
        marginBottom: 20
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    cancelText: {
        color: Colors.textSecondary,
        fontWeight: '600'
    },
    submitButton: {
        backgroundColor: Colors.error,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    disabledButton: {
        opacity: 0.5
    },
    submitText: {
        color: '#fff',
        fontWeight: 'bold'
    }
});
