import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import constants from '@/constants/constants.json';
import DropDownPicker from 'react-native-dropdown-picker';
import USER_ICON from '@/images/user_icon.png';

interface Pin {
  id: string;
  longitude: string;
  latitude: number;
  userName: number;
  postType: string;
  category: string;
  title: string;
  description: string;
  likesUp: number;
  likesDown: number;
  reputation: number;
}

const Main = () => {
  const API_URI_POST_TYPES = constants.API_URI + '/api/PostType';
  const API_URI_POSTS = constants.API_URI + '/api/Pin';
  const [pins, setPins] = useState<Pin[]>([]);
  const [pinType, setPinType] = useState<string | null>(null);
  const [pinTypes, setPinTypes] = useState<{ label: string; value: string }[]>([]);
  const { username } = useLocalSearchParams();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPinTypes(); // Fetch all types on component load
  }, []);

  useEffect(() => {
    if (pinType) {
      fetchPinsByType(pinType); // Fetch pins by selected type
    }
  }, [pinType]);

  const fetchPinsByType = async (selectedType: string) => {

    try {
      const response = await axios.get(`${API_URI_POSTS}?postType=${selectedType}`); // Example API endpoint
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

  const handleDetailsPress = (selectedPin: Pin) => {
    // Przekazujemy wybrany pin do Details
    router.push(`/(main)/Details?id=${selectedPin.id}&username=${username}`);
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
        onLongPress={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          router.push(`/addPin?username=${username}&latitude=${latitude}&longitude=${longitude}&postType=${pinType}`);
        }}
      >
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
            title={pin.title}
            description={pin.description}
            reputation={pin.reputation}
          >
            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{pin.title}</Text>
                <Text>Likes Up: {pin.likesUp}</Text>
                <Text>Likes Down: {pin.likesDown}</Text>
                <Text>User Reputation: {pin.reputation}</Text>
                <Button title="Details" onPress={() => handleDetailsPress(pin)} />
              </View>
            </Callout>
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
          onChangeValue={(value) => {
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  topBar: {
    position: 'absolute',
    top: 10,
    right: '20%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdown: { width: 150, backgroundColor: '#fff', borderRadius: 5 },
  addButton: {
    position: 'absolute',
    backgroundColor: '#007bff',
    borderRadius: 5,
    margin: 15,
    padding: 15,
    bottom: 20,
    left: '20%',
    right: '20%',
  },
  addButtonText: { color: '#fff', fontSize: 16 },
  settingsIcon: { padding: 10 },
  iconImage: { width: 50, height: 50, resizeMode: 'contain' },
  calloutContainer: { width: 200, padding: 5 },
  calloutTitle: { fontWeight: 'bold' },
});

export default Main;
