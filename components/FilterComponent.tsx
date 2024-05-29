import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
}

const FilterList: React.FC<FilterModalProps> = ({ visible, onClose }) => {
  const [minFID, setMinFID] = useState('');
  const [maxFID, setMaxFID] = useState('');
  const [searchChannels, setSearchChannels] = useState('');
  const [muteChannels, setMuteChannels] = useState('');

  const handleClearAll = () => {
    setMinFID('');
    setMaxFID('');
    setSearchChannels('');
    setMuteChannels('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          <ScrollView>
            <Text style={styles.header}>Filter</Text>

            <Text style={styles.sectionHeader}>FID</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text>Min</Text>
                <TextInput
                  style={styles.input}
                  value={minFID}
                  onChangeText={setMinFID}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text>Max</Text>
                <TextInput
                  style={styles.input}
                  value={maxFID}
                  onChangeText={setMaxFID}
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
            <View style={styles.chipContainer}>
              <Text style={styles.chip}>CNBC</Text>
              <Text style={styles.chip}>BBC</Text>
              <Text style={styles.chip}>CNN</Text>
            </View>

            <Text style={styles.sectionHeader}>Mute Channels</Text>
            <TextInput
              style={styles.searchInput}
              value={muteChannels}
              onChangeText={setMuteChannels}
              placeholder="Mute channels"
            />
            <View style={styles.chipContainer}>
              <Text style={styles.chip}>CNBC</Text>
              <Text style={styles.chip}>BBC</Text>
              <Text style={styles.chip}>CNN</Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
                <Text style={styles.buttonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={onClose}>
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
    display:'flex',
    justifyContent:'center',
    backgroundColor: 'white',
    borderRadius: 0,
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
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
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
});

export default FilterList;