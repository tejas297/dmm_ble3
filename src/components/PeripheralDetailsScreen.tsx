import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, PermissionsAndroid, Platform } from 'react-native';
import BleManager, { Peripheral, PeripheralInfo, BleManagerDidUpdateValueForCharacteristicEvent } from 'react-native-ble-manager';
import RNFS from 'react-native-fs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import type { RootStackParamList } from '../App';
import { Provider as PaperProvider, Text, Button, TextInput } from 'react-native-paper';
import { lightTheme } from '../theme'; // adjust path if needed
import classifyArray from './arrClasiffy';
interface PeripheralDetailsProps {
  route: {
    params: {
      peripheralData: PeripheralInfo;
    };
  };
}


export type RootStackParamList = {
  ScanDevices: undefined;
  PeripheralDetails: { peripheralData: any };
  ShowFiles: undefined;
};

const PeripheralDetailsScreen = ({ route }: PeripheralDetailsProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const peripheralData = route.params.peripheralData;
  const [receivedValues, setReceivedValues] = useState<{ ascii: string }[]>([]);
  const [lastSavedRow, setLastSavedRow] = useState<string[] | null>(null);
  const [userNote, setUserNote] = useState('');
    const labels = [
      'Date',
      'Device ID',
      'Temp °C',
      'Moisture %',
      'Weight (gm)',
      'Commodity Name',
    ];

    const units = {
  2: '°C',   // Temp
  3: '%',    // Moisture
  4: 'kg',   // Weight
};

  useEffect(() => {
    let stopped = false;
    const handleUpdateValueForCharacteristic = (
      data: BleManagerDidUpdateValueForCharacteristicEvent
    ) => {
      if (stopped) return;
      let ascii = '';
      if (Array.isArray(data.value)) {
        ascii = String.fromCharCode(...data.value).slice(1);
      } else if (typeof data.value === 'string') {
        ascii = data.value;
      }

      setReceivedValues((prev) => {
        if (
          prev.length === 0 ||
          prev[prev.length - 1].ascii !== ascii
        ) {
          const updated = [...prev, { ascii }];
          if (updated.length >= 3) {
            stopped = true;
            listener.remove();
          }
          return updated;
        }
        return prev;
      });
    };

    const listener = BleManager.onDidUpdateValueForCharacteristic(handleUpdateValueForCharacteristic);
    return () => {
      stopped = true;
      listener.remove();
    };
  }, []);

  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    if (Platform.Version >= 30) {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);

      const readGranted =
        granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED;
      const writeGranted =
        granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED;

      return readGranted && writeGranted;
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  };

  const saveMergedArrayToCsv = async (deviceName: string, arr: string[]) => {
    if (!deviceName) deviceName = 'NO_NAME';
    const safeName = deviceName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const path = `${RNFS.DocumentDirectoryPath}/${safeName}_data.csv`;
    const header = 'Date,Device ID,Temp,Moisture,Weight,Commodity Name,Note\n';
    const csvLine = arr.join(',') + '\n';
    console.log(csvLine)
    try {
      if (await RNFS.exists(path)) {
        await RNFS.appendFile(path, csvLine, 'utf8');
      } else {
        await RNFS.writeFile(path, header+csvLine, 'utf8');
      }
      return path;
    } catch (err) {
      throw err;
    }
  };

  const handleSave = async () => {
  const hasPermission = await requestStoragePermission();
  if (!hasPermission) {
    Alert.alert('Permission Denied', 'Storage permission is required to save device name.');
    return;
  }

  try {
    const deviceName =
      peripheralData?.name || peripheralData?.advertising?.localName || 'NO_NAME';

    const asciiArrays = receivedValues.slice(0, 3).map(val =>
      val.ascii.split(',').map(s => s.trim())
    );
        console.log(asciiArrays);
    const { deviceIdArray, readingsArray, commodityArray } = classifyArray(asciiArrays);
    
    const now = new Date();
    const formattedTime = now.toISOString(); // or use `toISOString()` for consistent format  OR const formattedTime = now.toLocaleString().replace(/,/g, ''); // "7/11/2025 5:23:10 PM"
      const finalArray = [formattedTime, ...deviceIdArray, ...readingsArray, ...commodityArray, userNote.trim().replaceAll("\n","|") || '']; //  timestamp + data + note

    console.log('Final array to save:', finalArray);

    const filePath = await saveMergedArrayToCsv(deviceName, finalArray);
    Alert.alert('Success', `Data saved to ${filePath}`);
  } catch (err) {
    Alert.alert('Error', 'Failed to save data: ' + (err as Error).message);
  }
};


  return (
    <PaperProvider theme={lightTheme}>
      <ScrollView style={styles.body} contentContainerStyle={styles.contentContainer}>

       
        {receivedValues.length == 3 ? (
          <View style={styles.dataBox}>
            <Text variant="titleMedium" style={styles.dataTitle}>DMM Received Data:</Text>
                  {(() => {
  const asciiArrays = receivedValues.slice(0, 3).map(val =>
    val.ascii.split(',').map(s => s.trim())
  ); 
    console.log(asciiArrays);
   const { deviceIdArray, readingsArray, commodityArray } = classifyArray(asciiArrays);
    const now = new Date();
    const formattedTime = now.toISOString(); // or use `toISOString()` for consistent format
    console.log(formattedTime);
      const finalArray = [formattedTime, ...deviceIdArray, ...readingsArray, ...commodityArray]; // 👈 timestamp + data + note

  return finalArray.map((ascii, idx) => (
    <View key={idx} style={styles.dataRow}>
      <Text selectable style={styles.dataText}>{labels[idx]} : {ascii}</Text>
    </View>
  ));
})()}
      </View>
        ) : (
          <Text style={styles.noData}>Waiting for BLE data from device...</Text>
        )}
        {/* <TextInput></TextInput> */}
        <TextInput
        label="Note (optional)"
        value={userNote}
        onChangeText={setUserNote}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.textInput}
      />
         <View style={{ marginTop: 20 }}/>
         <Button mode="contained" onPress={(handleSave)}>Save Data</Button>
         <View style={{ marginTop: 20 }}/>
        <Button mode="contained" onPress={() => navigation.navigate('ShowFiles')}>Show Files</Button>
      </ScrollView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  header: {
    paddingVertical: 18,
    backgroundColor: lightTheme.colors.primary,
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  contentContainer: {
    padding: 18,
  },
  textInput: {
  marginTop: 20,
  backgroundColor: lightTheme.colors.surface,
},
  dataBox: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: 10,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
  },
  dataTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 15,
    color: lightTheme.colors.primary,
  },
  dataRow: {
    marginBottom: 6,
  },
  dataText: {
    fontSize: 14,
    color: lightTheme.colors.text,
  },
  noData: {
    marginTop: 40,
    textAlign: 'center',
    color: lightTheme.colors.placeholder,
    fontSize: 16,
  },
});

export default PeripheralDetailsScreen;
