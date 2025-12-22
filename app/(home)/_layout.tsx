import { useUser } from '@clerk/clerk-expo'
import { Stack } from 'expo-router/stack'
import {View, Image, StyleSheet} from 'react-native'

export default function Layout() {
  const {user} = useUser()
  return <Stack

      screenOptions={
        {
          headerStyle:{backgroundColor:'#2e78b7' },
          headerLeft: () => (
          <View style={styles.imageContainer}>
            {user?.imageUrl ? (
              <Image 
                source={{ uri: user.imageUrl }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={[styles.profileImage, { backgroundColor: '#ccc' }]} />
            )}
          </View>),
          title:user?.firstName?  `${user.fullName } `:"guest user"
        }
      }  
  />
}
const styles = StyleSheet.create({
  imageContainer:{
    marginRight: 15,
  },
  profileImage: {
    width: 35,
    height: 35,
    borderRadius: 17.5, // Makes it perfectly circular
    borderWidth: 1.5,
    borderColor: '#fff',
  },
})