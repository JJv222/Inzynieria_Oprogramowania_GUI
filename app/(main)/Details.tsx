import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button, StyleSheet,ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import constants from '@/constants/constants.json';

interface PinDetails {
    id: string;
    longitude: number;
    latitude: number;
    userName: string;
    postType: string;
    category: string;
    title: string;
    description: string;
    likesUp: number;
    likesDown: number;
    author: string;
    zdjecia: string;  // base64 encoded image
}

const Details = () => {
  const { id } = useLocalSearchParams(); // Get the pin ID from URL params
  const [pinDetails, setPinDetails] = useState<PinDetails | null>(null);
  const router = useRouter();
  const API_URI_PIN_DETAILS = `${constants.API_URI}/api/Pin/details?postId=${id}`;

  useEffect(() => {
    if (id) {
      fetchPinDetails();
    }
  }, [id]);

  const fetchPinDetails = async () => {
    try {
      const response = await axios.get(API_URI_PIN_DETAILS);
      setPinDetails(response.data);
    } catch (error) {
      console.error('Error fetching pin details:', error);
    }
  };

  if (!pinDetails) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{pinDetails.title}</Text>
      <Text>Author: {pinDetails.author}</Text>
      <Text>Likes Up: {pinDetails.likesUp}</Text>
      <Text>Likes Down: {pinDetails.likesDown}</Text>
      <Text>Description: {pinDetails.description}</Text>
      {pinDetails.zdjecia && (
        <Image
          style={styles.image}
          source={{ uri: `data:image/jpeg;base64,${pinDetails.zdjecia}` }}
        />
      )}
      <Button title="Back" onPress={() => router.back()} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  image: { width: '90%', height: '90%', marginVertical: 20 },
});

export default Details;
