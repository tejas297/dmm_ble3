import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, IconButton, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Stack1 from './Stack1';
import ScanDevicesScreen from '../components/ScanDevicesScreen';
import PeripheralDetailsScreen from '../components/PeripheralDetailsScreen';
import Stack2 from './Stack2';
import ShowFilesScreen from '../components/ShowFilesScreen';

//
//  RecordsStackParamList is a TypeScript type used to define the list of screens and their expected route parameters for a specific navigator — in this case, a stack navigator.

// the "ScanDevices1" route corresponds to the "ScanDevicesScreen" component,
// and the "PeripheralDetails" route corresponds to the "PeripheralDetailsScreen" component.
// The initial route for the stack is the "ScanDevices1" route.

//Pass params to a route by putting them in an object as a second parameter 
// to the navigation.navigate function: navigation.navigate('RouteName', { /* params go here */ })
// Read the params in your screen component: route.params.

//A route refers to a screen or page in the app. It's how users move from one screen to another.
// In React Native for example:
// You define routes to manage navigation between different views/screens.
//    <Stack.Screen name="Home" component={HomeScreen} />   ,  i think this is Route with name "Home" and corrospond component "HomeScreen"
//    <Stack.Screen name="Profile" component={ProfileScreen} />

export type StackParamList = {
  //route name : their parameters
  //A route name refers to (or called as) a screen name defined in a navigator. 
  // we can also define initial parameters

  //Each screen component in your app is provided with the route object as a prop automatically.

  //React Navigation can be configured to type-check screens and
  //  their params, as well as various other APIs using TypeScript.
  Stack1: undefined;
  ScanDevices1: undefined;
  PeripheralDetails: { peripheralData: any };
  ShowFiles: undefined;
  Stack2: undefined;
};
const Stack = createNativeStackNavigator<StackParamList>();
function SecondStack() {
  // if we wnat to go from on screen to other on button click we utilize navigation object in component
  const navigation = useNavigation();
  //  console.log(navigation)
  return (
    //“Hey navigator, if I navigate to 'PeripheralDetails', render the PeripheralDetailsScreen component.”
    <Stack.Navigator initialRouteName='ScanDevices1' screenOptions={{
      headerShown: false, // 
      headerBackVisible: true,
    }}>
      <Stack.Screen name="ScanDevices1" component={ScanDevicesScreen} options={{
        title: 'st1', headerBackVisible: true, headerLeft: () => (
          <IconButton
            icon="arrow"
            size={24}
            onPress={() => navigation.goBack()}
            style={{ marginRight: 10 }}
          />
        ),
      }} />
      <Stack.Screen name="PeripheralDetails" component={PeripheralDetailsScreen} options={{ title: 'st2', headerBackVisible: true }} />
      <Stack.Screen name="ShowFiles" component={ShowFilesScreen} options={{ title: 'st3', headerBackVisible: true }} />

    </Stack.Navigator>
  );
}
// console.log(Stack.Screen.name);

export default SecondStack;