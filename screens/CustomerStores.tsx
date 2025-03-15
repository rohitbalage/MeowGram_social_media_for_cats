import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

interface Merchant {
  id: string;
  storeName: string;
  profilePicURL: string;
  coverPicURL?: string;
  storeDesc?: string;
}

type RootStackParamList = {
  MerchantProfile: { merchantId: string };
};

const CustomerStores = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('[DEBUG] Starting merchants fetch...');
        
        const querySnapshot = await getDocs(collection(db, 'merchants'));
        console.log(`[DEBUG] Received ${querySnapshot.size} merchant documents`);
        
        if (querySnapshot.empty) {
          console.log('[DEBUG] No merchants found in collection');
          setError('No stores available');
          return;
        }

        const merchantsData: Merchant[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`[DEBUG] Processing merchant ${doc.id}:`, data);

          if (!data.storeName) {
            console.warn(`[WARNING] Merchant ${doc.id} missing storeName`);
          }

          merchantsData.push({
            id: doc.id,
            storeName: data.storeName || 'Unnamed Store',
            profilePicURL: data.profilePicURL || 'https://placekitten.com/200/200',
            coverPicURL: data.coverPicURL,
            storeDesc: data.storeDesc
          });
        });

        console.log('[DEBUG] Processed merchants:', merchantsData);
        setMerchants(merchantsData);
        
      } catch (error) {
        console.error('[ERROR] Fetch failed:', error);
        setError('Failed to load stores. Please try again.');
        Alert.alert('Error', 'Could not connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchMerchants();
  }, []);

  const renderMerchantItem = ({ item }: { item: Merchant }) => (
    <TouchableOpacity 
      style={styles.cardContainer}
      onPress={() => navigation.navigate('MerchantProfile', { merchantId: item.id })}
    >
      {/* Cover Image */}
      {item.coverPicURL ? (
        <Image 
          source={{ uri: item.coverPicURL }}
          style={styles.coverImage}
          resizeMode="cover"
          onError={() => console.log(`[ERROR] Failed to load cover for ${item.id}`)}
        />
      ) : (
        <View style={[styles.coverImage, styles.coverPlaceholder]}>
          <Text style={styles.placeholderText}>No Cover Image</Text>
        </View>
      )}
      
      {/* Profile Section */}
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: item.profilePicURL }}
          style={styles.profileImage}
          onError={() => console.log(`[ERROR] Failed to load profile for ${item.id}`)}
        />
        <View style={styles.textContainer}>
          <Text style={styles.storeName} numberOfLines={1}>
            {item.storeName}
          </Text>
          {item.storeDesc && (
            <Text style={styles.storeDesc} numberOfLines={2}>
              {item.storeDesc}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FFA500" />
        <Text style={styles.loadingText}>Loading Stores...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => setLoading(true)}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={merchants}
      renderItem={renderMerchantItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      ListEmptyComponent={
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No Stores Found</Text>
        </View>
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  emptyText: {
    color: '#6c757d',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
  },
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  coverImage: {
    height: 160,
    width: '100%',
  },
  coverPlaceholder: {
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#6c757d',
    fontSize: 14,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: 'white',
  },
  textContainer: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  storeDesc: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 18,
  },
});

export default CustomerStores;