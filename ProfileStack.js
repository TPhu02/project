import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SportsListScreen from '../screens/profile/SportsListScreen';
import ActivityHistoryScreen from '../screens/profile/ActivityHistoryScreen';
import LoginScreen from '../screens/profile/LoginScreen';
import RegisterScreen from '../screens/profile/RegisterScreen';
import AddSportScreen from '../screens/profile/AddSportScreen';
import ForgotPasswordScreen from '../screens/profile/ForgotPasswordScreen';
import ResetPasswordScreen from "../screens/profile/ResetPasswordScreen";
import AdminScreen from '../screens/AdminScreen';

const Stack = createStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: "Hồ sơ" }} />
      <Stack.Screen name="Admin" component={AdminScreen} options={{ title: "Quản lý" }} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="AddSport" component={AddSportScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="SportsList" component={SportsListScreen} />
      <Stack.Screen name="ActivityHistory" component={ActivityHistoryScreen} />   
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStack; 
