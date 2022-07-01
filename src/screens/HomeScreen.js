import {View, Text, StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Camera} from 'react-native-vision-camera';
import AntDesign from 'react-native-vector-icons/AntDesign';
import PermissionBox from '../components/PermissionBox';

const HomeScreen = ({navigation}) => {
  const [hasMicPerm, setHasMicPerm] = useState(null);
  const [hasCameraPerm, setHasCameraPerm] = useState(null);

  useEffect(() => {
    const focusListener = navigation.addListener('focus', () => {
      navigation.setOptions({
        tabBarIcon: ({color}) => {
          return <AntDesign name="home" size={26} color={color} />;
        },
        tabBarLabelStyle: {fontSize: 16, fontWeight: '700'},
      });
    });
    const blurListener = navigation.addListener('blur', () => {
      navigation.setOptions({
        tabBarIcon: ({color}) => {
          return <AntDesign name="home" size={20} color={color} />;
        },
        tabBarLabelStyle: {fontSize: 14},
      });
    });

    return () => {
      !!focusListener && focusListener();
      !!blurListener && blurListener();
    };
  }, [navigation]);

  useEffect(() => {
    const getPermissions = async () => {
      await Camera.getCameraPermissionStatus().then(status => {
        setHasCameraPerm(status === 'authorized');
      });
      await Camera.getMicrophonePermissionStatus().then(status => {
        setHasMicPerm(status === 'authorized');
      });
    };
    getPermissions();
  }, []);

  useEffect(() => {
    const requestCameraPermissionHandler = async () => {
      await Camera.requestCameraPermission();
      await Camera.requestMicrophonePermission();
    };
    requestCameraPermissionHandler();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.welcomeView}>
        <Text style={styles.welcomeText}>Welcome to Camera App</Text>
      </View>
      <PermissionBox hasCameraPerm={hasCameraPerm} hasMicPerm={hasMicPerm} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeView: {flex: 1, alignItems: 'center', paddingTop: 100},
  welcomeText: {fontSize: 25, color: 'black', fontWeight: '700'},
});

export default HomeScreen;
