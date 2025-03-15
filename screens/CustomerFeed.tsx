import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { collection, query, orderBy, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// TypeScript interfaces
interface Post {
  id: string;
  catpictures: string[];
  createdAt: any;
  mid: string;
  price: number;
}

interface Merchant {
  storeName: string;
  profilePicURL: string;
  storeDesc?: string;
  email?: string;
  coverPicURL?: string;
}

type RootStackParamList = {
  Payment: { price: number; total: number };
};

const { width: screenWidth } = Dimensions.get('window');

// Separate component for image rendering
const ImageItem = ({ uri }: { uri: string }) => {
  const [imageLoading, setImageLoading] = useState(true);

  if (!uri?.startsWith('http')) {
    console.log('Invalid image URL:', uri);
    return null;
  }

  return (
    <View style={styles.imageContainer}>
      {imageLoading && (
        <ActivityIndicator 
          style={styles.loadingIndicator} 
          color="#FFA500" 
        />
      )}
      <Image
        source={{ uri }}
        style={styles.postImage}
        resizeMode="cover"
        onLoadEnd={() => setImageLoading(false)}
        onError={(error) => 
          console.log('Image load error:', error.nativeEvent.error)
        }
      />
    </View>
  );
};

const CustomerFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [merchants, setMerchants] = useState<{ [key: string]: Merchant }>({});
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const postsQuery = query(collection(db, 'CatPictures'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(postsQuery);
        
        const postsData: Post[] = [];
        const merchantsData: { [key: string]: Merchant } = {};

        const merchantIds = new Set<string>();
        
        querySnapshot.forEach(doc => {
          const data = doc.data();
          if (!data.catpictures || !Array.isArray(data.catpictures)) {
            console.warn(`Post ${doc.id} has invalid catpictures array`);
            return;
          }
          if (data.mid) merchantIds.add(data.mid);
          
          postsData.push({
            id: doc.id,
            catpictures: data.catpictures.filter((url: string) => url?.startsWith('http')),
            createdAt: data.createdAt,
            mid: data.mid,
            price: Number(data.price) || 0
          });
        });

        const merchantPromises = Array.from(merchantIds).map(async (mid) => {
          try {
            const merchantRef = doc(db, 'Merchants', mid);
            const merchantSnap = await getDoc(merchantRef);
            return { mid, data: merchantSnap.data() as Merchant };
          } catch (error) {
            console.error(`Error fetching merchant ${mid}:`, error);
            return null;
          }
        });

        const merchantResults = await Promise.all(merchantPromises);
        merchantResults.forEach(result => {
          if (result?.data) merchantsData[result.mid] = result.data;
        });

        setMerchants(merchantsData);
        setPosts(postsData);
      } catch (error) {
        console.error('Fetch error:', error);
        Alert.alert('Error', 'Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBuy = (price: number) => {
    const total = price + 1;
    navigation.navigate('Payment', { price, total });
  };

  const renderPostItem = ({ item }: { item: Post }) => {
    const merchant = merchants[item.mid] || {} as Merchant;

    if (!item.catpictures?.length) return null;

    return (
      <View style={styles.postContainer}>
        <View style={styles.headerContainer}>
          <Image
            source={{ 
              uri: merchant.profilePicURL?.startsWith('http') 
                ? merchant.profilePicURL 
                : 'https://via.placeholder.com/40'
            }}
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.storeName}>
              {merchant.storeName || 'Unknown Store'}
            </Text>
            {merchant.storeDesc && (
              <Text style={styles.storeDesc}>{merchant.storeDesc}</Text>
            )}
          </View>
        </View>

        <FlatList
          horizontal
          pagingEnabled
          data={item.catpictures}
          keyExtractor={(_, index) => `${item.id}-${index}`}
          renderItem={({ item }) => <ImageItem uri={item} />}
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
        />

        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>${item.price.toFixed(2)}</Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.buyButton]}
            onPress={() => handleBuy(item.price)}
          >
            <Text style={styles.buttonText}>
              Buy Now (${(item.price + 1).toFixed(2)})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cartButton]}
            onPress={() => Alert.alert('Success', 'Item added to cart!')}
          >
            <Text style={styles.buttonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      renderItem={renderPostItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text>No cat pictures available 😿</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  postContainer: {
    backgroundColor: 'white',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  storeDesc: {
    fontSize: 12,
    color: '#666',
    maxWidth: screenWidth - 72,
  },
  carousel: {
    width: screenWidth,
    height: 400,
  },
  imageContainer: {
    width: screenWidth,
    height: 400,
    position: 'relative',
  },
  postImage: {
    width: screenWidth,
    height: 400,
  },
  loadingIndicator: {
    ...StyleSheet.absoluteFillObject,
  },
  priceContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFA500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 15,
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButton: {
    backgroundColor: '#FFA500',
  },
  cartButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default CustomerFeed;