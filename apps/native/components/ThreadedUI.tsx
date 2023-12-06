import _ from 'lodash';
import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

import { NeynarCastV1 } from '../app/modal';

const ThreadedUI = ({items}: { items: NeynarCastV1[] }) => {

  return (
    <View style={styles.container}>
      {_.map(items, (item, index) => (
        <View key={`reply-${item.hash}`} style={styles.itemContainer}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.author.pfp.url }} style={styles.image} alt={`@${item.author.username}'s PFP`} />
          {index < items.length - 1 && <View style={styles.connectorLine} />}
        </View>
        <Text style={styles.itemText}>{item.text}</Text>
      </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
    connectorLine: {
      backgroundColor: 'grey',
      height: 60, 
      left: 25, 
      position: 'absolute',
      top: 50, 
      width: 2,
      zIndex: -1,
    },
    container: {
      flex: 1,
      flexDirection: 'column',
      width: '100%',
    },
    image: {
      borderRadius: 25,
      height: 50,
      width: 50,
    },
    imageContainer: {
      marginRight: 10,
    },
    itemContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      paddingLeft: 10,
      paddingVertical: 10,
    },
    itemText: {
      flex: 1,
    },
  });

export default ThreadedUI;
