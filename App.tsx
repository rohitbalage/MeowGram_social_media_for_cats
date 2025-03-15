/**
 * Meowgram - Cat Pictures App
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import CustomerCart from './screens/CustomerCart';
import CustomerDashboard from './screens/CustomerDashboard';
import CustomerFeed from './screens/CustomerFeed';
import CustomerStores from './screens/CustomerStores';
import PaymentScreen from './screens/PaymentScreen';
import MerchantProfile from './screens/MerchantProfile';

// Define your root stack param list
type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  CustomerCart: undefined;
  CustomerDashboard: undefined;
  CustomerFeed: undefined;
  CustomerStores: undefined;
  Payment: { price: number; total: number };
  MerchantProfile: { merchantId: string };
};
const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="CustomerCart" component={CustomerCart} options= {{gestureEnabled: false}} />
        <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} options= {{gestureEnabled: false}}  />
        <Stack.Screen name="CustomerFeed" component={CustomerFeed} options= {{gestureEnabled: false}}  />
        <Stack.Screen name="CustomerStores" component={CustomerStores} options= {{gestureEnabled: false}} />
        <Stack.Screen 
          name="Payment" 
          component={PaymentScreen}
          options={({ route }) => ({
            title: `Payment - $${route.params.total.toFixed(2)}`
          })}
        />
        <Stack.Screen name="MerchantProfile" component={MerchantProfile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
