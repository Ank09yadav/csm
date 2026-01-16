import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, BackHandler, FlatList, TouchableOpacity, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User } from '../../constants/models';
import { useAuth } from '../../context/AuthContext';

type ListType = 'friends' | 'requests' | 'sent';

import { useSocket } from '../../context/SocketContext';
import { Alert } from 'react-native';
import { api } from '../../services/api';

const FriendListPage = () => {
  const [activeTab, setActiveTab] = useState<ListType>('friends');
  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<User[]>([]);
  const [sent, setSent] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    fetchData();

    if (socket && isConnected) {
      socket.on('notification', (data) => {
        if (data.type === 'friendRequest' || data.type === 'friendRequestAccepted') {
          fetchData();
        }
      });

      // Also listen for my own actions confirming success
      socket.on('friendRequestAcceptedSuccess', fetchData);
    }

    return () => {
      socket?.off('notification');
      socket?.off('friendRequestAcceptedSuccess');
    };
  }, [token, socket, isConnected]);

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await api('/user/friends', { authenticated: true });

      const mapUser = (u: any) => ({
        id: u._id,
        name: u.name || u.username,
        avatarUrl: u.image,
        bio: u.about,
        status: u.isOnline ? 'online' : 'offline',
        email: u.email || ''
      } as User);

      setFriends(data.friends.map(mapUser));
      setRequests(data.friendRequests.map(mapUser));
      setSent(data.sentRequests.map(mapUser));

    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to fetch friends list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const backAction = () => {
      if (activeTab !== 'friends') {
        setActiveTab('friends'); // Go back to friends list first
        return true;
      }
      router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [activeTab]);

  const handleFriendPress = (userId: string) => {
    // Navigate to a private chat
    // Ensure route matches [privateChat] file structure
    router.push(`/(privateChat)/${userId}`);
  };

  const getActiveData = () => {
    switch (activeTab) {
      case 'requests': return requests;
      case 'sent': return sent;
      default: return friends;
    }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'requests': return 'Requests';
      case 'sent': return 'Sent';
      default: return 'Friends';
    }
  };

  const handleAccept = (targetId: string) => {
    if (socket && isConnected) {
      socket.emit('acceptFriendRequest', targetId);
      // Optimistically remove from requests
      setRequests(prev => prev.filter(u => u.id !== targetId));
      Alert.alert("Success", "Friend request accepted!");
    } else {
      Alert.alert("Error", "You are offline. Reconnecting...");
    }
  };

  const renderFriendItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => item.id && handleFriendPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatarUrl || 'https://via.placeholder.com/50' }} style={styles.avatar} />
        {item.status === 'online' && <View style={styles.onlineBadge} />}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.bio} numberOfLines={1}>{item.bio || 'Available'}</Text>
      </View>

      {activeTab === 'friends' && (
        <Ionicons name="chatbubble-outline" size={24} color={Colors.primary} />
      )}
      {activeTab === 'requests' && (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => item.id && handleAccept(item.id)}>
            <Ionicons name="checkmark-circle" size={28} color={Colors.success} style={{ marginRight: 10 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert("TODO", "Reject not implemented yet")}>
            <Ionicons name="close-circle" size={28} color={Colors.error} />
          </TouchableOpacity>
        </View>
      )}
      {activeTab === 'sent' && (
        <Text style={{ color: Colors.textMuted, fontSize: 12 }}>Pending</Text>
      )}

    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (activeTab !== 'friends') setActiveTab('friends');
          else router.back();
        }} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.headerIcon, activeTab === 'requests' && styles.activeIcon]}
            onPress={() => setActiveTab('requests')}
          >
            <Ionicons name="person-add-outline" size={22} color={activeTab === 'requests' ? Colors.primary : Colors.text} />
            {requests.length > 0 && <View style={styles.badge} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerIcon, activeTab === 'sent' && styles.activeIcon]}
            onPress={() => setActiveTab('sent')}
          >
            <Ionicons name="paper-plane-outline" size={22} color={activeTab === 'sent' ? Colors.primary : Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={getActiveData()}
        keyExtractor={(item) => item.id}
        renderItem={renderFriendItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {activeTab} found</Text>
          </View>
        }
      />
    </View>
  );
};

export default FriendListPage;

// ... imports
import { Colors } from '../../constants/Colors';

// ... component logic ...

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // Dark background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2, // Darker shadow
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 15,
    position: 'relative',
    padding: 4
  },
  activeIcon: {
    backgroundColor: Colors.surfaceHighlight, // Subtle highlight
    borderRadius: 20,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  listContent: {
    padding: 15,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface, // Dark Item
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 2,
    borderColor: Colors.primary, // Emerald border
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  infoContainer: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  separator: {
    height: 10,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 16
  }
});