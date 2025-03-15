// MerchantProfile.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator } from 'react-native';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface MerchantDetails {
  storeName: string;
  profilePicURL: string;
  coverPicURL?: string;
  storeDesc?: string;
  email?: string;
}

interface CatPicture {
  id: string;
  url: string;
}

const MerchantProfile = ({ route }) => {
  const { merchantId } = route.params;
  const [merchant, setMerchant] = useState<MerchantDetails | null>(null);
  const [catPictures, setCatPictures] = useState<CatPicture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch merchant details
        const merchantRef = doc(db, 'merchants', merchantId);
        const merchantSnap = await getDoc(merchantRef);
        
        if (merchantSnap.exists()) {
          setMerchant(merchantSnap.data() as MerchantDetails);
        }

        // Fetch cat pictures
        const q = query(
          collection(db, 'CatPictures'),
          where('mid', '==', merchantId)
        );
        
        const querySnapshot = await getDocs(q);
        const pictures: CatPicture[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.catpictures && Array.isArray(data.catpictures)) {
            data.catpictures.forEach((url: string, index: number) => {
              pictures.push({
                id: `${doc.id}-${index}`,
                url
              });
            });
          }
        });

        setCatPictures(pictures);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [merchantId]);

  if (loading || !merchant) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.container}>
          <Image
            source={{ uri: merchant.coverPicURL || 'https://via.placeholder.com/400' }}
            style={styles.coverImage}
            resizeMode="cover"
          />
          
          <View style={styles.profileSection}>
            <Image
              source={{ uri: merchant.profilePicURL }}
              style={styles.profileImage}
            />
            <Text style={styles.storeName}>{merchant.storeName}</Text>
            {merchant.storeDesc && (
              <Text style={styles.storeDesc}>{merchant.storeDesc}</Text>
            )}
          </View>

          <Text style={styles.sectionHeader}>Cat Pictures</Text>
        </View>
      }
      data={catPictures}
      numColumns={2}
      renderItem={({ item }) => (
        <Image 
          source={{ uri: item.url }}
          style={styles.catImage}
          resizeMode="cover"
        />
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.gridContainer}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImage: {
    height: 200,
    width: '100%',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: -50,
    paddingHorizontal: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  storeDesc: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
    margin: 20,
    color: '#333',
  },
  gridContainer: {
    paddingHorizontal: 10,
  },
  catImage: {
    width: '48%',
    height: 180,
    margin: '1%',
    borderRadius: 10,
  },
});

export default MerchantProfile;