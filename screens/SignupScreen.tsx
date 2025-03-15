import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, storage } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  CustomerDashboard: undefined;  
};

type NavigationProp = StackNavigationProp<AuthStackParamList, 'Signup'>;

const catBreeds = [
  'Siamese',
  'Persian',
  'Maine Coon',
  'Ragdoll',
  'Bengal',
  'Abyssinian',
  'Sphynx',
  'British Shorthair',
  'Scottish Fold',
  'Russian Blue'
];

const SignupScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [preferredCatType, setPreferredCatType] = useState<string | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectProfilePicture = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (!result.didCancel && result.assets?.[0]?.uri) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword || !name || !address || !preferredCatType) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Upload image
      let profilePicURL = '';
      if (profilePic && user) {
        const response = await fetch(profilePic);
        const blob = await response.blob();
        const storageRef = ref(storage, `customer_profiles/${user.uid}`);
        await uploadBytes(storageRef, blob);
        profilePicURL = await getDownloadURL(storageRef);
      }

      // Create Firestore document
      await setDoc(doc(db, 'Customers', user.uid), {
        cid: user.uid,
        name,
        email,
        address,
        preferredCatType,
        profilePicURL,
        createdAt: new Date(),
      });

      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('CustomerDashboard');
      
    } catch (error: any) {
      console.error('Signup error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Customer Account</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={selectProfilePicture}>
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.profileImage} />
        ) : (
          <Text style={styles.imagePickerText}>Add Profile Picture</Text>
        )}
      </TouchableOpacity>

      <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={preferredCatType}
          onValueChange={setPreferredCatType}
          style={styles.picker}
          dropdownIconColor="#FFA500"
        >
          <Picker.Item label="Select Preferred Cat Type" value={null} />
          {catBreeds.map(breed => (
            <Picker.Item key={breed} label={breed} value={breed} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Sign Up'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 25,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFA500',
    textAlign: 'center',
    marginBottom: 30,
  },
  imagePicker: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePickerText: {
    color: '#666',
    fontSize: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#FFA500',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SignupScreen;