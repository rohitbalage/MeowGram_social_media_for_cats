// screens/SignupScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { auth, db, storage } from '../firebase';
import { launchImageLibrary } from 'react-native-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import firestore from '@react-native-firebase/firestore';

type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

type SignupScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Signup'>;

interface Props {
  navigation: SignupScreenNavigationProp;
}

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

const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [preferredCatType, setPreferredCatType] = useState<string | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectProfilePicture = async () => {
    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      });

      if (response.assets?.[0]?.uri) {
        setProfilePic(response.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select profile picture');
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
      
      // Create user with email/password
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      let profilePicURL = '';
      if (profilePic && user) {
        // Upload profile picture to storage
        const storageReference = storage().ref(`customer_profiles/${user.uid}`);
        await storageReference.putFile(profilePic);
        profilePicURL = await storageReference.getDownloadURL();
      }

      // Create user document in Firestore
      await db()
        .collection('Customers')
        .doc(user.uid)
        .set({
          cid: user.uid,
          name: name,
          email: email,
          address: address,
          preferredCatType: preferredCatType,
          profilePicURL: profilePicURL,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('Login');
    } catch (error: any) {
      let errorMessage = 'Registration failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email address is already in use!';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format!';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters!';
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Customer Account</Text>

      <TouchableOpacity style={styles.profilePicContainer} onPress={selectProfilePicture}>
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.profilePic} />
        ) : (
          <Text style={styles.profilePicText}>Add Profile Picture</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#666"
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="#666"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#666"
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        placeholderTextColor="#666"
      />

      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
        placeholderTextColor="#666"
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={preferredCatType}
          onValueChange={(itemValue) => setPreferredCatType(itemValue)}
          style={styles.picker}
          dropdownIconColor="#FFA500"
          mode="dropdown"
        >
          <Picker.Item 
            label="Select Preferred Cat Type" 
            value={null}
            enabled={false}
            style={styles.pickerHeaderItem}
          />
          {catBreeds.map((breed) => (
            <Picker.Item 
              key={breed} 
              label={breed} 
              value={breed}
              style={styles.pickerItem}
            />
          ))}
        </Picker>
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Already have an account? Login here</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Keep all the StyleSheet definitions exactly the same
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFA500',
    textAlign: 'center',
    marginBottom: 20,
  },
  profilePicContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0f0f0',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  profilePic: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
  },
  profilePicText: {
    color: '#FFA500',
    textAlign: 'center',
    fontSize: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#fff',
  },
  pickerHeaderItem: {
    color: '#999',
    fontSize: 16,
  },
  pickerItem: {
    color: '#333',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FFA500',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  link: {
    color: '#FFA500',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SignupScreen;