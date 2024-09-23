import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import axios from 'axios';
import constants from '@/constants/constants.json';
import DropDownPicker from 'react-native-dropdown-picker';
import USER_ICON from '@/images/user_icon.png';

interface Pin {
  id: string;
  userId: string;
  longitude: number;
  latitude: number;
  postyTypeId: string;
  categoryId: string;
  title: string;
  description: string;
  likesUp: number;
  likesDown: number;
  zdjecia: string;  // base64 encoded image
}

const Main = () => {
  const API_URI_POST_TYPES = constants.API_URI + '/api/PostType';
  const API_URI_POSTS = constants.API_URI + '/api/Pin';
  const [pins, setPins] = useState<Pin[]>([]);
  const [pinType, setPinType] = useState<string | null>(null);
  const [pinTypes, setPinTypes] = useState<{ label: string; value: string }[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPins();
    fetchPinTypes();
  }, []);

  const fetchPins = async () => {
    try {
      const response = await axios.get(API_URI_POSTS);
      setPins(response.data);
    } catch (error) {
      console.error('Error fetching pins:', error);
    }
  };

  const fetchPinTypes = async () => {
    try {
      const response = await axios.get(API_URI_POST_TYPES);
      const formattedTypes = response.data.map((type: string) => ({
        label: type,
        value: type,
      }));
      setPinTypes(formattedTypes);
    } catch (error) {
      console.error('Error fetching pin types:', error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 52.4064, // Poznań coordinates
          longitude: 16.9252,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
            title={pin.title}
            description={pin.description}
          >
            {pin.zdjecia && (
              <View style={styles.imageContainer}>
                <Image
                  style={styles.image}
                  source={{ uri: `data:image/jpeg;base64,${pin.zdjecia}` }}
                />
                <Text>{pin.title}</Text>
              </View>
            )}
          </Marker>
        ))}
      </MapView>

      <View style={styles.topBar}>
        <DropDownPicker
          open={open}
          value={pinType}
          items={pinTypes}
          setOpen={setOpen}
          setValue={setPinType}
          style={styles.dropdown}
          placeholder="Select Type"
          containerStyle={{ width: 150, height: 40 }}
          onChangeValue={value => {
            setPinType(value);
          }}
        />

        <TouchableOpacity
          style={styles.settingsIcon}
          onPress={() => router.push('(user_account)/user_profile')}
        >
          <Image source={USER_ICON} style={styles.iconImage} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/add')}>
        <Text style={styles.addButtonText}>Add Konfiture</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 10,
    right: '20%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdown: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    backgroundColor: '#007bff',
    borderRadius: 5,
    textAlign: 'center',
    margin: 15,
    padding: 15,
    bottom: 20,
    left: '20%',
    right: '20%',
    paddingHorizontal: 10,
  },
  iconImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  settingsIcon: {
    padding: 10,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 100,
    height: 100,
  },
});

export default Main;
