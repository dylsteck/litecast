import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

const HomeHeaderLeft = () => {
  // TODO: Implement user profile picture display with new auth system
  // Hardcoded for now
  const defaultPfp = 'https://i.imgur.com/placeholder.png';

  return (
    <View style={styles.container}>
      {/* <Link href={`/user?fname=guest`}>
        <Image source={{ uri: defaultPfp }} style={styles.image} />
      </Link> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 15,
  },
  image: {
    borderRadius: 15,
    height: 30,
    width: 30,
    zIndex: 1,
  }
});

export default HomeHeaderLeft;
