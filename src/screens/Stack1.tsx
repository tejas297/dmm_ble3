import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button, TextInput, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import type { SecondStackParamList } from './Stack2'; // adjust if Stack2 is not defining this
export type SecondStackParamList = {
  Stack1: undefined;
  Stack2: undefined;
};
const Stack1 = () => {
  const navigation = useNavigation<NativeStackNavigationProp<SecondStackParamList>>();

  const [inputs, setInputs] = useState(['']);
  
  const handleAddInput = () => {
    setInputs([...inputs, '']);
  };

  const handleChange = (text: string, index: number) => {
    const updated = [...inputs];
    updated[index] = text;
    setInputs(updated);
  };

  const handleSave = () => {
    console.log('Saved values:', inputs);
    // Perform save logic
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
      <Text variant="headlineMedium" style={{ marginBottom: 20 }}>
        Screen 1
      </Text>

      {/* Five static labeled Text components */}
      <View style={{ marginBottom: 20 }}>
        <Text variant="bodyLarge">Label 1</Text>
        <Text variant="bodyLarge">Label 2</Text>
        <Text variant="bodyLarge">Label 3</Text>
        <Text variant="bodyLarge">Label 4</Text>
        <Text variant="bodyLarge">Label 5</Text>
      </View>

      {/* Dynamic TextInputs */}
      {inputs.map((value, index) => (
        <TextInput
          key={index}
          label={`Input ${index + 1}`}
          value={value}
          mode="outlined"
          style={{ marginBottom: 10 }}
          onChangeText={(text) => handleChange(text, index)}
        />
      ))}

      {/* Add Input Button */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
        <IconButton
          icon="plus"
          size={24}
          onPress={handleAddInput}
          style={{ backgroundColor: '#e0e0e0' }}
        />
        <Text>Add more input</Text>
      </View>

      {/* Save Button at bottom */}
      <Button
        mode="contained"
        onPress={handleSave}
        style={{ marginTop: 'auto', paddingVertical: 8 }}
      >
        Save
      </Button>

      {/* Navigation Button to Stack2 */}
      <Button 
        mode="outlined" 
        onPress={() => navigation.navigate('Stack2')} 
        style={{ marginTop: 10 }}
      >
        Go to Stack 2
      </Button>
    </ScrollView>
  );
};

export default Stack1;
