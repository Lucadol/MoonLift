import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';

interface NumberPickerProps {
  visible: boolean;
  min: number;
  max: number;
  interval: number;
  onSelect: (selectedNumber: number) => void;
  onClose: () => void;
}

const NumberPicker: React.FC<NumberPickerProps> = ({ visible, min, max, interval, onSelect, onClose }) => {
  const [numbers, setNumbers] = useState<number[]>(Array.from({ length: (max - min) / interval + 1 }, (_, i) => min + i * interval));

  const renderItem = ({ item }: { item: number }) => (
    <TouchableOpacity onPress={() => onSelect(item)} style={styles.item}>
      <Text style={styles.itemText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        <View style={styles.modal}>
          <FlatList
            data={numbers}
            renderItem={renderItem}
            keyExtractor={(item) => item.toString()}
            showsVerticalScrollIndicator={false}
          />
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: 'black',
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 15,
    width: '80%',
    maxHeight: '80%',
  },
  item: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemText: {
    fontSize: 18,
    color: 'white',
  },
  closeButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: 'white',
  },
});

export default NumberPicker;
