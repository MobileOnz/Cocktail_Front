import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import theme from '../../assets/styles/theme';

const Maps = () => {
  return (
    <View style={styles.topBar}>
      <Image source={require('../../assets/search/')}></Image>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    backgroundColor : theme.background
  },
});

export default Maps;