import { FontAwesome } from '@expo/vector-icons'
import { useRoute, useNavigation } from '@react-navigation/native'
import React, { useState, useCallback } from 'react'
import {
  Alert,
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native'
import { Link, useRouter } from 'expo-router'
import useAppContext from '../hooks/useAppContext'
import FilterList from './FilterComponent'
import { Notifications } from './Notification'

const HomeHeaderRight = () => {
  const navigation = useNavigation()
  const { fid } = useAppContext()
  const [isFilterVisible, setFilterVisible] = useState(false)
  const [isSelected, setIsSelected] = useState('filter')
  const router = useRouter()

  const handleSelect = useCallback((name) => {
    setIsSelected(name)
  }, [])

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          handleSelect('filter')
          router.push(`/(tabs)/channel?type=channel&fid=${fid}`)
        }}
      >
        <Text style={[styles.linkText]}>CozyCast</Text>
      </Pressable>
      <Pressable
        style={styles.filterBtn}
        onPress={() => setFilterVisible(true)}
      >
        <FontAwesome
          name="filter"
          size={18}
          color="#565555"
          style={styles.filterIcon}
        />
      </Pressable>

      <FilterList
        visible={isFilterVisible}
        onClose={() => setFilterVisible(false)}
      />
      <Notifications />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: '2.5%',
    paddingBottom: '2.5%',
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: '34%',
  },
  linkText: {
    fontSize: 18,
    fontWeight: 'normal',
  },
  filterIcon: {
    paddingTop: 5,
    paddingLeft: 10,
    paddingRight: 15,
  },
  filterBtn: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
  },
})

export default HomeHeaderRight
