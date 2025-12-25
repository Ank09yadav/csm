import { StyleSheet, Text, View, BackHandler } from 'react-native'
import { useEffect } from 'react'
import { useRouter } from 'expo-router';

const friendListPage = () => {
  const router = useRouter();
  useEffect(() => {
    const backAction = () => {
      router.replace('/(home)'); // Always go back to Home
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);


  return (
    <View>
      <Text>this is friendsLIst </Text>
    </View>
  )
}

export default friendListPage

const styles = StyleSheet.create({})