import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Image, Text, Keyboard, TouchableWithoutFeedback, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import constants from '@/constants/constants.json';

const AddCommentPage = () => {
    const { id, username } = useLocalSearchParams();  // Pobranie ID posta z parametrów URL
    const [comment, setComment] = useState('');
    const [image, setImage] = useState<string | null>(null);  // Przechowywanie wybranego zdjęcia
    const [charCount, setCharCount] = useState(0);  // Przechowywanie liczby liter (znaków)
    const router = useRouter();
    const charLimit = 150;

    const API_URI_ADD_COMMENT = `${constants.API_URI}/api/Comment`;

    // Funkcja do wybierania obrazu
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'You need to grant permission to access the media library.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
            base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0].base64 || null);  // Ustawienie obrazu w base64
        }
    };

    // Funkcja do zamykania klawiatury
    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    // Funkcja do zliczania liter (znaków) i ograniczenia do 500 znaków
    const handleCommentChange = (text: string) => {  
        if (text.length <= charLimit) {
            setComment(text);
            setCharCount(text.length);  // Zliczamy znaki
        } else {
            Alert.alert('Character Limit Reached', `You can only enter up to ${charLimit} characters.`);
        }
    };

    // Funkcja do dodania komentarza
    const handleAddComment = async () => {
        if (!comment) {
            Alert.alert('Error', 'Comment cannot be empty.');
            return;
        }

        try {
            await axios.post(API_URI_ADD_COMMENT, {
                pinId: id,
                userName: username,
                description: comment,
                zdjecia: image, 
            });

            Alert.alert('Success', 'Comment added successfully!');
            router.back();  // Powrót do poprzedniej strony po dodaniu komentarza
        } catch (error) {
            console.error('Error adding comment:', error);
            Alert.alert('Error', 'Failed to add comment. Please try again.');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                {/* Tekst opakowany w <Text> */}
                <TextInput
                    style={styles.textInput}
                    placeholder="Write your comment..."
                    value={comment}
                    onChangeText={handleCommentChange}
                    multiline
                    onSubmitEditing={dismissKeyboard}  // Zamyka klawiaturę po zatwierdzeniu
                    returnKeyType="done"
                />

                {/* Liczba znaków */}
                <Text style={styles.charCount}>Character count: {charCount}/{charLimit}</Text>

                {/* Dodajemy przycisk do wyboru zdjęcia */}
                <Button title="Pick an image" onPress={pickImage} />

                {/* Wyświetlamy wybrane zdjęcie */}
                {image && (
                    <Image
                        source={{ uri: `data:image/jpeg;base64,${image}` }}
                        style={styles.imagePreview}
                    />
                )}

                {/* Przyciski Submit i Cancel */}
                <View style={styles.buttonContainer}>
                    <Button title="Submit Comment" onPress={handleAddComment} />
                    <Button title="Cancel" onPress={() => router.back()} />
                </View>
            </ScrollView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9'
    },
    contentContainer: {
        padding: 20,
        justifyContent: 'center',
    },
    textInput: {
        height: 150,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        marginBottom: 10,
        backgroundColor: '#fff'
    },
    imagePreview: {
        width: '100%',
        height: 200,
        marginTop: 20,
        marginBottom: 20,
        borderRadius: 10
    },
    charCount: {
        fontSize: 14,
        color: '#888',
        textAlign: 'right',
        marginBottom: 10,
    },
    buttonContainer: {
        marginTop: 20,
    }
});

export default AddCommentPage;
