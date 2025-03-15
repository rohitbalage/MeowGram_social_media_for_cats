// CustomerDashboard.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FeedScreen from '../screens/CustomerFeed';
import StoresScreen from '../screens/CustomerStores';
import CartScreen from '../screens/CustomerCart';
import SettingsScreen from '../screens/CustomerSettings';

const Tab = createBottomTabNavigator();

const CustomerDashboard = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#FFA500', 
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Feed':
              iconName = 'view-list';  // Official Material Community Icon name
              break;
            case 'Stores':
              iconName = 'store';
              break;
            case 'Cart':
              iconName = 'cart';
              break;
            case 'Settings':
              iconName = 'cog';
              break;
            default:
              iconName = 'alert-circle';
          }

          return (
            <MaterialCommunityIcons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{ title: 'Feed' }}
      />
      <Tab.Screen
        name="Stores"
        component={StoresScreen}
        options={{ title: 'Stores' }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: 'Cart' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

export default CustomerDashboard;
