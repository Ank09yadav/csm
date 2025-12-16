import { useState } from "react";
import {
  Text,
  ToastAndroid,
  View,
  StyleSheet,
  Button,
  Platform,
  Alert,
  Image
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome } from "@expo/vector-icons";

// const getNotification = () => {
//   if (Platform.OS === "android") {
//     ToastAndroid.show(
//       "ank",
//       ToastAndroid.SHORT
//     );
//   } else {
//     console.log("Button Pressed!");
//   }
// };





export default function Home() {
  const [imageuri, setImageuri] = useState<string | null>(null);
  //take camera permission
  const showNotification = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert("Notification", message);
    }
  };
  const takeCameraPermission = async () => {

    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      showNotification("You need to give camera permission to use this feature");
      return false;
    }
    return true;
  }
  // Opening camera function
  const openCamera = async () => {

    if (Platform.OS === "android") {
      try {
        const isCameraPermitted = await takeCameraPermission();
        if (!isCameraPermitted)
          ToastAndroid.show("Camera permission denied", ToastAndroid.SHORT);
        else {
          let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            aspect: [9, 16],
            quality: 1,
          });
          if (!result.canceled && result.assets) {
            setImageuri(result.assets[0].uri);
            ToastAndroid.show("Image captured successfully!", ToastAndroid.SHORT);
          }
        }
      } catch (error) {
        ToastAndroid.show("Error opening camera", ToastAndroid.SHORT);
      }

    }
    //show image on screen
    if (imageuri) {
      return (
        <View>
          <Text>Captured Image:</Text>
          <Image source={{ uri: imageuri }} style={{ width: 200, height: 400 }} />
        </View>
      );
    } else {
      return null;
    }
  }



  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to the Home Page!</Text>

      <View style={styles.iconButtonContainer}>
        {/* <FontAwesome
          name="bell"
          size={24}
          color="#FFF"
         onPress={getNotification}
        /> */}
        <Text style={styles.iconButtonText}>Notify Me</Text>
      </View>

      {/* <Button title="Simple Submit" onPress={getNotification} color="#3498db" /> */}

      <View style={{ height: 20 }} />

      <Button title="Open camera" onPress={openCamera} />
      
      <View style={styles.iconButtonContainer}>
      <Text style={styles.iconButtonText} onPress={() => setImageuri(null)}>Delete Image</Text>
      </View>
      {imageuri && (
        <Image source={{ uri: imageuri }} style={{ width: 300, height: 300 }} />
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,

    padding: 20,
    backgroundColor: "#ecf0f1",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
  },
  iconButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2ecc71",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    margin: 5,
  },
  iconButtonText: {
    color: "#FFF",
    marginLeft: 10,
    fontSize: 18,
    fontWeight: "500",
  },
})
