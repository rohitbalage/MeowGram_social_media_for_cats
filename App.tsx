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

const Stack = createStackNavigator();

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
