import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  Platform,
  PermissionsAndroid 
} from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App'; // Adjust import path
import { db, storage } from '../firebase';
import Icon from 'react-native-vector-icons/MaterialIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'AddYourCats'>;

interface CatForm {
  catName: string;
  breed: string;
  color: string;
  vaccinated: string;
  ageYears: string;
  ageMonths: string;
  favoriteToy: string;
  gender: string;
  datingPreference: string;
  location: string;
  favoriteActivity: string;
  favoriteFood: string;
}

const AddYourCats = ({ navigation }: Props) => {
  const auth = getAuth();
  const user = auth.currentUser;
  const userId = user?.uid;

  const [form, setForm] = useState<CatForm>({
    catName: '',
    breed: '',
    color: '',
    vaccinated: 'yes',
    ageYears: '',
    ageMonths: '',
    favoriteToy: '',
    gender: 'male',
    datingPreference: 'both',
    location: '',
    favoriteActivity: '',
    favoriteFood: ''
  });

  const [catImages, setCatImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: "Storage Permission",
            message: "App needs access to your photos",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    }
    return true;
  };

  const handleImageUpload = async () => {
    if (!userId) {
      Alert.alert('Authentication Required', 'Please login to upload cat photos');
      return;
    }

    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Storage access is required to upload images');
      return;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 5,
        includeBase64: false,
      });

      if (result.didCancel) return;
      if (result.errorMessage) {
        throw new Error(result.errorMessage);
      }

      if (!result.assets || result.assets.length === 0) {
        throw new Error('No images selected');
      }

      setIsLoading(true);
      const uploadPromises = result.assets.map(async (asset) => {
        if (!asset.uri) return null;

        const filename = asset.uri.split('/').pop();
        const storageRef = ref(storage, `cats/${userId}/${Date.now()}_${filename}`);
        
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        
        await uploadBytes(storageRef, blob);
        return getDownloadURL(storageRef);
      });

      const urls = await Promise.all(uploadPromises);
      const validUrls = urls.filter(url => url !== null) as string[];
      
      setCatImages(prev => [...prev, ...validUrls]);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const requiredFields = ['catName', 'breed', 'color', 'location'];
    const missingFields = requiredFields.filter(field => !form[field as keyof CatForm]);

    if (missingFields.length > 0) {
      Alert.alert('Missing Information', `Please fill in: ${missingFields.join(', ')}`);
      return false;
    }

    if (catImages.length === 0) {
      Alert.alert('Photos Required', 'Please upload at least one cat photo');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !userId) return;

    try {
      setIsLoading(true);
      const catData = {
        ...form,
        catImages,
        createdAt: new Date().toISOString(),
        ownerId: userId,
        ageYears: parseInt(form.ageYears) || 0,
        ageMonths: parseInt(form.ageMonths) || 0,
      };

      await setDoc(doc(db, 'cats', userId), catData);
      Alert.alert('Success', 'Cat profile saved successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save cat profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Image Upload Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cat Photos (Required)</Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleImageUpload}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Icon name="photo-camera" size={24} color="white" />
              <Text style={styles.buttonText}>Add Photos</Text>
            </>
          )}
        </TouchableOpacity>
        
        <View style={styles.imageGrid}>
          {catImages.map((uri, index) => (
            <Image
              key={index}
              source={{ uri }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ))}
        </View>
      </View>

      {/* Cat Information Form */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cat Details</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Cat Name *"
          value={form.catName}
          onChangeText={text => setForm(prev => ({...prev, catName: text}))}
        />

        <TextInput
          style={styles.input}
          placeholder="Breed *"
          value={form.breed}
          onChangeText={text => setForm(prev => ({...prev, breed: text}))}
        />

        <TextInput
          style={styles.input}
          placeholder="Color *"
          value={form.color}
          onChangeText={text => setForm(prev => ({...prev, color: text}))}
        />

        <TextInput
          style={styles.input}
          placeholder="Location *"
          value={form.location}
          onChangeText={text => setForm(prev => ({...prev, location: text}))}
        />

        <View style={styles.row}>
          <TextInput
            style={styles.ageInput}
            placeholder="Years"
            keyboardType="numeric"
            value={form.ageYears}
            onChangeText={text => setForm(prev => ({
              ...prev,
              ageYears: text.replace(/[^0-9]/g, '')
            }))}
          />
          <TextInput
            style={styles.ageInput}
            placeholder="Months"
            keyboardType="numeric"
            value={form.ageMonths}
            onChangeText={text => setForm(prev => ({
              ...prev,
              ageMonths: text.replace(/[^0-9]/g, '')
            }))}
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Favorite Toy"
          value={form.favoriteToy}
          onChangeText={text => setForm(prev => ({...prev, favoriteToy: text}))}
        />

        <TextInput
          style={styles.input}
          placeholder="Favorite Activity"
          value={form.favoriteActivity}
          onChangeText={text => setForm(prev => ({...prev, favoriteActivity: text}))}
        />

        <TextInput
          style={styles.input}
          placeholder="Favorite Food"
          value={form.favoriteFood}
          onChangeText={text => setForm(prev => ({...prev, favoriteFood: text}))}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Save Cat Profile</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#2c3e50',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  ageInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#ecf0f1',
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AddYourCats;