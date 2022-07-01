import {View, Text, StyleSheet, TouchableOpacity, Linking} from 'react-native';
import React from 'react';

const PermissionBox = ({hasCameraPerm, hasMicPerm}) => {
  return (
    <View style={styles.permContainer}>
      <View style={styles.permInnerContainer}>
        <View style={{alignItems: 'center'}}>
          <Text style={styles.permMainText}>Permissions</Text>
          <Text style={styles.permText}>
            Camera : {hasCameraPerm ? 'Granted' : 'Missing'}
          </Text>
          <Text style={styles.permText}>
            Microphone : {hasMicPerm ? 'Granted' : 'Missing'}
          </Text>
        </View>
        {(!hasCameraPerm || !hasMicPerm) && (
          <View style={{paddingTop: 10}}>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => Linking.openSettings()}>
              <Text style={styles.settingsTextButton}>Open Settings</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  permContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 100,
  },
  permInnerContainer: {
    backgroundColor: 'yellow',
    padding: 20,
    borderRadius: 10,
  },
  permMainText: {fontSize: 20, fontWeight: '700', color: 'black'},
  permText: {fontSize: 18, color: 'black'},
  settingsButton: {
    paddingTop: 10,
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 10,
  },
  settingsTextButton: {fontSize: 15, color: 'black', alignSelf: 'center'},
});

export default PermissionBox;
