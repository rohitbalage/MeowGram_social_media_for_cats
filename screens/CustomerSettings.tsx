import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Linking, ScrollView } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function CustomerSettings({ navigation }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const openSocialMedia = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open link');
    });
  };

  const contactSupport = () => {
    Alert.alert(
      'Customer Support',
      'Email: support@meowgram.com\nPhone: +1 (800) 555-CATS',
      [
        { text: 'OK', style: 'cancel' }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image 
        source={{ uri: 'https://s6.gifyu.com/images/bb10E.gif' }} // Replace with actual URL
        style={styles.coverImage}
      />
      
      <View style={styles.content}>
        {/* Social Media Links */}
        <TouchableOpacity 
          style={styles.optionItem}
          onPress={() => openSocialMedia('https://facebook.com/meowgram')}
        >
          <Icon name="facebook" size={24} color="#1877F2" />
          <Text style={styles.optionText}>Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.optionItem}
          onPress={() => openSocialMedia('https://instagram.com/meowgram')}
        >
          <Icon name="instagram" size={24} color="#E4405F" />
          <Text style={styles.optionText}>Instagram</Text>
        </TouchableOpacity>

        {/* Contact Support */}
        <TouchableOpacity 
          style={styles.optionItem}
          onPress={contactSupport}
        >
          <Icon name="headset" size={24} color="#FFA500" />
          <Text style={styles.optionText}>24/7 Customer Support</Text>
        </TouchableOpacity>

        {/* Donation */}
        <TouchableOpacity 
          style={styles.optionItem}
          onPress={() => openSocialMedia('https://donate.meowgram.com')}
        >
          <Icon name="heart-outline" size={24} color="#FF4444" />
          <Text style={styles.optionText}>Support Cat Shelters</Text>
        </TouchableOpacity>

        {/* Merchandise */}
        <TouchableOpacity 
          style={styles.optionItem}
          onPress={() => openSocialMedia('https://shop.meowgram.com')}
        >
          <Icon name="shopping" size={24} color="#4CAF50" />
          <Text style={styles.optionText}>Official Merchandise</Text>
        </TouchableOpacity>

        {/* Account Settings */}
        <TouchableOpacity 
          style={styles.optionItem}
          onPress={() => navigation.navigate('AccountSettings')}
        >
          <Icon name="account-cog" size={24} color="#FFA500" />
          <Text style={styles.optionText}>Account Settings</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity 
          style={[styles.optionItem, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Icon name="logout" size={24} color="#FF4444" />
          <Text style={[styles.optionText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  coverImage: {
    width: '100%',
    height: 220,
  },
  content: {
    padding: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 20,
    color: '#333',
  },
  logoutButton: {
    marginTop: 30,
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#FF4444',
    fontWeight: '600',
  },
});