import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ExploreScreen from '../screens/Explore/ExploreScreen';
import CreateEventScreen from '../screens/Explore/CreateEventScreen';
import EventDetailScreen from '../screens/Explore/EventDetailScreen';
import EditEventScreen from '../screens/Explore/EditEventScreen';

const Stack = createStackNavigator();

export default function ExploreStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ExploreMain"
        component={ExploreScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateEventScreen"
        component={CreateEventScreen}
        options={{ title: "Tạo sự kiện" }}
      />
      <Stack.Screen
        name="EventDetailScreen"
        component={EventDetailScreen}
        options={{ title: "Chi tiết sự kiện" }}
      />
      <Stack.Screen
        name="EditEventScreen"
        component={EditEventScreen}
        options={{ title: "Chỉnh sửa sự kiện" }}
      />
    </Stack.Navigator>
  );
}