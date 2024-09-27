import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Image, Text, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import constants from '@/constants/constants.json';

const AddPin = () => {
    const router = useRouter();
    const { username,latitude, longitude, postType } = useLocalSearchParams();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<string | null>(null);
    const [categories, setCategories] = useState<{ label: string; value: string }[]>([]);
    const [open, setOpen] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const charLimit = 150;

    const API_URI_ADD_PIN = `${constants.API_URI}/api/Pin/AddPin`;
    const API_URI_CATEGORIES = `${constants.API_URI}/api/Category`;

    // Pick an image
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
            setImage(result.assets[0].base64 || null);
        }
    };

    // Handle changes in the description text field and count characters
    const handleDescriptionChange = (text: string) => {
        if (text.length <= charLimit) {
            setDescription(text);
            setCharCount(text.length);
        } else {
            Alert.alert('Character Limit Reached', `You can only enter up to ${charLimit} characters.`);
        }
    };

    // Fetch categories from API
    const fetchCategories = async () => {
        try {
            const response = await axios.get(API_URI_CATEGORIES);
            const formattedCategories = response.data.map((category: string) => ({
                label: category,
                value: category,
            }));
            setCategories(formattedCategories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Submit pin
    const handleAddPin = async () => {
        if (!title || !description || !category) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        //setLoading(true);
      
        try {
            const res = '"'+ image + '"';
            console.log(res);
            await axios.post(API_URI_ADD_PIN, 
                {
                    res // Wysłanie obrazu w ciele zapytania
                }, 
                {
                    headers: {
                        'title': title,
                        'description': description,
                        'category': category,
                        'postType': postType,
                        'username': username,
                        'longitude': longitude,  // Wysyłane jako liczba
                        'latitude': latitude,  // Wysyłane jako liczba
                    },
                }
            );
        //    setLoading(false);
            Alert.alert('Success', 'Pin added successfully');
            router.push('/main');
        } catch (error) {
            setLoading(false);
            console.error('Error adding pin:', error);
            Alert.alert('Error', 'Failed to add pin');
        }
    };

    // Render function for FlatList
    const renderItem = ({ item }: { item: string }) => {
        switch (item) {
            case 'title':
                return (
                    <>
                        <Text style={styles.label}>Title:</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Enter title"
                            multiline
                            returnKeyType="done"
                        />
                    </>
                );
            case 'description':
                return (
                    <>
                        <Text style={styles.label}>Description:</Text>
                        <TextInput
                            style={[styles.input, styles.descriptionInput]}
                            value={description}
                            onChangeText={handleDescriptionChange}
                            placeholder="Enter description"
                            multiline
                            returnKeyType="done"
                        />
                        <Text style={styles.charCount}>Character count: {charCount}/{charLimit}</Text>
                    </>
                );
            case 'category':
                return (
                    <>
                        <Text style={styles.label}>Category:</Text>
                        <DropDownPicker
                            open={open}
                            value={category}
                            items={categories}
                            setOpen={setOpen}
                            setValue={setCategory}
                            style={styles.dropdown}
                            placeholder="Select Category"
                            containerStyle={{ width: '100%', height: 50, marginBottom: 20 }}
                        />
                    </>
                );
            case 'image':
                return (
                    <>
                        <Button title="Pick an image" onPress={pickImage} />
                        {image && (
                            <Image
                                source={{ uri: `data:image/jpeg;base64,${image}` }}
                                style={styles.imagePreview}
                            />
                        )}
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={80}  // Zapewnia miejsce na klawiaturę
        >
            <FlatList
                data={['title', 'description', 'image', 'category']}
                renderItem={renderItem}
                keyExtractor={(item) => item}
                contentContainerStyle={styles.scrollViewContent}
                keyboardShouldPersistTaps="handled"
            />
            <View style={styles.buttonContainer}>
                <Button title={loading ? 'Adding Pin...' : 'Submit Pin'} onPress={handleAddPin} disabled={loading} />
                <Button title="Cancel" onPress={() => router.back()} />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    scrollViewContent: {
        padding: 20,
        justifyContent: 'center',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    descriptionInput: {
        height: 150,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    charCount: {
        fontSize: 14,
        color: '#888',
        textAlign: 'right',
        marginBottom: 10,
    },
    dropdown: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 5,
    },
    imagePreview: {
        width: '100%',
        height: 200,
        marginTop: 20,
        marginBottom: 20,
        borderRadius: 10,
    },
    buttonContainer: {
        marginTop: 20,
    },
});

export default AddPin;
