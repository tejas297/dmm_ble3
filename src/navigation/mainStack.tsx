// navigation/MainStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ConnectData from '../screens/ConnectData';
// import type {  RootStackParamList } from '../../App'; 
export type RootStackParamList = {
  Home: undefined;
  ConnectData: { device: any }; // ideally, replace `any` with a proper device type
};
const Stack = createNativeStackNavigator<RootStackParamList>();

const MainStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="ConnectData" component={ConnectData} />
  </Stack.Navigator>
);

export default MainStack;
