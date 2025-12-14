import {useState} from "react";
import {
  Text,
  ToastAndroid,
  View,
  StyleSheet,
  Button,
  Platform,
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
// Opening camera function
const openCamera = () => {
  const [imageuri, setImageuri] = useState <string | null>(null); 
  
  const openCamera = async () => {
    const {status}= await ImagePicker.requestCameraPermissionsAsync();
    if(status!=="granted"){
      alert("Camera access denied");
      return;
    }
    if(status==="granted")
    {
      let data=await ImagePicker.launchCameraAsync({
       mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9,16],
      quality: 1,
      })
      if (!data.canceled) {
      
      setImageuri(data.assets[0].uri);
      console.log("Image URI:", data.assets[0].uri);
    } else {
      // Optional: User closed the camera without taking a photo
      console.log("Camera operation cancelled.");
    }
    }
  } 
  ToastAndroid.show(
    "Camera function invoked! Camera logic runs here.",
    ToastAndroid.LONG
  );
};

export default function home() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to the Home Page!</Text>

      <View style={styles.iconButtonContainer}>
        <FontAwesome
          name="bell"
          size={24}
          color="#FFF"
          // onPress={getNotification}
        />
        <Text style={styles.iconButtonText}>Notify Me</Text>
      </View>

      {/* <Button title="Simple Submit" onPress={getNotification} color="#3498db" /> */}

      <View style={{ height: 20 }} />

      <Button title="Open camera" onPress={openCamera} />
      {/* </View> */}
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
