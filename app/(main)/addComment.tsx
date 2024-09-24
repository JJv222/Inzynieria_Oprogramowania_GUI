import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import constants from '@/constants/constants.json';

const AddComment = () => {
  const [description, setDescription] = useState('');
  const [userName, setUserName] = useState('admin'); // Na razie stała wartość dla użytkownika
  const router = useRouter();
  
  const API_URI_ADD_COMMENT = `${constants.API_URI}/AddComment`;

  const handleAddComment = async () => {
    try {
      const response = await axios.post(API_URI_ADD_COMMENT, {
        userName: userName,
        pinId: 1, // ID pinu, który będzie dynamiczny (można przekazać przez parametry)
        description: description,
        zdjecia: null // Zakładamy brak zdjęcia
      });

      if (response.status === 200) {
        alert('Comment added successfully!');
        router.back(); // Wracamy do poprzedniej strony
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a Comment</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter your comment"
        value={description}
        onChangeText={setDescription}
      />
      
      <Button title="Submit" onPress={handleAddComment} />
      <Button title="Cancel" onPress={() => router.back()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 10 }
});

export default AddComment;
