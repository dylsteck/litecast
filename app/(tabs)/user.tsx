import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import ComposeCast from '../../components/ComposeCast';
import { Link, useNavigation } from 'expo-router';
import { useRoute } from '@react-navigation/native';
import { useLogin } from 'farcasterkit-react-native';


const UserScreen = () => {
  const { farcasterUser } = useLogin();
  const route = useRoute();
  const fname = route.params?.fname as string;
  const navigation = useNavigation();
  const handleBackPress = () => {
    navigation.navigate('index');
  };

  // TODO: re-implement for other user-pages to fetch their data
  // const [warpcastUser, setWarpcastUser] = useState<WarpcastUserProfile | null>(null);
  // useEffect(() => {
  //   (async function fetchWarpcastUser() {
  //     if(farcasterUser !== null) {
  //       const response = await fetch(`https://client.warpcast.com/v2/user?fid=${farcasterUser.fid}`);
  //       const data = await response.json() as WarpcastUserProfileResponse;
  //       const user = data.result.user;
  //       setWarpcastUser(user);
  //     }
  //   })();
  // }, [farcasterUser]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={handleBackPress}>
          <Text style={{paddingLeft: 15, fontWeight: '300'}}>Back</Text>
        </TouchableOpacity>
      ),
      title: fname,
      headerTitleStyle: {
        color: 'black'
      }
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      {farcasterUser !== null && 
      <>
      <View style={styles.detailsContainer}>
        <Image source={{ uri: farcasterUser.pfp }} style={styles.pfpImage} alt={`PFP for @${farcasterUser.fname}`} width={48} height={48} />
        <View style={styles.detailsNameContainer}>
          <Text>{farcasterUser.displayName}</Text>
          <Text>@{farcasterUser.fname}</Text>
          <Text style={{maxWidth: '97%', paddingTop: 16}}>{farcasterUser.profile.bio}</Text>
        </View>
      </View>
      </>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'space-between',
  },
  pfpImage: {
    width: 50,
    height: 50,
    borderRadius: 36,
  },
  detailsContainer: {
    paddingTop: 12,
    padding: 18,
    flex: 1,
    flexDirection: 'row'
  },
  detailsNameContainer: {
    flexDirection: 'column',
    paddingTop: 5,
    gap: 2
  },
});

export default UserScreen;