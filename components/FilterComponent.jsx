import React, { useCallback, useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAppContext from '../hooks/useAppContext';
import { useSearchChannel } from '../hooks/useSearchChannels';
import { debounce } from 'lodash';
import { LOCAL_STORAGE_KEYS } from '../constants/Farcaster';
import toast from 'react-hot-toast/headless'
import { eventEmitter } from '../utils/event';

const FilterModal = ({ visible, onClose }) => {
  const { filter, setFilter, setFilterChange } = useAppContext();
  const [minFID, setMinFID] = useState(0);
  const [maxFID, setMaxFID] = useState(Infinity);
  const [searchChannels, setSearchChannels] = useState('');
  const [muteChannels, setMuteChannels] = useState('');
  const [fetchedChannels, setFetchedChannels] = useState([]);
  const [fetchedMutedChannels, setFetchedMutedChannels] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [selectedMutedChannels, setSelectedMutedChannels] = useState([]);
  const [isPowerBadgeHolder, setIsPowerBadgeHolder] = useState(false);

  const handleClearAll = useCallback(() => {
    toast('Filters Removd', {
      icon: '❌',
    });
    setMinFID(0);
    setMaxFID(Infinity);
    setSearchChannels('');
    setMuteChannels('');
    setSelectedChannels([]);
    setSelectedMutedChannels([]);
    setFilter({
      lowerFid: 0,
      upperFid: Infinity,
      showChannels: [],
      mutedChannels: [],
      isPowerBadgeHolder: false,
    })
    AsyncStorage.setItem(LOCAL_STORAGE_KEYS.FILTERS, JSON.stringify({
      lowerFid: 0,
      upperFid: Infinity,
      showChannels: [],
      mutedChannels: [],
      isPowerBadgeHolder: false,
    }));
    setFilterChange((prev) => !prev);
  }, []);

  const updateFilter = useCallback((newFilter) => {
    setFilter(newFilter);
    AsyncStorage.setItem(LOCAL_STORAGE_KEYS.FILTERS, JSON.stringify(newFilter));
    setFilterChange((prev) => !prev);
  }, [setFilter]);

  const handleSetMaxFID = (text) => {
    const numericValue = parseFloat(text);
    setMaxFID(!isNaN(numericValue) ? numericValue : '');
  };

  const handleApply = useCallback(() => {
    toast('Filters Applied', {
      icon: '🔥',
    });

    const newFilter = {
      ...filter,
      lowerFid: minFID,
      upperFid: maxFID,
      showChannels: [...selectedChannels],
      mutedChannels: [...selectedMutedChannels],
      isPowerBadgeHolder,
    };
    updateFilter(newFilter);
    onClose();
  }, [filter, minFID, maxFID, selectedChannels, selectedMutedChannels, isPowerBadgeHolder, onClose, updateFilter]);

  useEffect(() => {
    const fetchFilters = async () => {
      const filters = await AsyncStorage.getItem(LOCAL_STORAGE_KEYS.FILTERS);
      if (filters) {
        const parsedFilters = JSON.parse(filters);
        setFilter(parsedFilters);
        setMinFID(parsedFilters.lowerFid);
        setMaxFID(parsedFilters.upperFid);
        setSelectedChannels(parsedFilters.showChannels);
        setSelectedMutedChannels(parsedFilters.mutedChannels);
        setFilterChange((prev) => !prev);
        setIsPowerBadgeHolder(parsedFilters.isPowerBadgeHolder);
      }
    };
    fetchFilters();
  }, [setFilter]);

  const debouncedSearch = useCallback(
    debounce(async (text) => {
      const { channels } = await useSearchChannel(text);
      setFetchedChannels(channels);
    }, 1000),
    [],
  );

  useEffect(() => {
    if (searchChannels?.length > 0) {
      debouncedSearch(searchChannels);
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchChannels, debouncedSearch]);

  const debouncedMuteSearch = useCallback(
    debounce(async (text) => {
      const { channels } = await useSearchChannel(text);
      setFetchedMutedChannels(channels);
    }, 1000),
    [],
  );

  useEffect(() => {
    if (muteChannels?.length > 0) {
      debouncedMuteSearch(muteChannels);
    }
    return () => {
      debouncedMuteSearch.cancel();
    };
  }, [muteChannels, debouncedMuteSearch]);

  const handleAddChannel = (channel) => {
    setSearchChannels('')
    setSelectedChannels([...selectedChannels, channel.id])
    setFetchedChannels([])
  }

  const handleAddMuteChannel = (channel) => {
    setMuteChannels('')
    setSelectedMutedChannels([...selectedMutedChannels, channel.id])
    setFetchedMutedChannels([])
  }

  useEffect(() => {
    eventEmitter.emit('filterChanged', filter);
  }, [filter]);

  useEffect(() => {
    const handleApplyFilter = (newFilter) => {
      updateFilter(newFilter);
      AsyncStorage.setItem(LOCAL_STORAGE_KEYS.FILTERS, JSON.stringify(newFilter));
    }

    eventEmitter.on('filterChanged', handleApplyFilter)

    return () => {
      eventEmitter.off('filterChanged', handleApplyFilter)
    }
  }, [])

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FontAwesome name="times" size={24} color="black" />
          </TouchableOpacity>
          <ScrollView>
            <Text style={styles.header}>Filter</Text>
            <Text style={styles.sectionHeader}>FID</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text>Min</Text>
                <TextInput style={styles.input} value={minFID?.toString()} onChangeText={(text) => setMinFID(Number(text))} keyboardType="numeric" />
              </View>
              <View style={styles.inputContainer}>
                <Text>Max</Text>
                <TextInput style={styles.input} value={maxFID?.toString() === 'Infinity' ? '' : maxFID?.toString()} onChangeText={handleSetMaxFID} keyboardType="numeric" />
              </View>
            </View>
            <Text style={styles.sectionHeader}>Power Badge Holder</Text>
            {/* Checkbox */}
            <TouchableOpacity onPress={() => setIsPowerBadgeHolder(!isPowerBadgeHolder)} style={styles.channelContainer}>
              <Text>{isPowerBadgeHolder ? '✅' : '❌'}</Text>
              <Text style={{ marginLeft: 4 }}>Power Badge Holder</Text>
            </TouchableOpacity>
            <Text style={styles.sectionHeader}>Search Channels</Text>
            <TextInput style={styles.searchInput} value={searchChannels} onChangeText={setSearchChannels} placeholder="Search channels" />
            {fetchedChannels?.slice(0,5).map((channel) => (
              <TouchableOpacity key={channel.id} onPress={() => handleAddChannel(channel)} style={styles.channelContainer}>
                <Image source={{ uri: channel.image_url }} style={styles.channelImage} />
                <Text>{channel.name}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.chipContainer}>
              {selectedChannels.map((channel) => (
                <View key={channel} style={styles.chip}>
                  <Text>{channel}</Text>
                  <TouchableOpacity onPress={() => setSelectedChannels(selectedChannels.filter((c) => c !== channel))}>
                    <FontAwesome name="times" size={16} color="black" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <Text style={styles.sectionHeader}>Mute Channels</Text>
            <TextInput style={styles.searchInput} value={muteChannels} onChangeText={setMuteChannels} placeholder="Mute channels" />
            {fetchedMutedChannels.map((channel) => (
              <TouchableOpacity key={channel.id} onPress={() => handleAddMuteChannel(channel)} style={styles.channelContainer}>
                <Image source={{ uri: channel.image_url }} style={styles.channelImage} />
                <Text>{channel.name}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.chipContainer}>
              {selectedMutedChannels?.slice(0,5).map((channel) => (
                <View key={channel} style={styles.chip}>
                  <Text>{channel}</Text>
                  <TouchableOpacity onPress={() => setSelectedMutedChannels(selectedMutedChannels.filter((c) => c !== channel))}>
                    <FontAwesome name="times" size={16} color="black" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
                <Text style={{...styles.buttonText, color: "#000"}}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                <Text style={styles.buttonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
    height: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 15,
    margin: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  clearButton: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  applyButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  channelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    padding: 10,
  },
  channelImage: {
    width: 24,
    height: 24,
    borderRadius: 10,
    marginRight: 10,
  },
});

export default React.memo(FilterModal);