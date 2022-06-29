import {
  Camera,
  useCameraDevices,
  sortFormats,
} from 'react-native-vision-camera';
import {useIsFocused} from '@react-navigation/native';
import {useIsForeground} from '../hooks/useIsForeground';
import IonIcon from 'react-native-vector-icons/Ionicons';
import {Text, StyleSheet, View, TouchableOpacity} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

const BUTTON_SIZE = 40;
const CONTENT_SPACING = 10;

const CameraScreen = ({navigation}) => {
  const camera = useRef(null);
  const devices = useCameraDevices();
  const isFocused = useIsFocused();
  const isForeground = useIsForeground();
  const isActive = isFocused && isForeground;
  const [cameraPosition, setCameraPosition] = useState('back');
  const [flash, setFlash] = useState('off');

  const device = devices[cameraPosition];
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(false);
  const takePhotoOptions = useMemo(
    () => ({
      photoCodec: 'jpeg',
      qualityPrioritization: 'speed',
      flash: flash,
      quality: 90,
      skipMetadata: true,
    }),
    [flash],
  );
  const formats = useMemo(() => {
    if (device?.formats == null) {
      return [];
    }
    return device.formats.sort(sortFormats);
  }, [device?.formats]);

  const supportsCameraFlipping = useMemo(
    () => devices.back != null && devices.front != null,
    [devices.back, devices.front],
  );
  const supportsFlash = device?.hasFlash ?? false;

  const onFlipCameraPressed = useCallback(() => {
    setCameraPosition(p => (p === 'back' ? 'front' : 'back'));
  }, []);

  const takePhoto = useCallback(async () => {
    try {
      if (camera.current == null) {
        throw new Error('Camera ref is null!');
      }

      const photo = await camera.current.takePhoto(takePhotoOptions);
      onMediaCaptured(photo, 'photo');
    } catch (error) {}
  }, [camera, onMediaCaptured, takePhotoOptions]);

  useEffect(() => {
    Camera.getMicrophonePermissionStatus().then(status =>
      setHasMicrophonePermission(status === 'authorized'),
    );
  }, []);

  const onMediaCaptured = useCallback(
    (media, type) => {
      navigation.navigate('Preview', {
        media: media.path,
        type: type,
      });
    },
    [navigation],
  );

  const onFlashPressed = useCallback(() => {
    setFlash(f => (f === 'off' ? 'on' : 'off'));
  }, []);

  if (device == null) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Text>No Device found</Text>
      </View>
    );
  }

  return (
    <View style={{flex: 1}}>
      <Camera
        ref={camera}
        style={{flex: 1}}
        device={device}
        isActive={isActive}
        photo={true}
        video={true}
        audio={hasMicrophonePermission}
      />

      {/* CAPTURE BUTTON */}
      <View style={styles.captureButton}>
        <TouchableOpacity onPress={takePhoto}>
          <View
            style={{
              height: 40,
              width: 40,
              borderRadius: 25,
              backgroundColor: 'grey',
            }}
          />
        </TouchableOpacity>
      </View>

      {/*OTHER BUTTONS */}
      <View style={styles.rightButtonRow}>
        {supportsCameraFlipping && (
          <TouchableOpacity
            style={styles.button}
            onPress={onFlipCameraPressed}
            disabledOpacity={0.4}>
            <IonIcon name="camera-reverse" color="white" size={24} />
          </TouchableOpacity>
        )}
        {supportsFlash && (
          <TouchableOpacity
            style={styles.button}
            onPress={onFlashPressed}
            disabledOpacity={0.4}>
            <IonIcon
              name={flash === 'on' ? 'flash' : 'flash-off'}
              color="white"
              size={24}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  captureButton: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 30,
  },
  button: {
    marginBottom: CONTENT_SPACING,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: 'rgba(140, 140, 140, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightButtonRow: {
    position: 'absolute',
    right: 10,
    top: 20,
  },
});

export default CameraScreen;
