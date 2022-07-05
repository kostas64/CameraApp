import {
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
  Image,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {storage} from '../../firebase';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {ref, listAll, getDownloadURL} from 'firebase/storage';
import React, {useCallback, useEffect, useState} from 'react';
import {SAFE_AREA_PADDING} from '../Constants';
import Video from 'react-native-video';
import RNFetchBlob from 'rn-fetch-blob';

const SCREEN_WIDTH = Dimensions.get('window').width;

const VideoScreen = ({navigation, route}) => {
  const [videos, setVideos] = useState([]);
  const [videoView, setVideoView] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [emptyState, setEmptyState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const focus = navigation.addListener('focus', () => {
      if (route?.params?.from === 'Camera' || videos.length === 0) {
        listItemsHandler();
      }
    });
    const blur = navigation.addListener('blur', () => {
      if (route?.params?.from === 'Camera') {
        navigation.setParams({from: null});
      }
    });
    return () => {
      !!focus && focus();
      !!blur && blur();
    };
  }, [navigation, listItemsHandler, videos, route]);

  useEffect(() => {
    const focusListener = navigation.addListener('focus', () => {
      navigation.setOptions({
        tabBarIcon: ({color}) => {
          return <AntDesign name="videocamera" size={26} color={color} />;
        },
        tabBarLabelStyle: {fontSize: 16, fontWeight: '700'},
      });
    });
    const blurListener = navigation.addListener('blur', () => {
      navigation.setOptions({
        tabBarIcon: ({color}) => {
          return <AntDesign name="videocamera" size={20} color={color} />;
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
    if (videoView.uri) {
      setModalVisible(true);
    }
  }, [videoView]);

  const videoOpeningHandler = async item => {
    const videoUrl = item.replace('thumb_videos', 'videos');
    RNFetchBlob.config({
      fileCache: true,
    })
      .fetch('GET', videoUrl)
      .then(res => {
        setVideoView({uri: `file:///${res.path()}`});
      })
      .catch(err => console.log('Error fetching from storage', err));
  };

  const renderItem = ({item, index}) => {
    return (
      <TouchableOpacity
        onPress={() => videoOpeningHandler(item)}
        key={index}
        style={[
          styles.itemStyle,
          index !== 0 && index % 3 !== 0 && {paddingLeft: 8},
        ]}>
        <Image
          source={{uri: videos[index]}}
          style={{
            height: SCREEN_WIDTH / 3.5,
            width: SCREEN_WIDTH / 3.5,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: SCREEN_WIDTH / 9,
            left:
              index !== 0 && index % 3 !== 0
                ? SCREEN_WIDTH / 9 + 8
                : SCREEN_WIDTH / 9,
          }}>
          <AntDesign size={20} color={'white'} name={'play'} />
        </View>
      </TouchableOpacity>
    );
  };

  const listItemsHandler = useCallback(() => {
    const listRef = ref(storage, 'thumb_videos/');
    let tempArray = [];
    setIsLoading(true);

    listAll(listRef).then(res => {
      if (res.items.length === 0) {
        setEmptyState(true);
        setIsLoading(false);
        return;
      }
      setEmptyState(false);
      setIsLoading(false);

      res.items.forEach(item => {
        const listItemRef = ref(storage, item._location.path_);

        getDownloadURL(listItemRef)
          .then(url => {
            tempArray = [...tempArray, url];
          })
          .finally(() => {
            const sortedArray = tempArray.sort((a, b) => {
              return a < b;
            });
            setVideos(sortedArray);
          });
      });
    });
  }, []);

  return (
    <View
      style={[
        styles.container,
        Platform.OS === 'ios' && {
          paddingTop: SAFE_AREA_PADDING.paddingTop,
          paddingBottom: SAFE_AREA_PADDING.paddingBottom + 32,
        },
      ]}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Video Gallery</Text>
      </View>
      {emptyState && !isLoading && (
        <View style={styles.center}>
          <Text style={{fontSize: 20, fontWeight: '700'}}>
            No videos to show
          </Text>
        </View>
      )}
      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size={'large'} />
        </View>
      )}
      {!emptyState && !isLoading && (
        <>
          <FlatList
            data={videos}
            renderItem={renderItem}
            style={styles.flatlist}
            numColumns={3}
            showsVerticalScrollIndicator={false}
          />

          <Modal
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}>
            <Video source={videoView} style={StyleSheet.absoluteFill} />
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    padding: 10,
    margin: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(20,20,20,0.3)',
  },
  title: {
    alignSelf: 'center',
    color: 'black',
    fontWeight: '700',
    fontSize: 18,
  },
  flatlist: {
    paddingHorizontal: 16,
    marginBottom: Platform.OS === 'android' ? 65 : 0,
  },
  itemStyle: {
    marginTop: 10,
  },
});

export default VideoScreen;
