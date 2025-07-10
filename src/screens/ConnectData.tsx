// screens/ConnectData.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const ConnectData = ({ route }:{route:any}) => {
  const { device } = route.params;

  return (
    <View style={styles.container}>
      <Text variant="titleLarge">Connect to {device.name}</Text>
      <Text>Device ID: {device.id}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
});

export default ConnectData;
