import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Colors } from '../constants/Colors';
import { Message } from '../types';

interface MessageBubbleProps {
    message: Message;
    isMe: boolean;
    onSwipe: (message: Message) => void;
    onProfilePress: (user: any) => void; // Using any for user temporarily or import User type
}

const SwipeableMessage = ({ children, onSwipe }: { children: React.ReactNode, onSwipe: () => void }) => {
    const renderRightActions = () => <View style={{ width: 1, height: '100%' }} />;

    return (
        <Swipeable
            renderRightActions={renderRightActions}
            friction={2}
            overshootRight={false}
            onSwipeableOpen={(direction) => {
                if (direction === 'right') onSwipe();
            }}
        >
            {children}
        </Swipeable>
    );
};

export default React.memo(function MessageBubble({ message, isMe, onSwipe, onProfilePress }: MessageBubbleProps) {
    const senderName = message.sender.name || message.sender.username;
    const avatarUri = message.sender.image
        ? message.sender.image
        : `https://ui-avatars.com/api/?name=${senderName}&background=random&color=fff`;

    return (
        <SwipeableMessage onSwipe={() => onSwipe(message)}>
            <View style={[styles.messageRow, { justifyContent: isMe ? 'flex-end' : 'flex-start' }]}>
                {!isMe && (
                    <TouchableOpacity onPress={() => onProfilePress(message.sender)}>
                        <Image source={{ uri: avatarUri }} style={styles.avatar} />
                    </TouchableOpacity>
                )}

                <View style={[
                    styles.messageBubble,
                    isMe ? styles.myBubble : styles.theirBubble
                ]}>
                    <TouchableOpacity onPress={() => onProfilePress(message.sender)}>
                        <Text style={styles.senderName}>{senderName}</Text>
                    </TouchableOpacity>

                    {message.replyTo && (
                        <View style={styles.replyContext}>
                            <View style={styles.replyBar} />
                            <Text numberOfLines={1} style={styles.replyText}>
                                {message.replyTo.content || "Replying to a message"}
                            </Text>
                        </View>
                    )}

                    <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
                        {message.content}
                    </Text>
                    <Text style={[styles.timestamp, isMe ? styles.myTimestamp : styles.theirTimestamp]}>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>

                {isMe && (
                    <TouchableOpacity onPress={() => onProfilePress(message.sender)}>
                        <Image source={{ uri: avatarUri }} style={[styles.avatar, { marginRight: 0, marginLeft: 10 }]} />
                    </TouchableOpacity>
                )}
            </View>
        </SwipeableMessage>
    );
});

const styles = StyleSheet.create({
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
        width: '100%',
        paddingHorizontal: 15, // Better padding
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        marginRight: 10,
        backgroundColor: Colors.surfaceHighlight,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    messageBubble: {
        maxWidth: '75%', // Dynamic size
        padding: 12,
        borderRadius: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    myBubble: {
        backgroundColor: Colors.primary, // Emerald Green
        borderColor: Colors.primaryDark,
        borderWidth: 1,
        borderTopRightRadius: 4, // Sharp corner for sender
    },
    theirBubble: {
        backgroundColor: Colors.surface,
        borderColor: Colors.border,
        borderWidth: 1,
        borderTopLeftRadius: 4, // Sharp corner for receiver
    },
    senderName: {
        fontSize: 11,
        color: Colors.accent, // Cyan
        fontWeight: 'bold',
        marginBottom: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    myMessageText: { color: '#fff' }, // White on Green
    theirMessageText: { color: Colors.text },
    timestamp: {
        fontSize: 10,
        marginTop: 6,
        alignSelf: 'flex-end',
    },
    myTimestamp: { color: 'rgba(255,255,255,0.7)' }, // Lighter white on Green
    theirTimestamp: { color: Colors.textMuted },
    replyContext: {
        marginBottom: 6,
        padding: 6,
        backgroundColor: 'rgba(0,0,0,0.1)', // Subtle darken
        borderRadius: 4,
        flexDirection: 'row',
    },
    replyBar: {
        width: 3,
        backgroundColor: Colors.surface, // Contrast against bubble
        marginRight: 6,
        borderRadius: 2,
    },
    replyText: {
        color: Colors.text, // Readable
        fontSize: 12,
        fontStyle: 'italic',
    },
});
