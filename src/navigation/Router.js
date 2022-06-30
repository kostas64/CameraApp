import React from 'react';
import HomeScreen from '../screens/HomeScreen';
import VideoScreen from '../screens/VideoScreen';
import CameraScreen from '../screens/CameraScreen';
import PreviewScreen from '../screens/PreviewScreen';
import PictureScreen from '../screens/PictureScreen';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Platform} from 'react-native';
const Stack = createStackNavigator();
const BottomStack = createBottomTabNavigator();

const Router = () => {
  return (
    <NavigationContainer>
      <BottomStack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          tabBarStyle: [
            {
              position: 'absolute',
            },
            Platform.OS === 'android' && {height: 60, paddingBottom: 5},
          ],
        }}>
        <BottomStack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarInactiveTintColor: 'black',
            tabBarIcon: ({color}) => {
              return <AntDesign name="home" size={20} color={color} />;
            },
          }}
        />
        <BottomStack.Screen
          name="CameraStack"
          component={CameraStack}
          options={{
            tabBarLabel: 'Camera',
            tabBarStyle: {display: 'none'},
            tabBarInactiveTintColor: 'black',
            tabBarLabelStyle: {fontSize: 14},
            tabBarIcon: ({color}) => (
              <AntDesign name="camerao" size={20} color={color} />
            ),
          }}
        />
        <BottomStack.Screen
          name="Picture"
          component={PictureScreen}
          options={{
            tabBarInactiveTintColor: 'black',
            tabBarIcon: ({color}) => (
              <AntDesign name="picture" size={20} color={color} />
            ),
          }}
        />
        <BottomStack.Screen
          name="Video"
          component={VideoScreen}
          options={{
            tabBarInactiveTintColor: 'black',
            tabBarIcon: ({color}) => (
              <AntDesign name="videocamera" size={20} color={color} />
            ),
          }}
        />
      </BottomStack.Navigator>
    </NavigationContainer>
  );
};

const CameraStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Camera"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="Preview" component={PreviewScreen} />
    </Stack.Navigator>
  );
};

export default Router;
