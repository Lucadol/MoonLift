import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import NumberPicker from '../../components/NumberPicker' // Assurez-vous de spécifier le bon chemin d'importation

const ConfigurationPage: React.FC = () => {
    const [selectedMinutes, setSelectedMinutes] = useState<number>(1); // État pour stocker le nombre sélectionné
    const [selectedMinutesTotal, setSelectedMinutesTotal] = useState<number>(10); // État pour stocker le nombre sélectionné
    const [isNumberPickerVisible, setIsNumberPickerVisible] = useState<boolean>(false); // État pour contrôler la visibilité du NumberPicker
  
    // Handler pour sélectionner les minutes
    const handleMinutesSelect = (selectedMinutes: number) => {
      setSelectedMinutes(selectedMinutes);
      setSelectedMinutesTotal(selectedMinutes);
      setIsNumberPickerVisible(false);
    };

    return (
        <>
            <View style={styles.containerTempsSerie}>
            <Text style={styles.text}>Toutes les</Text>
            <TouchableOpacity onPress={() => setIsNumberPickerVisible(true)} style={styles.selectedMinutesContainer}>
                <Text style={styles.selectedMinutesText}>{selectedMinutes}</Text>
            </TouchableOpacity>
        
            {/* Afficher le NumberPicker pour sélectionner les minutes */}
            <NumberPicker
                visible={isNumberPickerVisible}
                min={1}
                max={10}
                interval={1}
                onSelect={handleMinutesSelect}
                onClose={() => setIsNumberPickerVisible(false)}
            />
            </View>

            <View style={styles.containerTempsSerie}>
            <Text style={styles.text}>Pendant</Text>
            <TouchableOpacity onPress={() => setIsNumberPickerVisible(true)} style={styles.selectedMinutesContainer}>
                <Text style={styles.selectedMinutesText}>{selectedMinutesTotal}</Text>
            </TouchableOpacity>
        
            {/* Afficher le NumberPicker pour sélectionner les minutes */}
            <NumberPicker
                visible={isNumberPickerVisible}
                min={1}
                max={30}
                interval={1}
                onSelect={handleMinutesSelect}
                onClose={() => setIsNumberPickerVisible(false)}
            />
            </View>
        </>
      );
    };

const styles = StyleSheet.create({
  containerTempsSerie: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 20,
  },
  selectedMinutesContainer: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  selectedMinutesText: {
    fontSize: 20,
    color: 'white',
  }
});

export default ConfigurationPage;
