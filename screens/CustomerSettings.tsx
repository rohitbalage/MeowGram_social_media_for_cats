import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Linking, ScrollView } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types'; // Adjust import path

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerSettings'>;

const CustomerSettings: React.FC<Props> = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleSocialMedia = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'Could not open link. Please check your internet connection.');
    }
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Customer Support',
      'Email: support@meowgram.com\nPhone: +1 (800) 555-CATS',
      [{ text: 'OK', style: 'cancel' }]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image 
        source={{ uri: 'https://s6.gifyu.com/images/bb10E.gif' }}
        style={styles.coverImage}
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        {/* Social Connections */}
        <SocialButton
          icon="facebook"
          color="#1877F2"
          text="Facebook"
          onPress={() => handleSocialMedia('https://facebook.com/meowgram')}
        />

        <SocialButton
          icon="instagram"
          color="#E4405F"
          text="Instagram"
          onPress={() => handleSocialMedia('https://instagram.com/meowgram')}
        />

        {/* Support Section */}
        <SocialButton
          icon="headset"
          color="#FFA500"
          text="24/7 Customer Support"
          onPress={handleContactSupport}
        />

        <SocialButton
          icon="heart-outline"
          color="#FF4444"
          text="Support Cat Shelters"
          onPress={() => handleSocialMedia('https://donate.meowgram.com')}
        />

        {/* Cat Management */}
        <SocialButton
          icon="cat"
          color="#4CAF50"
          text="Add Your Cat"
          onPress={() => navigation.navigate('AddYourCats')}
        />

        {/* Shopping */}
        <SocialButton
          icon="shopping"
          color="#4CAF50"
          text="Official Merchandise"
          onPress={() => handleSocialMedia('https://shop.meowgram.com')}
        />

        {/* Account Management */}
        <SocialButton
          icon="account-cog"
          color="#FFA500"
          text="Account Settings"
          onPress={() => navigation.navigate('AccountSettings')}
        />

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
};

// Reusable Social Button Component
const SocialButton: React.FC<{
  icon: string;
  color: string;
  text: string;
  onPress: () => void;
}> = ({ icon, color, text, onPress }) => (
  <TouchableOpacity style={styles.optionItem} onPress={onPress}>
    <Icon name={icon} size={24} color={color} />
    <Text style={styles.optionText}>{text}</Text>
  </TouchableOpacity>
);

// Styles remain the same as original
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

export default CustomerSettings;