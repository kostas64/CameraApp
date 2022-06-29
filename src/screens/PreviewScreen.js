import {View, Text, Image} from 'react-native';
import React from 'react';
import {TouchableOpacity} from 'react-native-gesture-handler';

const PreviewScreen = ({navigation, route}) => {
  console.log('Media ', route?.params?.media);
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <TouchableOpacity onPress={() => navigation.pop()}>
        <Text>Go back</Text>
      </TouchableOpacity>
      <Image
        source={{uri: `file://${route?.params?.media}`}}
        style={{height: 200, width: 200}}
      />
    </View>
  );
};

export default PreviewScreen;
