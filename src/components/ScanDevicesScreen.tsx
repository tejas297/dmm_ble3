import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  StatusBar,
  Platform,
  PermissionsAndroid,
  FlatList,
  TouchableHighlight,
  Pressable,
  Alert,
} from 'react-native';
import { Text, Provider as PaperProvider, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BleManager, {
  BleDisconnectPeripheralEvent,
  BleScanCallbackType,
  BleScanMatchMode,
  BleScanMode,
  Peripheral,
} from 'react-native-ble-manager';
import { lightTheme } from '../theme'; // Adjust the path as needed

export type RootStackParamList = {
  ScanDevices: undefined;
  PeripheralDetails: { peripheralData: any };
  ShowFiles: undefined;
};

const SECONDS_TO_SCAN_FOR = 3;
const SERVICE_UUIDS: string[] = [];
const ALLOW_DUPLICATES = true;

declare module 'react-native-ble-manager' {
  interface Peripheral {
    connected?: boolean;
    connecting?: boolean;
  }
}

const ScanDevicesScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'ScanDevices'>>();

  const [isScanning, setIsScanning] = useState(false);
  const [peripherals, setPeripherals] = useState(new Map<string, Peripheral>());

  const handleStopScan = () => {
    setIsScanning(false);
    console.debug('[handleStopScan] scan is stopped.');
  };

  const handleDisconnectedPeripheral = (event: BleDisconnectPeripheralEvent) => {
    setPeripherals((map) => {
      let p = map.get(event.peripheral);
      if (p) {
        p.connected = false;
        return new Map(map.set(event.peripheral, p));
      }
      return map;
    });
  };

  const handleConnectPeripheral = (_event: any) => {};

  const handleDiscoverPeripheral = (peripheral: Peripheral) => {
    if (!peripheral.name) peripheral.name = 'NO NAME';
    setPeripherals((map) => new Map(map.set(peripheral.id, peripheral)));
  };

  const togglePeripheralConnection = async (peripheral: Peripheral) => {
    if (peripheral?.connected) {
      try {
        await BleManager.disconnect(peripheral.id);
      } catch (error) {
        console.error(`[togglePeripheralConnection][${peripheral.id}] disconnect error`, error);
      }
    } else {
      await connectPeripheral(peripheral);
    }
  };

  const connectPeripheral = async (peripheral: Peripheral) => {
    try {
      setPeripherals((map) => {
        let p = map.get(peripheral.id);
        if (p) {
          p.connecting = true;
          return new Map(map.set(p.id, p));
        }
        return map;
      });

      await BleManager.connect(peripheral.id);
      await sleep(900);

      if (Platform.OS === 'android') {
        try {
          await BleManager.requestMTU(peripheral.id, 512);
        } catch {}
      }

      const peripheralData = await BleManager.retrieveServices(peripheral.id);

      setPeripherals((map) => {
        let p = map.get(peripheral.id);
        if (p) {
          p.connecting = false;
          p.connected = true;
          return new Map(map.set(p.id, p));
        }
        return map;
      });

      if (peripheralData.characteristics?.length) {
        const notifiableChar = peripheralData.characteristics.find(
          (char) => char.properties?.Notify || char.properties?.Indicate
        );
        if (notifiableChar) {
          try {
            await BleManager.startNotification(
              peripheral.id,
              notifiableChar.service,
              notifiableChar.characteristic
            );
          } catch {}
        }
      }

      navigation.navigate('PeripheralDetails', {
        peripheralData: peripheralData as any,
      });
    } catch (error) {
      console.error(`[connectPeripheral][${peripheral.id}] error`, error);
    }
  };

  function sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  const scanForDevices = async () => {
    try {
      await handleAndroidPermissions();
      await BleManager.enableBluetooth();
      setIsScanning(true);
      setPeripherals(new Map());
      BleManager.scan(SERVICE_UUIDS, SECONDS_TO_SCAN_FOR, ALLOW_DUPLICATES, {
        matchMode: BleScanMatchMode.Sticky,
        scanMode: BleScanMode.LowLatency,
        callbackType: BleScanCallbackType.AllMatches,
      }).catch(console.error);
    } catch (error) {
      console.error('Error initializing BLE:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await BleManager.start({ showAlert: false });
        scanForDevices();
      } catch (error) {
        console.error('BLE Init error:', error);
      }
    };

    const listeners = [
      BleManager.onDiscoverPeripheral(handleDiscoverPeripheral),
      BleManager.onStopScan(handleStopScan),
      BleManager.onConnectPeripheral(handleConnectPeripheral),
      BleManager.onDisconnectPeripheral(handleDisconnectedPeripheral),
    ];

    init();
    return () => listeners.forEach((l) => l.remove());
  }, []);

  const handleEnableBluetooth = async () => {
   try {
    await BleManager.enableBluetooth();
    Alert.alert('Bluetooth enable request sent');
  } catch (error) {
    Alert.alert('Failed to enable Bluetooth:',
       'Unknown error');
  }
};

  const handleAndroidPermissions = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
    } else if (Platform.OS === 'android' && Platform.Version >= 23) {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (!granted) {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      }
    }
  };

  const renderItem = ({ item }: { item: Peripheral }) => {
    const backgroundColor = item.connected ? '#e8f5e9' : lightTheme.colors.surface;
    return (
      <TouchableHighlight
        underlayColor={lightTheme.colors.primary}
        onPress={() => togglePeripheralConnection(item)}
      >
        <View style={[styles.row, { backgroundColor }]}>
          <Text style={styles.peripheralName}>
            {/* {item.name} - {item?.advertising?.localName} */}
            {item.name}
            {item.connecting && ' - Connecting...'}
          </Text>
          <Text style={styles.rssi}>RSSI: {item.rssi}</Text> 
          <Text style={styles.peripheralId}>{item.id}</Text>
        </View>
      </TouchableHighlight>
    );
  };

  return (
    <PaperProvider theme={lightTheme}>
      <SafeAreaView style={styles.body}>
        <StatusBar backgroundColor={lightTheme.colors.primary} barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {isScanning ? 'Scanning for DMM...' : 'Nearby DMM B18 Devices'}
          </Text>
         <Button
  mode="contained"
  icon="bluetooth"
  onPress={handleEnableBluetooth}
  style={styles.bleButton}
  uppercase
>
  Enable Bluetooth
</Button>
          <Pressable
            style={[styles.scanButton, isScanning && { backgroundColor: lightTheme.colors.disabled }]}
            onPress={scanForDevices}
            disabled={isScanning}
          >
            <Text style={styles.scanButtonText}>
              {isScanning ? 'Scanning...' : 'Scan'}
            </Text>
          </Pressable>
        </View>
        <FlatList
          data={Array.from(peripherals.values())}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyRow}>
              <Text style={styles.noPeripherals}>
                {isScanning ? 'Scanning...' : 'No Peripherals found.'}
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  header: {
    paddingVertical: 20,
    backgroundColor: lightTheme.colors.primary,
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    color: lightTheme.colors.onPrimary || '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
bleButton: {
  backgroundColor: lightTheme.colors.primary,
  borderRadius: 8,
  marginTop: 4,
  width: 200,
  alignSelf: 'center',
  // borderBlockStartColor:lightTheme.colors.accent
},
 bleButtonText: {
  color: lightTheme.colors.onPrimary || '#fff',
  fontSize: 14,
  fontWeight: '600',
},
  scanButton: {
    backgroundColor: lightTheme.colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
  },
  scanButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  listContent: {
    padding: 12,
  },
  row: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderColor: lightTheme.colors.border,
    borderWidth: 1,
  },
  peripheralName: {
    color: lightTheme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  rssi: {
    color: lightTheme.colors.placeholder,
    fontSize: 13,
    marginBottom: 2,
  },
  peripheralId: {
    color: lightTheme.colors.disabled,
    fontSize: 12,
  },
  emptyRow: {
    marginTop: 40,
    alignItems: 'center',
  },
  noPeripherals: {
    fontSize: 15,
    color: lightTheme.colors.placeholder,
  },
});

export default ScanDevicesScreen;
