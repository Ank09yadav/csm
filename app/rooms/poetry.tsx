import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet, Text, View, Image,
  KeyboardAvoidingView, ScrollView, Platform, TouchableOpacity, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FooterInput from '../../components/FooterInput';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

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
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const ROOM_NAME = 'poetry';

  useEffect(() => {
    if (socket && isConnected) {
      console.log("Joining room:", ROOM_NAME);
      socket.emit('joinPublicRoom', ROOM_NAME);

      socket.on('newPublicMessage', (msg: Message) => {
        setMessages((prev) => [...prev, msg]);
      });

      return () => {
        socket.off('newPublicMessage');
      };
    }
  }, [socket, isConnected]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = (msgContent: string) => {
    // Handled by FooterInput via socket
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.mainWrapper}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.subHeader, { paddingTop: insets.top + 10, height: 60 + insets.top }]}>
        <Text style={styles.subHeaderText}>Poetry Room {isConnected ? '🟢' : '🔴'}</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={{ padding: 15, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, index) => {
          const isMe = msg.sender._id === (user as any)?._id || msg.sender._id === (user as any)?.userId;
          const showAvatar = !isMe;

          return (
            <View key={msg._id || index} style={[styles.messageRow, isMe ? styles.rowReverse : styles.rowRow]}>
              {showAvatar ? (
                <Image
                  source={{ uri: msg.sender.image || `https://ui-avatars.com/api/?name=${msg.sender.username}&background=random&color=fff` }}
                  style={styles.avatar}
                />
              ) : (
                <View style={{ width: 0 }} />
              )}

              <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
                {!isMe && (
                  <Text style={styles.senderName}>{msg.sender.username}</Text>
                )}
                <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
                  {msg.content}
                </Text>
                <Text style={[styles.timestamp, isMe ? styles.myTimestamp : styles.theirTimestamp]}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <FooterInput onSend={handleSend} chatType="public" chatId={ROOM_NAME} />
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
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
  },
  subHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c2d43',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#EFEFF4',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    width: '100%',
  },
  rowRow: { justifyContent: 'flex-start' },
  rowReverse: { justifyContent: 'flex-end' },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 2,
    backgroundColor: '#ddd',
  },

  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  myBubble: {
    backgroundColor: '#4A00E0',
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },

  senderName: {
    fontSize: 11,
    color: '#ff6b6b',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: { color: '#fff' },
  theirMessageText: { color: '#1a1a1a' },

  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTimestamp: { color: 'rgba(255,255,255,0.7)' },
  theirTimestamp: { color: '#999' },
});