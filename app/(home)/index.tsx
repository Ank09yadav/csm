import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet, Text, TouchableOpacity, View,
  KeyboardAvoidingView, ScrollView, Platform, TextInput
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatPage() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const [message, setMessage] = useState('');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.mainWrapper}
      // Offset matches your header height to prevent overlapping
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* 1. Sub-Header (Sticky at top) */}
      <View style={[styles.subHeader, { paddingTop: insets.top }]}>
        <Text style={styles.subHeaderText}>Hindi Room</Text>
      </View>

      {/* 2. Message List (Scrollable Area) */}
      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={{ padding: 15, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.receivedMessage}>
          <Text style={styles.messageText}>Hello! This is the first message.</Text>
          <Text style={styles.timestamp}>12:00 PM</Text>
        </View>
        
        {/* Placeholder for sent messages */}
        <View style={styles.sentMessage}>
          <Text style={styles.sentMessageText}>Hi! I can see this works perfectly.</Text>
        </View>
      </ScrollView>

      {/* 3. Input Bar (Sticky at bottom) */}
      <View style={[styles.inputWrapper, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name='add-circle-outline' size={28} color="#2e78b7" />
        </TouchableOpacity>
        
        <TextInput
          style={styles.textInput}
          placeholder='Type a message...'
          value={message}
          onChangeText={setMessage}
          multiline
        />

        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={() => {
            console.log('Message sent:', message);
            setMessage('');
          }}
        >
          <Ionicons name='send' size={24} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  subHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  subHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c2d43',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#bdcfe7ff',
  },
  receivedMessage: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 15,
    borderTopLeftRadius: 2,
    maxWidth: '80%',
    alignSelf: 'flex-start',
    marginBottom: 10,
    elevation: 1,
  },
  sentMessage: {
    backgroundColor: '#2e78b7',
    padding: 12,
    borderRadius: 15,
    borderTopRightRadius: 2,
    maxWidth: '80%',
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  messageText: { color: '#333' },
  sentMessageText: { color: '#fff' },
  timestamp: { fontSize: 10, color: '#999', marginTop: 4, textAlign: 'right' },
  
  // Input Bar Styles
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  iconButton: { padding: 5 },
  sendButton: {
    backgroundColor: '#2e78b7',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  }
});