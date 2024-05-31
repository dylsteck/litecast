import React, { useCallback, useEffect, useState } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import useAppContext from '../hooks/useAppContext'
import { useSearchChannel } from '../hooks/useSearchChannels'
import { debounce, max } from 'lodash'

const FilterModal = ({ visible, onClose }) => {
  const { filter, setFilter } = useAppContext()
  const [minFID, setMinFID] = useState(0)
  const [maxFID, setMaxFID] = useState(Infinity)
  const [searchChannels, setSearchChannels] = useState('')
  const [fetchedChannels, setFetchedChannels] = useState([])
  const [fetchedMutedChannels, setFetchedMutedChannels] = useState([])
  const [muteChannels, setMuteChannels] = useState('')
  const [selectedChannels, setSelectedChannels] = useState([])
  const [selectedMutedChannels, setSelectedMutedChannels] = useState([])

  const handleClearAll = () => {
    setMinFID(0)
    setMaxFID(Infinity)
    setSearchChannels('')
    setMuteChannels('')
    setSelectedChannels([])
    setSelectedMutedChannels([])
  }

  const removeChannel = (channel) => {
    console.log("CHANNEL ", channel)
    setSelectedChannels(selectedChannels.filter((c) => c !== channel))
    setFilter((prev) => ({
      ...prev,
      showChannels: selectedChannels.filter((c) => c !== channel),
    }))
  }

  const removeMutedChannel = (channel) => {
    setSelectedMutedChannels(selectedMutedChannels.filter((c) => c !== channel))
    setFilter((prev) => ({
      ...prev,
      mutedChannels: selectedMutedChannels.filter((c) => c !== channel),
    }))
  }

  const handleSetMinFID = (text) => {
    setMinFID(Number(text))
  }

  const handleSetMaxFID = (text) => {
    const numericValue = parseFloat(text);
    if (!isNaN(numericValue)) {
      setMaxFID(numericValue);
    } else {
      setMaxFID('');
    }
  };
  
  const handleApply = () => {
    setFilter((prev) => ({
      ...prev,
      lowerFid: minFID,
      upperFid: maxFID,
      showChannels: [...prev.showChannels, ...selectedChannels],
      mutedChannels: [...prev.mutedChannels, ...selectedMutedChannels],
    }))
    onClose()
  }

  useEffect(() => {
    const upperFidValue = typeof filter?.upperFid === 'number' ? filter.upperFid.toString() : '';
    setMaxFID(upperFidValue);
  }, [filter?.upperFid]);

  const handleAddMutedChannel = (channel) => {
    setSelectedMutedChannels((prev) => [...prev, channel.id])
    setMuteChannels('')
    setFetchedMutedChannels([])
  }

  const handleAddChannel = (channel) => {
    setSelectedChannels((prev) => [...prev, channel.id])
    setSearchChannels('')
    setFetchedChannels([])
  }

  const debouncedSearch = useCallback(
    debounce(async (text) => {
      const { channels } = await useSearchChannel(text)
      setFetchedChannels(channels)
    }, 1000),
    [],
  )

  useEffect(() => {
    if (searchChannels?.length > 0) {
      debouncedSearch(searchChannels)
    }
    return () => {
      debouncedSearch.cancel()
    }
  }, [searchChannels, debouncedSearch])

  const debouncedMuteSearch = useCallback(
    debounce(async (text) => {
      const { channels } = await useSearchChannel(text)
      setFetchedMutedChannels(channels)
    }, 1000),
    [],
  )

  useEffect(() => {
    if (muteChannels?.length > 0) {
      debouncedMuteSearch(muteChannels)
    }
    return () => {
      debouncedMuteSearch.cancel()
    }
  }, [muteChannels, debouncedMuteSearch])

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
                <TextInput
                  style={styles.input}
                  value={minFID.toString()}
                  onChangeText={handleSetMinFID}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text>Max</Text>
                <TextInput
                  style={styles.input}
                  value={
                    maxFID.toString() === 'Infinity' ? '' : maxFID.toString()
                  }
                  onChangeText={handleSetMaxFID}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.sectionHeader}>Search Channels</Text>
            <TextInput
              style={styles.searchInput}
              value={searchChannels}
              onChangeText={setSearchChannels}
              placeholder="Search channels"
            />
            {fetchedChannels.map((channel) => (
              <TouchableOpacity
                onPress={() => handleAddChannel(channel)}
                key={channel}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginVertical: 10,
                  padding: 4,
                  borderWidth: 1,
                  borderColor: 'gray',
                  borderRadius: 10,
                }}
              >
                <Image
                  source={{ uri: channel.image_url }}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 10,
                    marginRight: 10,
                  }}
                />
                <Text className="mr-1">{channel.name}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.chipContainer}>
              {selectedChannels.map((channel) => (
                <View key={channel} style={styles.chip}>
                  <Text className="mr-1">{channel}</Text>
                  <TouchableOpacity onPress={() => removeChannel(channel)}>
                    <FontAwesome name="times" size={16} color="black" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <Text style={styles.sectionHeader}>Mute Channels</Text>
            <TextInput
              style={styles.searchInput}
              value={muteChannels}
              onChangeText={setMuteChannels}
              placeholder="Mute channels"
            />
            {fetchedMutedChannels.map((channel) => (
              <TouchableOpacity
                onPress={() => handleAddMutedChannel(channel)}
                key={channel}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginVertical: 10,
                  padding: 4,
                  borderWidth: 1,
                  borderColor: 'gray',
                  borderRadius: 10,
                }}
              >
                <Image
                  source={{ uri: channel.image_url }}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 10,
                    marginRight: 10,
                  }}
                />
                <Text className="mr-1">{channel.name}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.chipContainer}>
              {selectedMutedChannels.map((channel) => (
                <View key={channel} style={styles.chip}>
                  <Text className="mr-1">{channel}</Text>
                  <TouchableOpacity onPress={() => removeMutedChannel(channel)}>
                    <FontAwesome name="times" size={16} color="black" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearAll}
              >
                <Text style={styles.buttonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApply}
              >
                <Text style={styles.buttonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

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
  closeButtonText: {
    fontSize: 24,
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
    borderWidth: 1, // Added border width
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
})

export default FilterModal
