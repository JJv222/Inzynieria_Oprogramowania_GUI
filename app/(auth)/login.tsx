import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import constants from '@/constants/constants.json';
import CryptoJS from 'crypto-js';

const Login = () => {
  const API_URL = constants.API_URI + '/api/Users/Login';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (username && password) {
      // Oblicz hash hasła bezpośrednio przed wysłaniem żądania
      const hashedPassword = CryptoJS.SHA1(password).toString(CryptoJS.enc.Hex);
  
      console.log(password);
      console.log(hashedPassword);
  
      try {
        const response = await axios.post(API_URL, { name: username, password: hashedPassword }, {
          headers: { 'Content-Type': 'application/json' },
        });
  
        if (response.status === 200) {
          Alert.alert('Login Successful', `Welcome, ${username}!`);
          router.push('/main');
        } else {
          Alert.alert('Login Failed', 'Please try again.');
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
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="gray"
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
      <Button title="Login" onPress={handleLogin} />
      <Text>Don't have account ??</Text>
      <Button title="Register" onPress={() => router.push('/register')} />
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

export default Login;
