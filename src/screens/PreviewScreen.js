import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import uuid from 'react-native-uuid';
import Video from 'react-native-video';
import {storage} from '../../firebase';
import {SAFE_AREA_PADDING} from '../Constants';
import {ref, uploadBytes} from 'firebase/storage';
import IonIcon from 'react-native-vector-icons/Ionicons';
import {useIsForeground} from '../hooks/useIsForeground';
import {createThumbnail} from 'react-native-create-thumbnail';
import {CommonActions, useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import ImageResizer from 'react-native-image-resizer';

const BUTTON_SIZE = 40;
const CONTENT_SPACING = 10;

const PreviewScreen = ({navigation, route}) => {
  const {media, path, type} = route.params;
  const [uploading, setUploading] = useState(null);
  const [hasMediaLoaded, setHasMediaLoaded] = useState(false);

  const isForeground = useIsForeground();
  const isScreenFocused = useIsFocused();
  const isVideoPaused = !isForeground || !isScreenFocused;

  const source = useMemo(() => ({uri: `file://${path}`}), [path]);

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
            routes: [
              {
                name: 'Picture',
                params: {
                  from: 'Camera',
                },
              },
            ],
          }),
        );
      type === 'video' &&
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: 'Video',
                params: {
                  from: 'Camera',
                },
              },
            ],
          }),
        );
    }
  }, [uploading, navigation, type]);

  const thumbnailHandler = async uid => {
    if (type === 'video') {
      // Create thumbnail from video
      createThumbnail({
        url: source.uri,
        timeStamp: 1000,
      })
        .then(res => {
          console.log('Thumbnail created ', res);
          uploadThumbnailHandler(res.path, uid);
        })
        .catch(err => {
          console.log('Thumbnail failed ', err);
          setUploading(false);
        });
    } else {
      // Create resizedImage as thumbnail for image
      ImageResizer.createResizedImage(
        source.uri,
        media.width / 10,
        media.height / 10,
        'JPEG',
        100,
        0,
        undefined,
        true,
        {mode: 'contain', onlyScaleDown: true},
      )
        .then(thumb => {
          console.log('Thumbnail created ', thumb);
          uploadThumbnailHandler(thumb.uri, uid);
        })
        .catch(err => {
          console.log('Thumbnail creation failed', err);
          setUploading(false);
        });
    }
  };

  const uploadThumbnailHandler = (uri, uid) => {
    const mediaRef = ref(
      storage,
      type === 'photo' ? `thumb_images/${uid}` : `thumb_videos/${uid}`,
    );

    fetchBlob(uri)
      .then(file => {
        uploadBytes(mediaRef, file)
          .then(res => {
            console.log('Thumbnail uploaded', res);
            setUploading(false);
          })
          .catch(error => {
            console.log('Thumbnail failed to upload', error);
            setUploading(false);
          });
      })
      .catch(err => {
        console.log('Blob creation failed', err);
        setUploading(false);
      });
  };

  const uploadHandler = async () => {
    setUploading(true);
    const uid = uuid.v4();
    const mediaRef = ref(
      storage,
      type === 'photo' ? `images/${uid}` : `videos/${uid}`,
    );

    fetchBlob(source.uri)
      .then(file => {
        uploadBytes(mediaRef, file)
          .then(snapshot => {
            console.log('Media uploaded ', snapshot);
            thumbnailHandler(uid);
          })
          .catch(error => {
            console.log('Error on upload ', error);
            setUploading(false);
          });
      })
      .catch(error => {
        console.log('Blob creation failed', error);
        setUploading(false);
      });
  };

  const fetchBlob = async uri => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
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
      <View style={styles.leftButtonRow}>
        <TouchableOpacity
          style={[styles.button, uploading ? {opacity: 0.4} : {opacity: 1}]}
          onPress={navigation.goBack}
          disabled={uploading}>
          <IonIcon name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>
      {/* UPLOAD BUTTON */}
      <View style={styles.rightButtonRow}>
        <TouchableOpacity
          style={[styles.button, uploading ? {opacity: 0.4} : {opacity: 1}]}
          onPress={uploadHandler}
          disabled={uploading}>
          <IonIcon name="cloud-upload-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* UPLOADING SPINNER*/}
      {uploading && (
        <View style={{flex: 1, alignItems: 'center'}}>
          <View style={styles.loading}>
            <ActivityIndicator size={'large'} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    right: SAFE_AREA_PADDING.paddingRight,
    top: SAFE_AREA_PADDING.paddingTop,
  },
  leftButtonRow: {
    position: 'absolute',
    left: SAFE_AREA_PADDING.paddingLeft,
    top: SAFE_AREA_PADDING.paddingTop,
  },
  loading: {
    position: 'absolute',
    bottom: SAFE_AREA_PADDING.paddingBottom,
  },
});

export default PreviewScreen;
