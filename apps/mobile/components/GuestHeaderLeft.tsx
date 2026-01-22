import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useNavigation } from 'expo-router';

const GuestHeaderLeft = () => {
  const navigation = useNavigation();
  
  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text>Back</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 10,
  }
});

export default GuestHeaderLeft;
