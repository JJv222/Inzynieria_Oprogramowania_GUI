import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import USER_ICON from '@/images/user_icon.png';
import axios from 'axios';
import constants from '@/constants/constants.json';

const Settings = () => {
  const API_URI_POST_Options = constants.API_URI + "/api/Users/GetUserProfile";
  const API_URI_APPLY_CHANGES = constants.API_URI + "/api/Options";  // Przykładowy endpoint do wysłania zmian
  const [username, setUsername] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [surname, setSurname] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [reputationPoints, setReputationPoints] = useState<number | null>(null);

  // Dodane: Ustawienia powiadomień
  const [sms, setSms] = useState<boolean>(false);
  const [emailOption, setEmailOption] = useState<boolean>(false);
  const [locationBased, setLocationBased] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {
      const storedUsername = await AsyncStorage.getItem('username');
      setUsername(storedUsername);

      if (storedUsername) {
        fetchUserProfile(storedUsername);
      }
    };
    loadUserData();
  }, []);

  const fetchUserProfile = async (username: string | null) => {
    try {
      const response = await axios.get(API_URI_POST_Options, {
        headers: { 'username': username },
      });
      const data = response.data;

      // Ustawienie danych użytkownika
      setUsername(data.username);
      setName(data.name);
      setSurname(data.surname);
      setPhoneNumber(data.phoneNumber);
      setEmail(data.email);
      setReputationPoints(data.reputation);

      // Ustawienie stanu checkboxów
      setSms(data.sms === 'true');
      setEmailOption(data.emailOption === 'true');
      setLocationBased(data.locationBased === 'true');

      // Zapisz dane w AsyncStorage (jeśli potrzebne)
      await AsyncStorage.setItem('username', data.username);
      await AsyncStorage.setItem('name', data.name);
      await AsyncStorage.setItem('surname', data.surname);
      await AsyncStorage.setItem('phoneNumber', data.phoneNumber);
      await AsyncStorage.setItem('email', data.email);
      await AsyncStorage.setItem('reputationPoints', data.reputation.toString());
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load user profile.');
    }
  };

  const handleApplyChanges = async () => {
    try {
      // Wysłanie zmienionych danych do API
      const response = await axios.post(API_URI_APPLY_CHANGES, {
        sms: sms.toString(),
        emailOption: emailOption.toString(),
        locationBased: locationBased.toString(),
    }, {
        headers: {
            'userName': username,
            'Content-Type': 'application/json'
        },
    });

      Alert.alert('Success', 'Changes applied successfully!');
    } catch (error) {
      console.error('Error applying changes:', error);
      Alert.alert('Error', 'Failed to apply changes.');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    Alert.alert('Logged Out', 'You have been logged out successfully.');
    router.push('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <Image source={USER_ICON} style={styles.userIcon} />
        {username ? (
          <>
            <Text style={styles.usernameText}>Username: {username}</Text>
            <Text style={styles.userDetailText}>Name: {name} {surname}</Text>
            <Text style={styles.userDetailText}>Phone: {phoneNumber}</Text>
            <Text style={styles.userDetailText}>Email: {email}</Text>
            <Text style={styles.userDetailText}>Reputation Points: {reputationPoints}</Text>
          </>
        ) : (
          <Text style={styles.loadingText}>Loading...</Text>
        )}
      </View>

      {/* Dodane: Checkboxy dla powiadomień */}
      <View style={styles.optionsContainer}>
        <View style={styles.optionRow}>
          <Text style={styles.optionText}>SMS Notifications</Text>
          <Switch value={sms} onValueChange={(value) => setSms(value)} />
        </View>

        <View style={styles.optionRow}>
          <Text style={styles.optionText}>Email Notifications</Text>
          <Switch value={emailOption} onValueChange={(value) => setEmailOption(value)} />
        </View>

        <View style={styles.optionRow}>
          <Text style={styles.optionText}>Location-Based Notifications</Text>
          <Switch value={locationBased} onValueChange={(value) => setLocationBased(value)} />
        </View>
      </View>

      <TouchableOpacity style={styles.applyButton} onPress={handleApplyChanges}>
        <Text style={styles.applyButtonText}>Apply Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  usernameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userDetailText: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  optionsContainer: {
    marginTop: 20,
    width: '80%',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  optionText: {
    fontSize: 18,
    color: '#333',
  },
  applyButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 30,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Settings;
