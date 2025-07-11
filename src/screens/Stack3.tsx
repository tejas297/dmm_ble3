
import React from 'react';
import { View } from 'react-native';
import { Text,Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Stack2 from './Stack2';
export type SecondStackParamList = {
  Stack1: undefined;
  Stack2: undefined;
};
const Stack3 = () => {
            const navigation = useNavigation<NativeStackNavigationProp<SecondStackParamList>>();
//   const navigation = useNavigation();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text variant="titleLarge">1 Screen</Text>
      <Button onPress={() => navigation.navigate('Stack2')}>Go to Stack 2</Button>
    </View>
  );
};

export default Stack3;
