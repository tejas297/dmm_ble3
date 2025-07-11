import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text,IconButton,Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Stack1 from './Stack1';
import ScanDevicesScreen from '../components/ScanDevicesScreen';
import PeripheralDetailsScreen from '../components/PeripheralDetailsScreen';
import Stack2 from './Stack2';
import ShowFilesScreen from '../components/ShowFilesScreen';
export type RecordsStackParamList = {
  Stack1: undefined;
  ScanDevices: undefined;
  PeripheralDetails: { peripheralData: any };
  ShowFiles: undefined;
  Stack2: undefined;
};
const Stack = createNativeStackNavigator<RecordsStackParamList>();

function SecondStack() {
   const navigation = useNavigation();
  return (
    <Stack.Navigator initialRouteName='ScanDevices'  screenOptions={{
        headerShown: false, // 
        headerBackVisible: true,
      }}>
      <Stack.Screen name="ScanDevices" component={ScanDevicesScreen} options={{ title: 'st1',headerBackVisible: true,headerLeft: () => (
        <IconButton
          icon="arrow"
          size={24}
          onPress={() => navigation.goBack()}
          style={{ marginRight: 10 }}
        />
      ), }} />
      <Stack.Screen name="PeripheralDetails" component={PeripheralDetailsScreen} options={{ title: 'st2',headerBackVisible: true }} />
      <Stack.Screen name="ShowFiles" component={ShowFilesScreen} options={{ title: 'st3',headerBackVisible: true }} />

    </Stack.Navigator>
  );
}

export default SecondStack;