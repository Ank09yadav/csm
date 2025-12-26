import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, BackHandler, FlatList, TouchableOpacity, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FRIENDS, User } from '../data';

const FriendListPage = () => {
  const [friends, setFriends] = useState<User[]>(FRIENDS);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const backAction = () => {
      router.replace('/(home)');
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const handleFriendPress = (userId: string) => {
    // Navigate to a private chat or profile
    // router.push(`/chat/${userId}`);
    console.log('Pressed user:', userId);
  };

  const renderFriendItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => handleFriendPress(item.id)}
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
      <Ionicons name="chatbubble-outline" size={24} color="#2e78b7" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, {}]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(home)')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={renderFriendItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
});