import {
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
  Image,
  FlatList,
} from 'react-native';
import {storage} from '../../firebase';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {ref, listAll, getDownloadURL} from 'firebase/storage';
import React, {useCallback, useEffect, useState} from 'react';
import {SAFE_AREA_PADDING} from '../Constants';

const VideoScreen = ({navigation, route}) => {
  const [videos, setVideos] = useState([]);

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

  const renderItem = ({item, index}) => {
    return (
      <View
        key={index}
        style={[
          styles.itemStyle,
          index !== 0 && index % 3 !== 0 && {paddingLeft: 8},
        ]}>
        <Image
          source={{uri: videos[index]}}
          style={{
            height: Dimensions.get('window').width / 3.5,
            width: Dimensions.get('window').width / 3.5,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: Dimensions.get('window').width / 9,
            left:
              index !== 0 && index % 3 !== 0
                ? Dimensions.get('window').width / 9 + 8
                : Dimensions.get('window').width / 9,
          }}>
          <AntDesign size={20} color={'white'} name={'play'} />
        </View>
      </View>
    );
  };

  const listItemsHandler = useCallback(() => {
    const listRef = ref(storage, 'thumb_videos/');

    listAll(listRef).then(res => {
      res.items.forEach(item => {
        const listItemRef = ref(storage, item._location.path_);

        getDownloadURL(listItemRef).then(url =>
          setVideos(oldVideos => {
            return [...oldVideos, url];
          }),
        );
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
      <FlatList
        data={videos}
        renderItem={renderItem}
        style={styles.flatlist}
        numColumns={3}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
