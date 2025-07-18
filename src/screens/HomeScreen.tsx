import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Button, List } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { useNavigation } from '@react-navigation/native';
// const navigation = useNavigation();

type RootStackParamList = {
  Home: undefined;
  ConnectData: { device: any };
  Records: {
    screen: 'Stack1';
    params: { device: any };
  };
  Stack1: { device: any };
};
type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [showList, setShowList] = useState(false);

  const data = [
    { id: '1', name: 'Device A' },
    { id: '2', name: 'Device B' },
    { id: '3', name: 'Device C' },
  ];

  const renderItem = ({ item }: { item: any }) => (
    <List.Item
      title={item.name}
      left={(props) => <List.Icon {...props} icon="bluetooth" />}
       onPress={() =>
      navigation.navigate('Records', {
        screen: 'Stack1',
        params: { device: item }, // pass item if needed
      })
    }
      // onPress={() => navigation.navigate('mainStack', { screen: 'ConnectData', params: { device: item } })}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.topRightRow}>
        <Button onPress={() => setShowList((prev) => !prev)}>Scan</Button>
      </View>
      <Text variant="titleLarge">Welcome to Home</Text>
      {showList && (
        <FlatList
          style={{ marginTop: 20, width: '100%' }}
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  topRightRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16,
  },
});

export default HomeScreen;
