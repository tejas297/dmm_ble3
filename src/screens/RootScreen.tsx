import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from './HomeScreen';
import RecordsScreen from './RecordsScreen';
import { lightTheme } from '../theme';
import SecondStack  from './SecondStack';
import { Text } from 'react-native-paper';
import ScanDevicesScreen from '../components/ScanDevicesScreen';
import ShowFilesScreen from '../components/ShowFilesScreen';
const Drawer = createDrawerNavigator();

const RootScreen = () => (
  <Drawer.Navigator initialRouteName="DMM APP"
    screenOptions={{
      headerStyle: { backgroundColor: lightTheme.colors.primary, },
      headerShown: true,
      // headerBackVisible: true,
      headerTintColor: 'white',
      drawerActiveTintColor: lightTheme.colors.primary,
  }}
  
  >
    <Drawer.Screen name="DMM APP" component={SecondStack} options={{ title: "DMM APP" }} />
    <Drawer.Screen name="Show Files" component={ShowFilesScreen} options={{ headerShown: false, drawerItemStyle: { display: 'flex' } }} />
  </Drawer.Navigator>
);

export default RootScreen;
