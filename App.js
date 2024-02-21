// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";

import React, { useState, useEffect, useCallback } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, TextInput, View, Button } from 'react-native';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyApA1dmKsy8NDpieUVqjFchO3D2ngCI2eI",
  authDomain: "chat-app-63fa8.firebaseapp.com",
  projectId: "chat-app-63fa8",
  storageBucket: "chat-app-63fa8.appspot.com",
  messagingSenderId: "444213135207",
  appId: "1:444213135207:web:38d3e59206d3bf2777d1c2"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore();

const chatsRef = collection(db, 'chats');

export default function App() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    readUser();
    const q = query(chatsRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesFirestore = querySnapshot.docs.map((doc) => {
        const message = doc.data();
        return {
          ...message,
          _id: doc.id, // Assign a unique ID for each message
          createdAt: message.createdAt.toDate(),
        };
      });
      appendMessages(messagesFirestore);
    });
    return unsubscribe;
  }, []);
  

  const appendMessages = useCallback((messages) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, messages));
  }, []);

  async function readUser() {
    const user = await AsyncStorage.getItem('user');
    if (user) {
      setUser(JSON.parse(user));
    }
  }

  async function handlePress() {
    const _id = Math.random().toString(36).substring(7);
    const newUser = { _id, name };
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  }

  async function handleSend(messages) {
    const writes = messages.map((m) => addDoc(chatsRef, m));
    await Promise.all(writes);
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />
        <Button onPress={handlePress} title="Enter the chat" />
      </View>
    );
  }
  return <GiftedChat messages={messages} user={user} onSend={handleSend}  />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  input: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    padding: 15,
    marginBottom: 20,
    borderColor: 'gray',
  },
});
