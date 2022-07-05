import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  Platform,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {storage} from '../../firebase';
import {SAFE_AREA_PADDING} from '../Constants';
import ImageView from 'react-native-image-viewing';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {ref, listAll, getDownloadURL} from 'firebase/storage';
import React, {useCallback, useEffect, useState} from 'react';

const SCREEN_WIDTH = Dimensions.get('window').width;

const PictureScreen = ({navigation, route}) => {
  const [images, setImages] = useState([]);
  const [imageView, setImageView] = useState([]);
  const [imageViewVis, setImageViewVis] = useState(false);
  const [emptyState, setEmptyState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const focus = navigation.addListener('focus', () => {
      if (route?.params?.from === 'Camera' || images.length === 0) {
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
  }, [navigation, listItemsHandler, images, route]);

  useEffect(() => {
    const focusListener = navigation.addListener('focus', () => {
      navigation.setOptions({
        tabBarIcon: ({color}) => {
          return <AntDesign name="picture" size={26} color={color} />;
        },
        tabBarLabelStyle: {fontSize: 16, fontWeight: '700'},
      });
    });
    const blurListener = navigation.addListener('blur', () => {
      navigation.setOptions({
        tabBarIcon: ({color}) => {
          return <AntDesign name="picture" size={20} color={color} />;
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
    if (imageView.length !== 0) {
      setImageViewVis(true);
    }
  }, [imageView]);

  const listItemsHandler = useCallback(() => {
    const listRef = ref(storage, 'thumb_images/');
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
            setImages(sortedArray);
          });
      });
    });
  }, []);

  const renderItem = ({item, index}) => {
    return (
      <TouchableOpacity
        onPress={() => imageOpeningHandler(item)}
        key={index}
        style={[
          styles.itemStyle,
          index !== 0 && index % 3 !== 0 && {paddingLeft: 8},
        ]}>
        <Image
          source={{uri: images[index]}}
          style={{
            height: SCREEN_WIDTH / 3.5,
            width: SCREEN_WIDTH / 3.5,
          }}
        />
      </TouchableOpacity>
    );
  };

  const imageOpeningHandler = item => {
    const itemRef = ref(storage, item);
    getDownloadURL(itemRef).then(url => setImageView([{uri: url}]));
  };

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
        <Text style={styles.title}>Photo Gallery</Text>
      </View>
      {emptyState && !isLoading && (
        <View style={styles.center}>
          <Text style={{fontSize: 20, fontWeight: '700'}}>
            No pictures to show
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
            data={images}
            renderItem={renderItem}
            style={styles.flatlist}
            numColumns={3}
            showsVerticalScrollIndicator={false}
          />
          <ImageView
            images={imageView}
            imageIndex={0}
            visible={imageViewVis}
            onRequestClose={() => setImageViewVis(false)}
          />
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

export default PictureScreen;
