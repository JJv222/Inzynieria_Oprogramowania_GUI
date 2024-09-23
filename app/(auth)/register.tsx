import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import constants from '@/constants/constants.json';
import CryptoJS from 'crypto-js';

const Register = () => {
  const API_URL = constants.API_URI + '/api/Users/Register';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password_repeat, setPassword_repeat] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [surname, setSurname] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[0-9]{1,4}?[-.\s]?(\(?\d{1,3}?\)?[-.\s]?)?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    return phoneRegex.test(phone);
  };

  const handleRegister = async () => {
    if (username && password && password_repeat && email && phone && surname && name) {
      if (password !== password_repeat) {
        Alert.alert('Error', 'Passwords do not match.');
        return;
      }
      if (!validateEmail(email)) {
        Alert.alert('Error', 'Invalid email address.');
        return;
      }
      if (!validatePhone(phone)) {
        Alert.alert('Error', 'Invalid phone number.');
        return;
      }

      const hashedPassword = CryptoJS.SHA1(password).toString(CryptoJS.enc.Hex);
      const hashedPasswordRepeat = CryptoJS.SHA1(password_repeat).toString(CryptoJS.enc.Hex);

      try {
        const response = await axios.post(API_URL, { 
          username: username, 
          name: name,
          surname: surname, // Poprawione: `surname` zamiast `surename`
          phoneNumber: phone, // Poprawione: `phoneNumber` zamiast `phone`
          password: hashedPassword, 
          passwordRepeat: hashedPasswordRepeat, 
          email: email
        }, 
        {
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.status === 201) {
          Alert.alert('Registration Successful');
          router.push('/login');
        } else {
          Alert.alert('Registration Failed', 'Please try again.');
        }
      } catch (error) {
        Alert.alert('Error', 'An error occurred. Please try again.');
        console.error(error);
      }
    } else {
      Alert.alert('Error', 'Please fill in all fields.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor='gray'
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Surname" // Poprawione placeholder
        placeholderTextColor='gray'
        value={surname}
        onChangeText={setSurname}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        placeholderTextColor='gray'
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor='gray'
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="gray"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Repeat Password"
        placeholderTextColor="gray"
        secureTextEntry
        value={password_repeat}
        onChangeText={setPassword_repeat}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="gray"
        value={email}
        onChangeText={setEmail}
      />
      <Button title="Register" onPress={handleRegister} />
      <Text>Already have an account?</Text>
      <Button title="Login" onPress={() => router.push('/login')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default Register;
