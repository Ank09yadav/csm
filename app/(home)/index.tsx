import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet, Text, View,
  KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator, TouchableOpacity, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FooterInput from '@/components/FooterInput';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'https://csmserver.onrender.com/api/user';

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    username: string;
    name?: string;
    image?: string;
  };
  createdAt: string;
}

export default function ChatPage() {
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const ROOM_NAME = 'hindi'; // Default room

  useEffect(() => {
    if (socket && isConnected) {
      console.log("Joining room:", ROOM_NAME);
      socket.emit('joinPublicRoom', ROOM_NAME);

      socket.on('newPublicMessage', (msg: Message) => {
        setMessages((prev) => [...prev, msg]);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      });

      return () => {
        socket.off('newPublicMessage');
      };
    }
  }, [socket, isConnected]);

  const handleSend = (msgContent: string) => {
    if (socket && isConnected) {
      socket.emit('sendPublicMessage', {
        room: ROOM_NAME,
        content: msgContent,
        type: 'TEXT'
      });
    } else {
      console.log("Socket not connected");
    }
  };

  const handleUserAction = (targetUser: { _id: string, username: string }) => {
    Alert.alert(
      `Manage ${targetUser.username}`,
      "What would you like to do?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block User",
          style: "destructive",
          onPress: () => performAction('block', targetUser._id)
        },
        {
          text: "Report User",
          style: "destructive",
          onPress: () => performAction('report', targetUser._id)
        }
      ]
    );
  };

  const performAction = async (action: 'block' | 'report', targetUserId: string) => {
    try {
      const res = await fetch(`${API_URL}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId })
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("Success", data.message);
      } else {
        Alert.alert("Error", data.error || "Action failed");
      }
    } catch (e) {
      Alert.alert("Error", "Network error");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.mainWrapper}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.subHeader}>
        <Text style={styles.subHeaderText}>Hindi Room {isConnected ? '(Live)' : '(Connecting...)'}</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={{ padding: 15, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, index) => {
          const isMe = msg.sender._id === user?._id;
          return (
            <View key={msg._id || index} style={isMe ? styles.sentMessage : styles.receivedMessage}>
              {!isMe && (
                <TouchableOpacity onPress={() => handleUserAction(msg.sender)}>
                  <Text style={styles.senderName}>{msg.sender.username || msg.sender.name || 'Unknown'}</Text>
                </TouchableOpacity>
              )}
              <Text style={isMe ? styles.sentMessageText : styles.messageText}>{msg.content}</Text>
              <Text style={styles.timestamp}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <FooterInput onSend={handleSend} />
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
  senderName: { fontSize: 12, color: '#2e78b7', marginBottom: 4, fontWeight: 'bold' },
  timestamp: { fontSize: 10, color: '#ccc', marginTop: 4, textAlign: 'right' },
});