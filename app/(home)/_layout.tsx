import { useUser } from '@clerk/clerk-expo';
import { Stack, router } from 'expo-router';
import { View, Image, StyleSheet, TouchableOpacity, Text, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function HomeLayout() {
  const { user } = useUser();
  const [menuVisible, setMenuVisible] = useState(false);

  // Fallback for TypeScript null error
  const headerTitle = user?.fullName || "Guest User";

  const rooms = [
    { id: 'hindi', name: 'Hindi Room', icon: 'language' },
    { id: 'english', name: 'English Room', icon: 'text' },
    { id: 'song', name: 'Song Room', icon: 'musical-notes' },
    { id: 'poetry', name: 'Poetry Room', icon: 'brush' },
  ];

  const navigateToRoom = (roomId: string) => {
    setMenuVisible(false);
    router.push(`/rooms/${roomId}`);
  };

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#2e78b7' },
          headerTintColor: '#fff',
          headerTitleAlign: 'left',
          headerLeft: () => (
            <View style={styles.imageContainer}>
              {user?.imageUrl ? (
                <Image source={{ uri: user.imageUrl }} style={styles.profileImage} />
              ) : (
                <View style={[styles.profileImage, { backgroundColor: '#ccc' }]} />
              )}
            </View>
          ),
          title: headerTitle,
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              {/* Apps Icon triggers the Modal Menu */}
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => setMenuVisible(true)}
              >
                <Ionicons name="apps-outline" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={() => console.log('Message pressed')}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* Custom Dropdown Modal */}
      <Modal
        transparent={true}
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.dropdownMenu}>
            <Text style={styles.menuHeader}>Select Room</Text>
            {rooms.map((room) => (
              <TouchableOpacity 
                key={room.id} 
                style={styles.menuItem}
                onPress={() => navigateToRoom(room.id)}
              >
                <Ionicons name={room.icon as any} size={20} color="#2e78b7" />
                <Text style={styles.menuItemText}>{room.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  imageContainer: { marginLeft: 5 },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  iconButton: {
    padding: 6,
    marginLeft: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)', // Dim background
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  dropdownMenu: {
    marginTop: 60, // Position below header
    marginRight: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 10,
    width: 180,
    elevation: 5, // Android shadow
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  menuHeader: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 12,
    color: '#999',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
});