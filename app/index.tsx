import React from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Logo from '@/images/Logo5.jpg';

const { width, height } = Dimensions.get('window');

const Login = () => {
  const router = useRouter();
  const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

   return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Image
          style={styles.image}
          source={Logo}
          placeholder={{ blurhash }}
          contentFit="cover"
          transition={1000}
        />
        <View style={styles.overlay}>
          <View style={styles.bottomContainer}>
            <Text style={styles.text}>Welcome to EventPins!</Text>
            <Pressable style={styles.button} onPress={() => router.push('(auth)/login')}>
              <Text style={styles.buttonText}>Login</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={() => router.push('(auth)/register')}>
              <Text style={styles.buttonText}>Register</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end', // Align content to the bottom
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent overlay
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 40, // Adjust padding to position items above the bottom safe area
  },
  text: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default Login;
