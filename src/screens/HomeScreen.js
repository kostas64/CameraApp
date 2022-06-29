import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';
import {Camera} from 'react-native-vision-camera';

const HomeScreen = ({navigation}) => {
  const requestCameraPermissionHandler = async () => {
    const newCameraPermission = await Camera.requestCameraPermission();
    const newMicrophonePermission = await Camera.requestMicrophonePermission();
  };

  return (
    <View style={styles.container}>
      <Text>App Screen</Text>
      <TouchableOpacity
        onPress={requestCameraPermissionHandler}
        style={styles.button}>
        <Text style={styles.buttonText}>Request Permissions</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Camera')}>
        <Text>Open Camera</Text>
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

export default HomeScreen;
