import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native'
import { Link, useNavigation } from 'expo-router'
import { useRoute } from '@react-navigation/native'
import { useLogin } from 'farcasterkit-react-native'
import useAppContext from '../../hooks/useAppContext'

const UserScreen = () => {
  const { farcasterUser } = useLogin()
  const { user } = useAppContext()
  const route = useRoute<any>()
  const fname = route.params?.fname as string
  const navigation = useNavigation<any>()
  const handleBackPress = () => {
    navigation.navigate('index')
  }

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={handleBackPress}>
          <Text style={{ paddingLeft: 15, fontWeight: '300' }}>Back</Text>
        </TouchableOpacity>
      ),
      title: user?.fname ?? fname,
      headerTitleStyle: {
        color: 'black',
      },
    })
  }, [navigation])

  return (
    <View style={styles.container}>
      {farcasterUser !== null && user !== null && (
        <>
          <View style={styles.detailsContainer}>
            <Image
              source={{ uri: farcasterUser?.pfp ?? user?.pfp }}
              style={styles.pfpImage}
              alt={`PFP for @${farcasterUser?.fname ?? user?.fname}`}
              width={48}
              height={48}
            />
            <View style={styles.detailsNameContainer}>
              <Text>{farcasterUser?.displayName ?? user?.displayName}</Text>
              <Text>@{farcasterUser?.fname ?? user?.fname}</Text>
              <Text style={{ maxWidth: '97%', paddingTop: 16 }}>
                {farcasterUser?.profile?.bio ?? user?.profile?.bio}
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  )
}

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
    flexDirection: 'row',
  },
  detailsNameContainer: {
    flexDirection: 'column',
    paddingTop: 5,
    gap: 2,
  },
})

export default UserScreen
