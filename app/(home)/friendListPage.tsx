import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, BackHandler, FlatList, TouchableOpacity, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FRIENDS, FRIEND_REQUESTS, SENT_REQUESTS, User } from '../data';

type ListType = 'friends' | 'requests' | 'sent';

const FriendListPage = () => {
  const [activeTab, setActiveTab] = useState<ListType>('friends');
  const [friends, setFriends] = useState<User[]>(FRIENDS);
  const [requests, setRequests] = useState<User[]>(FRIEND_REQUESTS);
  const [sent, setSent] = useState<User[]>(SENT_REQUESTS);

  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const backAction = () => {
      if (activeTab !== 'friends') {
        setActiveTab('friends'); // Go back to friends list first
        return true;
      }
      router.replace('/(home)');
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

  const renderFriendItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => item.id && handleFriendPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.status === 'online' && <View style={styles.onlineBadge} />}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.bio} numberOfLines={1}>{item.bio || 'Available'}</Text>
      </View>

      {activeTab === 'friends' && (
        <Ionicons name="chatbubble-outline" size={24} color="#2e78b7" />
      )}
      {activeTab === 'requests' && (
        <View style={{ flexDirection: 'row' }}>
          <Ionicons name="checkmark-circle" size={28} color="#4CAF50" style={{ marginRight: 10 }} />
          <Ionicons name="close-circle" size={28} color="#ff4444" />
        </View>
      )}
      {activeTab === 'sent' && (
        <Text style={{ color: '#999', fontSize: 12 }}>Pending</Text>
      )}

    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (activeTab !== 'friends') setActiveTab('friends');
          else router.replace('/(home)');
        }} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.headerIcon, activeTab === 'requests' && styles.activeIcon]}
            onPress={() => setActiveTab('requests')}
          >
            <Ionicons name="person-add-outline" size={22} color={activeTab === 'requests' ? "#2e78b7" : "#333"} />
            {requests.length > 0 && <View style={styles.badge} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerIcon, activeTab === 'sent' && styles.activeIcon]}
            onPress={() => setActiveTab('sent')}
          >
            <Ionicons name="paper-plane-outline" size={22} color={activeTab === 'sent' ? "#2e78b7" : "#333"} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c2d43',
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
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4444',
  },
  listContent: {
    padding: 15,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
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
    backgroundColor: '#eee',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  infoContainer: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: '#888',
  },
  separator: {
    height: 10,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16
  }
});