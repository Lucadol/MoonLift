import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import NumberPicker from '../../components/NumberPicker'; // Assurez-vous de spécifier le bon chemin d'importation

const ConfigurationPage: React.FC = () => {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(1); // État pour stocker le nombre sélectionné pour les minutes
  const [selectedMinutesTotal, setSelectedMinutesTotal] = useState<number>(10); // État pour stocker le nombre sélectionné pour les minutes totales
  const [isMinutesPickerVisible, setIsMinutesPickerVisible] = useState<boolean>(false); // État pour contrôler la visibilité du NumberPicker pour les minutes
  const [isMinutesTotalPickerVisible, setIsMinutesTotalPickerVisible] = useState<boolean>(false); // État pour contrôler la visibilité du NumberPicker pour les minutes totales

  // Handler pour sélectionner les minutes
  const handleMinutesSelect = (selectedMinutes: number) => {
    setSelectedMinutes(selectedMinutes);
    setIsMinutesPickerVisible(false);
  };

  // Handler pour sélectionner les minutes totales
  const handleMinutesTotalSelect = (selectedMinutes: number) => {
    setSelectedMinutesTotal(selectedMinutes);
    setIsMinutesTotalPickerVisible(false);
  };

  // Handler pour démarrer les chronomètres
  const startTimers = () => {
    // Lancer les chronomètres en fonction de la durée et de l'intervalle sélectionnés
    for (let i = 0; i < selectedMinutes; i++) {
      setTimeout(() => {
        alert(`Chronomètre ${i + 1} démarré pendant ${selectedMinutesTotal} minute(s)`);
      }, i * selectedMinutesTotal * 60000); // Convertir la durée en millisecondes
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>EMOM</Text>
            <View style={styles.containerSerie}>
                <Text style={styles.text}>Toutes les</Text>
                <TouchableOpacity
                    onPress={() => setIsMinutesPickerVisible(true)}
                    style={styles.selectedMinutesContainer}
                    >
                <Text style={styles.selectedMinutesText}>{selectedMinutes}</Text>
                </TouchableOpacity>
            </View>
    
            <View style={styles.containerTotal}>
                <Text style={styles.text}>Pendant</Text>
                <TouchableOpacity
                    onPress={() => setIsMinutesTotalPickerVisible(true)}
                    style={styles.selectedMinutesContainer}
                    >
                <Text style={styles.selectedMinutesText}>{selectedMinutesTotal}</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={startTimers} style={styles.startButton}>
                <Text style={styles.startButtonText}>Démarrer les chronomètres</Text>
            </TouchableOpacity>

         {/* Afficher le NumberPicker pour sélectionner les minutes */}
         <NumberPicker
          visible={isMinutesPickerVisible}
          min={1}
          max={10}
          interval={1}
          onSelect={handleMinutesSelect}
          onClose={() => setIsMinutesPickerVisible(false)}
        />

        {/* Afficher le NumberPicker pour sélectionner les minutes totales */}
        <NumberPicker
          visible={isMinutesTotalPickerVisible}
          min={1}
          max={30}
          interval={1}
          onSelect={handleMinutesTotalSelect}
          onClose={() => setIsMinutesTotalPickerVisible(false)}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },
    containerSerie: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    containerTotal: {
        flexDirection: 'row',
        alignItems: 'center',
    },
title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
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
  },
  startButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  startButtonText: {
    fontSize: 16,
    color: 'white',
  },
});

export default ConfigurationPage;
