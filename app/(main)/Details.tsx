import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    zdjecia: string;  // base64 encoded image
}

// Typ dla komentarzy
interface Comment {
    id: number;
    username: string;
    description: string;
    likesUp: number;
    likesDown: number;
    zdjecia: string | null;  // base64 encoded image (optional)
    userVoted: boolean; // Nowa właściwość do śledzenia głosów
}

const Details = () => {
    const [userName, setUserName] = useState<string | null>(null);
    const { id,username } = useLocalSearchParams(); // Get the pin ID from URL params
    const [pinDetails, setPinDetails] = useState<PinDetails | null>(null);
    const [userVoted, setUserVoted] = useState(false); // Czy użytkownik już głosował
    const [comments, setComments] = useState<Comment[]>([]);  // Stan na komentarze
    const [loading, setLoading] = useState(true); // Stan ładowania pinDetails
    const [commentsLoading, setCommentsLoading] = useState(true); // Stan ładowania komentarzy
    const router = useRouter();
    const API_URI_PIN_DETAILS = `${constants.API_URI}/api/Pin/details?postId=${id}`;
    const API_URI_VOTE_POST = `${constants.API_URI}/api/Pin/votePost`;
    const API_URI_VOTE_COMMENTS = `${constants.API_URI}/api/Pin/voteComment`;
    const API_URI_COMMENTS = `${constants.API_URI}/api/Comment?postId=${id}`;

    useEffect(() => {
        const loadUserName = async () => {
            const storedUserName = await AsyncStorage.getItem('username');
            setUserName(storedUserName);
        };

        if (id) {
            loadUserName(); // Załaduj userName
            fetchPinDetails();
            fetchComments();  // Pobierz komentarze po załadowaniu strony
        }
    }, [id]);

    const fetchPinDetails = async () => {
        try {
            const response = await axios.get(API_URI_PIN_DETAILS);
            setPinDetails(response.data);
        } catch (error) {
            console.error('Error fetching pin details:', error);
        } finally {
            setLoading(false); // Ustaw loading na false po zakończeniu
        }
    };

    // Funkcja do pobierania komentarzy
    const fetchComments = async () => {
        try {
            const response = await axios.get(API_URI_COMMENTS);
            // Dodaj właściwość userVoted do każdego komentarza
            const commentsWithVoteStatus = response.data.map((comment: Comment) => ({
                ...comment,
                userVoted: false, // domyślnie nie głosował
            }));
            setComments(commentsWithVoteStatus);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setCommentsLoading(false); // Ustaw loading na false po zakończeniu
        }
    };

    // Funkcja do głosowania na komentarz
    const voteComment = async (commentId: number, voteType: string) => {
        try {
            const commentIndex = comments.findIndex(comment => comment.id === commentId);
            await axios.post(API_URI_VOTE_COMMENTS, { 
                usernName: userName,
                commentId: commentId, 
                voteType: voteType,
                voteTimestamp: new Date().toISOString()
            });

            // Aktualizacja lokalnego stanu po głosowaniu
            const updatedComments = [...comments];
            if (voteType === 'likeUp') {
                updatedComments[commentIndex].likesUp += 1;
            } else if (voteType === 'likeDown') {
                updatedComments[commentIndex].likesDown += 1;
            }
            updatedComments[commentIndex].userVoted = true;

            setComments(updatedComments);
            fetchComments();
        } catch (error) {
            console.error('Error voting on comment:', error);
        }
    };

    // Funkcja do głosowania
    const vote = async (voteType: string) => {
        try {
            await axios.post(API_URI_VOTE_POST, { 
                pinId: id, 
                usernName: userName,
                voteType: voteType,
                voteTimestamp: new Date().toISOString()
            });
            fetchPinDetails();  // Odśwież szczegóły postu po głosie
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </View>
        );
    }

    if (!pinDetails) {
        return <Text>No details available.</Text>;
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>{pinDetails.title}</Text>
                <Text style={styles.author}>By: {pinDetails.userName}</Text>
                <Text style={styles.description}>{pinDetails.description}</Text>
                {pinDetails.zdjecia && (
                    <Image
                        style={styles.image}
                        source={{ uri: `data:image/jpeg;base64,${pinDetails.zdjecia}` }}
                    />
                )}
                <View style={styles.likesContainer}>
                    <TouchableOpacity onPress={() => vote('likeUp')} disabled={userVoted}>
                        <Text style={[styles.likeText, userVoted && styles.disabledText]}>👍 {pinDetails.likesUp}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => vote('likeDown')} disabled={userVoted}>
                        <Text style={[styles.likeText, userVoted && styles.disabledText]}>👎 {pinDetails.likesDown}</Text>
                    </TouchableOpacity>
                </View>
            </View>
    
            {/* Sekcja komentarzy */}
            <Text style={styles.commentsTitle}>Comments</Text>
            {commentsLoading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : comments.length > 0 ? (
                comments.map((comment) => (
                    <View key={comment.id} style={styles.comment}>
                        <Text style={styles.commentUsername}>{comment.username}</Text>
                        <Text style={styles.commentDescription}>{comment.description}</Text>
                        <View style={styles.likesContainer}>
                            <TouchableOpacity onPress={() => voteComment(comment.id, 'likeUp')} disabled={comment.userVoted}>
                                <Text style={[styles.likeText, comment.userVoted && styles.disabledText]}>👍 {comment.likesUp}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => voteComment(comment.id, 'likeDown')} disabled={comment.userVoted}>
                                <Text style={[styles.likeText, comment.userVoted && styles.disabledText]}>👎 {comment.likesDown}</Text>
                            </TouchableOpacity>
                        </View>
                        {comment.zdjecia && (
                            <Image
                                style={styles.commentImage}
                                source={{ uri: `data:image/jpeg;base64,${comment.zdjecia}` }}
                            />
                        )}
                    </View>
                ))
            ) : (
                <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
            )}
    
            {/* Dodany przycisk do dodawania komentarzy */}
            <Button title="Add Comment" onPress={() => router.push(`/addPage?id=${id}&username=${username}`)} />
    
            <Button title="Back" onPress={() => router.back()} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20, 
        backgroundColor: '#f9f9f9' 
    },
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    disabledText: { 
        color: '#ccc' 
    },
    card: { 
        backgroundColor: '#fff', 
        borderRadius: 10, 
        padding: 20, 
        marginBottom: 20, 
        shadowColor: '#000', 
        shadowOpacity: 0.1, 
        shadowRadius: 5, 
        elevation: 1 
    },
    title: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: '#333', 
        marginBottom: 10 
    },
    author: { 
        fontSize: 16, 
        color: '#777', 
        marginBottom: 10 
    },
    description: { 
        fontSize: 18, 
        color: '#555', 
        lineHeight: 24, 
        marginBottom: 20 
    },
    image: { 
        width: '100%', 
        height: 200, 
        borderRadius: 10, 
        marginBottom: 20 
    },
    likesContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginTop: 10 
    },
    likeText: { 
        fontSize: 16, 
        color: '#555' 
    },
    commentsTitle: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        color: '#333', 
        marginBottom: 15 
    },
    comment: { 
        backgroundColor: '#fff', 
        borderRadius: 10, 
        padding: 15, 
        marginBottom: 15, 
        shadowColor: '#000', 
        shadowOpacity: 0.05, 
        shadowRadius: 5, 
        elevation: 1 
    },
    commentUsername: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: '#333' 
    },
    commentDescription: { 
        fontSize: 14, 
        color: '#555', 
        marginBottom: 10 
    },
    commentImage: { 
        width: '100%', 
        height: 100, 
        borderRadius: 10, 
        marginTop: 10 
    },
    noCommentsText: { 
        fontSize: 16, 
        color: '#888', 
        textAlign: 'center' 
    },
});

export default Details;
