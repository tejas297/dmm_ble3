/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */




import * as React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import RootScreen from './src/screens/RootScreen';
import { lightTheme } from './src/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

//utilize the react-native-paper components, the theme will be applied to all components automatically
//the theme is defined in src/theme.ts and imported here
//the SafeAreaView is used to ensure the content is rendered within the safe area of the device
// those components which are not in react-native-paper should be imported from 'react-native' or other libraries and apply theme customly like drawer sidebar.


function App(): React.JSX.Element {
  return (
    <PaperProvider theme={lightTheme}>
      <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer>
        <RootScreen />
      </NavigationContainer>
      </SafeAreaView>
    </PaperProvider>
  );
}



export default App;
