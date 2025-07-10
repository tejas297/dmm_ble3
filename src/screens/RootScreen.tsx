import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from './HomeScreen';
import RecordsScreen from './RecordsScreen';
import { lightTheme } from '../theme';
import MainStack from '../navigation/mainStack';

const Drawer = createDrawerNavigator();

const RootScreen = () => (
  <Drawer.Navigator initialRouteName="Home"screenOptions={{
    headerStyle: { backgroundColor: lightTheme.colors.primary },
    headerTintColor: 'white',
    drawerActiveTintColor: lightTheme.colors.primary,
  }}>
    <Drawer.Screen name="Home" component={HomeScreen} />
    <Drawer.Screen name="Records" component={RecordsScreen} />
    <Drawer.Screen name="HomeDrawer" component={MainStack} options={{ title: 'Home11' }} />
  </Drawer.Navigator>
);

export default RootScreen;
