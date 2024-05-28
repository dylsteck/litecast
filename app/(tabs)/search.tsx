import { FlashList } from '@shopify/flash-list';
import { formatDistanceToNow } from 'date-fns';
import _ from 'lodash';
import React, { useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';


const SearchScreen = () => {

  return (
    <View style={styles.container}>
    </View>
  );
};

const styles = StyleSheet.create({
  castContainer: {
    borderBottomWidth: 1,
    borderColor: '#eaeaea',
    flexDirection: 'row',
    padding: 10,
    width: '100%',
  },
  castText: {
    color: '#333',
    fontSize: 14,
    lineHeight: 18,
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  displayName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  flashList: {
    backgroundColor: '#fff',
  },
  headerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  icon: {
    resizeMode: 'contain',
  },
  pfpImage: {
    borderRadius: 25,
    height: 30,
    marginLeft: 10,
    marginRight: 15,
    width: 30,
  },
  reactionText: {
    color: '#000',
    fontSize: 11,
  },
  reactionTextFirst: {
    color: '#000',
    fontSize: 11,
  },
  reactionsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  reactionsGroupContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 4,
  },
  timestamp: {
    color: '#666',
    fontSize: 12,
    paddingBottom: 4,
    paddingRight: 6,
  },
});

export default SearchScreen;