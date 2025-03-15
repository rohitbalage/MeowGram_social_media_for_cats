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
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';
import { collection, query, orderBy, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

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
}

type RootStackParamList = {
  Payment: { price: number; total: number };
};

const { width: screenWidth } = Dimensions.get('window');

const ImageItem = ({ uri }: { uri: string }) => {
  const [imageLoading, setImageLoading] = useState(true);

  if (!uri?.startsWith('http')) {
    return null;
  }

  return (
    <View style={styles.imageContainer}>
      {imageLoading && (
        <ActivityIndicator style={styles.loadingIndicator} color="#FFA500" />
      )}
      <Image
        source={{ uri }}
        style={styles.postImage}
        resizeMode="cover"
        onLoadEnd={() => setImageLoading(false)}
        onError={() => setImageLoading(false)}
      />
    </View>
  );
};

const PaginationDots = ({ count, activeIndex }: { count: number; activeIndex: number }) => {
  if (count <= 1) return null;
  
  return (
    <View style={styles.paginationContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            index === activeIndex && styles.activeDot
          ]}
        />
      ))}
    </View>
  );
};

const CustomerFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [merchants, setMerchants] = useState<{ [key: string]: Merchant }>({});
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [activeIndices, setActiveIndices] = useState<{ [key: string]: number }>({});

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
          if (!data.catpictures) return;
          
          merchantIds.add(data.mid);
          postsData.push({
            id: doc.id,
            catpictures: data.catpictures.filter((url: string) => url?.startsWith('http')),
            createdAt: data.createdAt,
            mid: data.mid,
            price: Number(data.price) || 0
          });
        });

        const merchantPromises = Array.from(merchantIds).map(async (mid) => {
          const merchantRef = doc(db, 'merchants', mid);
          const merchantSnap = await getDoc(merchantRef);
          return { mid, data: merchantSnap.data() as Merchant };
        });

        const merchantResults = await Promise.all(merchantPromises);
        merchantResults.forEach(({ mid, data }) => {
          if (data) merchantsData[mid] = data;
        });

        setMerchants(merchantsData);
        setPosts(postsData);
      } catch (error) {
        Alert.alert('Error', 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleScroll = (postId: string) => 
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const contentOffsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffsetX / screenWidth);
      setActiveIndices(prev => ({ ...prev, [postId]: index }));
    };

  const renderPostItem = ({ item }: { item: Post }) => {
    const merchant = merchants[item.mid] || { storeName: 'Unknown Store' };
    const activeIndex = activeIndices[item.id] || 0;

    return (
      <View style={styles.postContainer}>
        {/* Store Header */}
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: merchant.profilePicURL || 'https://via.placeholder.com/40' }}
            style={styles.profileImage}
          />
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>{merchant.storeName}</Text>
            {merchant.storeDesc && (
              <Text style={styles.storeDesc}>{merchant.storeDesc}</Text>
            )}
          </View>
        </View>

        {/* Image Carousel */}
        <View>
          <FlatList
            horizontal
            pagingEnabled
            data={item.catpictures}
            keyExtractor={(_, index) => `${item.id}-${index}`}
            renderItem={({ item }) => <ImageItem uri={item} />}
            showsHorizontalScrollIndicator={false}
            style={styles.carousel}
            onScroll={handleScroll(item.id)}
            scrollEventThrottle={16}
          />
          <PaginationDots 
            count={item.catpictures.length} 
            activeIndex={activeIndex} 
          />
        </View>

        {/* Price and Actions */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>${item.price.toFixed(2)}</Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.buyButton]}
            onPress={() => navigation.navigate('Payment', { 
              price: item.price, 
              total: item.price + 1 
            })}
          >
            <Text style={styles.buttonText}>
              Buy Now (${(item.price + 1).toFixed(2)})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cartButton]}
            onPress={() => Alert.alert('Added to Cart')}
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
  postContainer: {
    backgroundColor: 'white',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    marginHorizontal: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  storeDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  carousel: {
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFA500',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 15,
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
  paginationContainer: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFA500',
  },
});

export default CustomerFeed;