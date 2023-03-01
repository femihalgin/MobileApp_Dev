import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [image, setImage] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const takePicture = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const saveData = async () => {
    try {
      let data = await AsyncStorage.getItem('pictures');
      let pictures = data !== null ? JSON.parse(data) : [];
      let newPicture = {
        image: image,
        notes: notes,
        location: location,
        time: new Date().getTime(),
      };
      pictures.push(newPicture);
      await AsyncStorage.setItem('pictures', JSON.stringify(pictures));
      Alert.alert('Picture saved successfully!');
      setNotes('');
      setImage(null);
      setLocation(null);
    } catch (e) {
      console.log(e);
    }
  };

  let locationText = 'Waiting for location...';
  if (errorMsg) {
    locationText = errorMsg;
  } else if (location) {
    locationText = `Longitude: ${location.coords.longitude}, Latitude: ${location.coords.latitude}`;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={takePicture}>
        <Text style={styles.buttonText}>Take Picture</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <TextInput
        style={styles.input}
        onChangeText={text => setNotes(text)}
        value={notes}
        placeholder="Notes"
      />
      <Text style={styles.location}>{locationText}</Text>
      <TouchableOpacity style={styles.button} onPress={saveData}>
        <Text style={styles.buttonText}>Save Picture</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    margin: 10,
    width: '80%',
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginVertical: 20,
  },
});