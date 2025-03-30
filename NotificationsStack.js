import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import NotificationsScreen from "../screens/Notifications/NotificationsScreen";
import NotificationDetailsScreen from "../screens/Notifications/NotificationDetailsScreen";

const Stack = createStackNavigator();

const NotificationsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: "Thông báo" }} />
      <Stack.Screen name="NotificationDetails" component={NotificationDetailsScreen} options={{ title: "Chi tiết thông báo" }} />
    </Stack.Navigator>
  );
};

export default NotificationsStack;