import { useUser } from '@clerk/clerk-expo';
import { usePathname,Stack, router } from 'expo-router';
import { View, Image, StyleSheet, TouchableOpacity, Text, Modal, Pressable, ToastAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { rooms } from '../data';

export default function HomeLayout() {
  const { user } = useUser();
  const currentPath = usePathname();
  const [menuVisible, setMenuVisible] = useState(false);

  // Fallback for TypeScript null error
  const headerTitle = user?.fullName || "Guest User";
  
  //Universal Guard Function
  const safeNavigate = (targetPath: string) => {
    if (currentPath === targetPath) {
      ToastAndroid.show(`You are Already On Friend List`,ToastAndroid.SHORT)
      return; 
    }
    setMenuVisible(false);
    router.push(targetPath as any);
  };
  

  const navigateToRoom = (roomId: string) => {
    setMenuVisible(false);
    safeNavigate(`/rooms/${roomId}`);
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
              <TouchableOpacity
              onPress={()=>{
                if(currentPath==='/profile')
                  ToastAndroid.show("Already on Profile Page",ToastAndroid.SHORT)
                else
                  safeNavigate('/profile');
              }}
              >
                  {user?.imageUrl ? (
                <Image source={{ uri: user.imageUrl }  } style={styles.profileImage} />
              ) : (
                <View style={[styles.profileImage, { backgroundColor: '#ccc' }]} />
              )}
              </TouchableOpacity>
              
              
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
                <Ionicons name={'home'} size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => safeNavigate('/friendListPage')}
              >
                <Ionicons 
                  name={currentPath === '/friendListPage' ? "chatbubble-ellipses" : "chatbubble-ellipses"} 
                  size={24} 
                  color="white" 
                />
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
  imageContainer: { marginHorizontal: 5 },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e9e8f1ff',
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
    marginTop: 20, // Position below header
    marginRight: 10,
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