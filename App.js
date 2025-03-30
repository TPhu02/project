import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/Ionicons";

// Import màn hình
import HomeScreen from "./screens/home/HomeScreen";
import PlayerDetailScreen from "./screens/home/PlayerDetailScreen"; // Thêm màn hình chi tiết
import ExploreStack from "./navigation/ExploreStack";
import ProfileStack from "./navigation/ProfileStack";
import FriendStack from "./navigation/FriendStack";
import NotificationsStack from "./navigation/NotificationsStack";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tạo HomeStack cho tab Home
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: "Trang chủ", headerShown: false }} // Ẩn header để tab hiển thị rõ hơn
      />
      <Stack.Screen
        name="PlayerDetail"
        component={PlayerDetailScreen}
        options={{ title: "Chi tiết người chơi" }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Explore") {
              iconName = focused ? "compass" : "compass-outline";
            } else if (route.name === "Friends") {
              iconName = focused ? "people" : "people-outline";
            } else if (route.name === "Notifications") {
              iconName = focused ? "notifications" : "notifications-outline";
            } else if (route.name === "Profile") {
              iconName = focused ? "person" : "person-outline";
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#007bff",
          tabBarInactiveTintColor: "#999",
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopWidth: 0,
            height: 60,
            paddingBottom: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 5,
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: "bold" },
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} options={{ title: "Trang chủ" }} />
        <Tab.Screen name="Explore" component={ExploreStack} options={{ title: "Khám phá" }} />
        <Tab.Screen name="Friends" component={FriendStack} options={{ title: "Bạn bè" }} />
        <Tab.Screen name="Notifications" component={NotificationsStack} options={{ title: "Thông báo" }} />
        <Tab.Screen name="Profile" component={ProfileStack} options={{ title: "Hồ sơ" }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}