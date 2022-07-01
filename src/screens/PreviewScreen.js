import uuid from 'react-native-uuid';
import Video from 'react-native-video';
import {SAFE_AREA_PADDING} from '../Constants';
import {CommonActions, useIsFocused} from '@react-navigation/native';
import {useIsForeground} from '../hooks/useIsForeground';
import IonIcon from 'react-native-vector-icons/Ionicons';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ref, uploadBytes} from 'firebase/storage';
import {storage} from '../../firebase';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

const PreviewScreen = ({navigation, route}) => {
  const {media, type} = route.params;
  const [uploading, setUploading] = useState(null);
  const [hasMediaLoaded, setHasMediaLoaded] = useState(false);

  const isForeground = useIsForeground();
  const isScreenFocused = useIsFocused();
  const isVideoPaused = !isForeground || !isScreenFocused;

  const source = useMemo(() => ({uri: `file://${media}`}), [media]);

  const screenStyle = useMemo(
    () => ({opacity: hasMediaLoaded ? 1 : 0}),
    [hasMediaLoaded],
  );

  useEffect(() => {
    if (uploading === false) {
      type === 'photo' &&
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'Picture'}],
          }),
        );
      type === 'video' &&
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'Video'}],
          }),
        );
    }
  }, [uploading, navigation, type]);

  const uploadHandler = async () => {
    setUploading(true);

    const mediaRef = ref(
      storage,
      type === 'photo' ? `images/${uuid.v4()}` : `videos/${uuid.v4()}`,
    );

    const response = await fetch(source.uri);
    const file = await response.blob();

    uploadBytes(mediaRef, file)
      .then(snapshot => {
        console.log('Uploaded file');
        setUploading(false);
      })
      .catch(error => {
        console.log('Error on upload ', error);
        setUploading(false);
      });
  };

  const isVideoOnLoadEvent = event =>
    'duration' in event && 'naturalSize' in event;

  const onMediaLoad = useCallback(event => {
    if (isVideoOnLoadEvent(event)) {
      console.log(
        `Video loaded. Size: ${event.naturalSize.width}x${event.naturalSize.height} (${event.naturalSize.orientation}, ${event.duration} seconds)`,
      );
    } else {
      console.log(
        `Image loaded. Size: ${event.nativeEvent.source.width}x${event.nativeEvent.source.height}`,
      );
    }
  }, []);
  const onMediaLoadEnd = useCallback(() => {
    console.log('media has loaded.');
    setHasMediaLoaded(true);
  }, []);

  const onMediaLoadError = useCallback(error => {
    console.log(`failed to load media: ${JSON.stringify(error)}`);
  }, []);

  return (
    <View style={[styles.container, screenStyle]}>
      {type === 'photo' && (
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onLoadEnd={onMediaLoadEnd}
          onLoad={onMediaLoad}
        />
      )}
      {type === 'video' && (
        <Video
          source={source}
          style={StyleSheet.absoluteFill}
          paused={isVideoPaused}
          resizeMode="cover"
          posterResizeMode="cover"
          allowsExternalPlayback={false}
          automaticallyWaitsToMinimizeStalling={false}
          disableFocus={true}
          repeat={true}
          useTextureView={false}
          controls={false}
          playWhenInactive={true}
          ignoreSilentSwitch="ignore"
          onReadyForDisplay={onMediaLoadEnd}
          onLoad={onMediaLoad}
          onError={onMediaLoadError}
        />
      )}
      {/* DISCARD BUTTON*/}
      <TouchableOpacity
        style={[styles.closeButton, uploading ? {opacity: 0.4} : {opacity: 1}]}
        onPress={navigation.goBack}
        disabled={uploading}>
        <IonIcon name="close" size={35} color="white" style={styles.icon} />
      </TouchableOpacity>

      {/* UPLOAD BUTTON */}
      <TouchableOpacity
        style={[styles.uploadButton, uploading ? {opacity: 0.4} : {opacity: 1}]}
        onPress={uploadHandler}
        disabled={uploading}>
        <IonIcon
          name="cloud-upload-outline"
          size={35}
          color="white"
          style={styles.icon}
        />
      </TouchableOpacity>

      {/* UPLOADING SPINNER*/}
      {uploading && (
        <View style={styles.loading}>
          <ActivityIndicator size={'large'} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: SAFE_AREA_PADDING.paddingTop,
    left: SAFE_AREA_PADDING.paddingLeft,
    width: 40,
    height: 40,
  },
  uploadButton: {
    position: 'absolute',
    top: SAFE_AREA_PADDING.paddingTop,
    right: SAFE_AREA_PADDING.paddingRight,
    width: 40,
    height: 40,
  },
  loading: {
    position: 'absolute',
    bottom: SAFE_AREA_PADDING.paddingBottom,
  },
  icon: {
    textShadowColor: 'black',
    textShadowOffset: {
      height: 0,
      width: 0,
    },
    textShadowRadius: 1,
  },
});

export default PreviewScreen;
