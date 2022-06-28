import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Camera} from 'react-native-vision-camera';

const App = () => {
  const [cameraPermission, setCameraPersmission] = useState(false);

  const requestCameraPermissionHandler = async () => {
    const newCameraPermission = await Camera.requestCameraPermission();
    const newMicrophonePermission = await Camera.requestMicrophonePermission();
    console.log('camera', newCameraPermission);
    console.log('mic', newMicrophonePermission);
  };
  return (
    <View style={styles.container}>
      <Text>App Screen</Text>
      <TouchableOpacity
        onPress={requestCameraPermissionHandler}
        style={styles.button}>
        <Text style={styles.buttonText}>Request Permissions</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 15,
    color: 'white',
    fontWeight: '700',
  },
});

export default App;
